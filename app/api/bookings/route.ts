import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { errorResponse, toJSON } from '@/lib/admin-helper'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payload = verifyToken(authHeader.slice(7))

    const body = await request.json()
    const { roomId, deviceIds, bookingDate, startTime, durationHours, totalPrice, paymentMethod } = body

    if (!roomId || !bookingDate || !startTime || !durationHours || !totalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = await getDb()
    const endHour = parseInt(startTime.split(':')[0]) + durationHours
    const endTime = `${String(endHour).padStart(2, '0')}:00`

    const booking = {
      userId: new ObjectId(payload.userId),
      roomId: new ObjectId(roomId),
      deviceIds: (deviceIds ?? []).map((id: string) => new ObjectId(id)),
      deviceCount: deviceIds?.length ?? 0,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      durationHours,
      totalPrice,
      status: paymentMethod === 'cash' ? 'pending' : 'confirmed',
      paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'paid',
      paymentMethod: paymentMethod ?? 'card',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('bookings').insertOne(booking)

    if (paymentMethod === 'card' || paymentMethod !== 'cash') {
      await db.collection('payments').insertOne({
        bookingId: result.insertedId,
        userId: new ObjectId(payload.userId),
        amount: totalPrice,
        currency: 'usd',
        paymentMethod: 'card',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    if (deviceIds && deviceIds.length > 0) {
      await db.collection('devices').updateMany(
        { _id: { $in: deviceIds.map((id: string) => new ObjectId(id)) } },
        { $set: { status: 'booked' } }
      )
    }

    if (paymentMethod !== 'cash') {
      await db.collection('users').updateOne(
        { _id: new ObjectId(payload.userId) },
        { $inc: { loyaltyPoints: 10 } }
      )
    }

    const saved = await db.collection('bookings').findOne({ _id: result.insertedId })
    const room = await db.collection('rooms').findOne({ _id: new ObjectId(roomId) })

    const data = {
      ...toJSON(saved as Record<string, unknown>),
      room: room ? {
        _id: room._id.toString(),
        name: room.name,
        type: room.type,
        description: room.description ?? '',
        images: room.images ?? [],
        pricePerHour: room.pricePerHour,
        totalDevices: room.totalDevices,
        status: room.status,
        createdAt: room.createdAt?.toISOString() ?? '',
        updatedAt: room.updatedAt?.toISOString() ?? '',
      } : undefined,
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
