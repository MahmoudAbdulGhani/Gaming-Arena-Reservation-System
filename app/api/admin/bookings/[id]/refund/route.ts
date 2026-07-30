import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDbWithAdminCheck, errorResponse, toJSON } from '@/lib/admin-helper'
import stripe from '@/lib/stripe'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const { id } = await params
    const oid = new ObjectId(id)

    const booking = await db.collection('bookings').findOne({ _id: oid })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.paymentStatus !== 'paid') {
      return NextResponse.json({ error: 'Only paid bookings can be refunded' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const reason = body.reason || 'No reason provided'

    const now = new Date()

    // Attempt Stripe refund for card payments
    if (booking.paymentMethod === 'card') {
      try {
        const payment = await db.collection('payments').findOne({ bookingId: oid })
        if (payment?.stripePaymentIntentId) {
          await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId })
        }
      } catch {
        // Stripe refund failed — still proceed with DB refund
      }
    }

    // Reset devices to available
    const roomDoc = await db.collection('rooms').findOne({ _id: booking.roomId })
    if (roomDoc?.type === 'private') {
      const allRoomDevices = await db.collection('devices').find({ roomId: booking.roomId }).toArray()
      const allDeviceIds = allRoomDevices.map((d) => d._id)
      if (allDeviceIds.length > 0) {
        await db.collection('devices').updateMany(
          { _id: { $in: allDeviceIds } },
          { $set: { status: 'available' } }
        )
      }
    } else if (booking.deviceIds?.length > 0) {
      await db.collection('devices').updateMany(
        { _id: { $in: booking.deviceIds.map((id: ObjectId) => new ObjectId(id)) } },
        { $set: { status: 'available' } }
      )
    }

    // Deduct loyalty points (if they were awarded)
    await db.collection('users').updateOne(
      { _id: booking.userId },
      { $inc: { loyaltyPoints: -(10 * booking.durationHours) } }
    )

    // Update existing payment record to refunded
    const existingPayment = await db.collection('payments').findOne({ bookingId: oid })
    if (existingPayment) {
      await db.collection('payments').updateOne(
        { _id: existingPayment._id },
        { $set: { status: 'refunded', refundedAt: now, updatedAt: now } }
      )
    } else {
      // Create refund record if no existing payment found
      const refundDoc = {
        bookingId: oid,
        userId: booking.userId,
        amount: booking.totalPrice,
        currency: 'usd',
        paymentMethod: booking.paymentMethod ?? 'card',
        status: 'refunded',
        refundedAt: now,
        createdAt: now,
        updatedAt: now,
      }
      await db.collection('payments').insertOne(refundDoc)
    }

    // Update booking
    await db.collection('bookings').updateOne(
      { _id: oid },
      {
        $set: {
          paymentStatus: 'refunded',
          status: 'cancelled',
          cancellationReason: reason,
          updatedAt: now,
        },
      }
    )

    const code = booking._id.toString().slice(-6).toUpperCase()
    const roomDocName = roomDoc?.name || 'Unknown Room'
    await db.collection('notifications').insertOne({
      userId: booking.userId,
      bookingId: oid,
      type: 'info',
      title: 'Booking Refunded',
      message: `Your booking ${code} at ${roomDocName} has been refunded. Reason: ${reason}`,
      read: false,
      createdAt: now,
    })

    const updated = await db.collection('bookings').findOne({ _id: oid })
    return NextResponse.json(toJSON(updated!))
  } catch (error) {
    return errorResponse(error)
  }
}
