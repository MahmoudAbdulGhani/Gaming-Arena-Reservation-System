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

    const now = new Date()
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

    await db.collection('bookings').updateOne(
      { _id: oid },
      {
        $set: {
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentId: paymentResult.insertedId,
          updatedAt: now,
        },
      }
    )

    await db.collection('users').updateOne(
      { _id: booking.userId },
      { $inc: { loyaltyPoints: 10 } }
    )

    const updated = await db.collection('bookings').findOne({ _id: oid })
    return NextResponse.json(toJSON(updated!))
  } catch (error) {
    return errorResponse(error)
  }
}
