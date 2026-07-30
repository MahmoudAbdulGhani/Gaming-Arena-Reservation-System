import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDbWithAdminCheck, errorResponse, toJSON } from '@/lib/admin-helper'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const { id } = await params
    const oid = new ObjectId(id)

    const booking = await db.collection('bookings').findOne({ _id: oid })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.paymentMethod && booking.paymentMethod !== 'cash') {
      return NextResponse.json({ error: 'Only cash bookings can be approved from this action' }, { status: 400 })
    }

    if (booking.paymentStatus === 'paid' && booking.status === 'confirmed') {
      return NextResponse.json(toJSON(booking))
    }

    const now = new Date()
    const shouldGrantLoyalty = booking.paymentStatus !== 'paid'
    const existingPayment = await db.collection('payments').findOne({ bookingId: oid })
    let paymentId = existingPayment?._id

    if (existingPayment) {
      await db.collection('payments').updateOne(
        { _id: existingPayment._id },
        {
          $set: {
            amount: booking.totalPrice,
            currency: 'usd',
            paymentMethod: 'cash',
            status: 'completed',
            updatedAt: now,
          },
        }
      )
    } else {
      const paymentDoc = {
        bookingId: oid,
        userId: booking.userId,
        amount: booking.totalPrice,
        currency: 'usd',
        paymentMethod: 'cash',
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      }
      const paymentResult = await db.collection('payments').insertOne(paymentDoc)
      paymentId = paymentResult.insertedId
    }

    await db.collection('bookings').updateOne(
      { _id: oid },
      {
        $set: {
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentId,
          updatedAt: now,
        },
      }
    )

    if (shouldGrantLoyalty) {
      await db.collection('users').updateOne(
        { _id: booking.userId },
        { $inc: { loyaltyPoints: 10 } }
      )
    }

    const updated = await db.collection('bookings').findOne({ _id: oid })
    return NextResponse.json(toJSON(updated!))
  } catch (error) {
    return errorResponse(error)
  }
}
