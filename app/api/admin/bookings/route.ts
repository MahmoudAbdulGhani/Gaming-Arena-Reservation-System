import { NextResponse } from 'next/server'
import { getDbWithAdminCheck, errorResponse, toJSON } from '@/lib/admin-helper'
import { ObjectId } from 'mongodb'
import { transitionAndFreeDevices } from '@/lib/booking-transitions'

export async function GET(request: Request) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    await transitionAndFreeDevices(db)
    const bookings = await db.collection('bookings').find().sort({ createdAt: -1 }).toArray()

    const roomIds = [...new Set(bookings.map((b) => b.roomId.toString()))]
    const rooms = await db.collection('rooms').find({ _id: { $in: roomIds.map((id) => new ObjectId(id)) } }).toArray()
    const roomMap = new Map(rooms.map((r) => [r._id.toString(), r]))

    const userIds = [...new Set(bookings.map((b) => b.userId.toString()))]
    const users = await db.collection('users').find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } }).toArray()
    const userMap = new Map(users.map((u) => [u._id.toString(), u]))

    const data = bookings.map((b) => {
      const obj = toJSON(b)
      const room = roomMap.get(b.roomId.toString())
      if (room) obj.room = toJSON(room)
      const user = userMap.get(b.userId.toString())
      if (user) obj.user = { name: user.name, email: user.email, phone: user.phone ?? undefined }
      return obj
    })

    return NextResponse.json(data)
  } catch (error) {
    return errorResponse(error, 401)
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const body = await request.json()
    const { userId, roomId, deviceIds, bookingDate, startTime, durationHours, totalPrice, paymentMethod } = body

    if (!userId || !roomId || !bookingDate || !startTime || !durationHours || !totalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const endHour = parseInt(startTime.split(':')[0]) + durationHours
    const endTime = `${String(endHour).padStart(2, '0')}:00`

    const bookingDateObj = new Date(bookingDate)

    // Clean up orphan pending/unpaid booking for the same slot, if any
    const conflicting = await db.collection('bookings').findOne({
      roomId: new ObjectId(roomId),
      bookingDate: bookingDateObj,
      startTime,
    })
    if (conflicting) {
      if ((conflicting.status === 'pending' && conflicting.paymentStatus === 'unpaid') || conflicting.status === 'cancelled') {
        // Reset devices from the orphan booking
        if (conflicting.deviceIds?.length > 0) {
          await db.collection('devices').updateMany(
            { _id: { $in: conflicting.deviceIds } },
            { $set: { status: 'available' } }
          )
        }
        await db.collection('bookings').deleteOne({ _id: conflicting._id })
      } else {
        return NextResponse.json({ error: 'This room is already booked for the selected date and time' }, { status: 409 })
      }
    }

    const roomDoc = await db.collection('rooms').findOne({ _id: new ObjectId(roomId) })
    const isPrivate = roomDoc?.type === 'private'
    let finalDeviceIds: ObjectId[] = (deviceIds ?? []).map((id: string) => new ObjectId(id))
    let finalDeviceCount = finalDeviceIds.length

    if (isPrivate) {
      const allRoomDevices = await db.collection('devices').find({ roomId: new ObjectId(roomId) }).toArray()
      finalDeviceIds = allRoomDevices.map((d) => d._id)
      finalDeviceCount = allRoomDevices.length
    }

    const booking = {
      userId: new ObjectId(userId),
      roomId: new ObjectId(roomId),
      deviceIds: finalDeviceIds,
      deviceCount: finalDeviceCount,
      bookingDate: bookingDateObj,
      startTime,
      endTime,
      durationHours,
      totalPrice,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: paymentMethod ?? 'card',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('bookings').insertOne(booking)

    if (finalDeviceIds.length > 0) {
      await db.collection('devices').updateMany(
        { _id: { $in: finalDeviceIds } },
        { $set: { status: 'booked' } }
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
