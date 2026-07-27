import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json([])
    }

    let payload: { userId: string; email: string; role: string }
    try {
      payload = verifyToken(authHeader.slice(7))
    } catch {
      return NextResponse.json([])
    }

    const db = await getDb()
    const bookings = await db
      .collection('bookings')
      .find({ userId: new ObjectId(payload.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    const roomIds = [...new Set(bookings.map((b) => b.roomId.toString()))]
    const rooms = await db
      .collection('rooms')
      .find({ _id: { $in: roomIds.map((id) => new ObjectId(id)) } })
      .toArray()
    const roomMap = new Map(rooms.map((r) => [r._id.toString(), r]))

    const data = bookings.map((b) => {
      const room = roomMap.get(b.roomId.toString())
      return {
        _id: b._id.toString(),
        userId: b.userId.toString(),
        roomId: b.roomId.toString(),
        room: room
          ? {
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
            }
          : undefined,
        deviceIds: b.deviceIds.map((d: unknown) => (d && typeof d === 'object' ? d.toString() : d)),
        deviceCount: b.deviceCount,
        bookingDate: b.bookingDate?.toISOString?.()?.split('T')[0] ?? b.bookingDate,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: b.durationHours,
        totalPrice: b.totalPrice,
        status: b.status,
        paymentStatus: b.paymentStatus,
        paymentId: b.paymentId ? b.paymentId.toString() : undefined,
        confirmationMessage: b.confirmationMessage,
        createdAt: b.createdAt?.toISOString() ?? '',
        updatedAt: b.updatedAt?.toISOString() ?? '',
      }
    })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}
