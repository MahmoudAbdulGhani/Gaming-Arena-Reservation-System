import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload: { userId: string; email: string; role: string }
    try {
      payload = verifyToken(authHeader.slice(7))
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const userId = new ObjectId(payload.userId)
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    const todayStr = now.toISOString().split('T')[0]

    const upcomingBookings = await db.collection('bookings').find({
      userId,
      status: { $in: ['confirmed', 'pending'] },
      bookingDate: { $lte: new Date(todayStr) },
      startTime: { $gte: `${String(now.getHours()).padStart(2, '0')}:00`, $lte: `${String(oneHourLater.getHours()).padStart(2, '0')}:00` },
    }).toArray()

    const rooms = await db.collection('rooms').find({}).toArray()
    const roomMap = new Map(rooms.map((r) => [r._id.toString(), r]))

    for (const booking of upcomingBookings) {
      const existing = await db.collection('notifications').findOne({
        userId,
        bookingId: booking._id,
        type: 'reminder',
      })
      if (!existing) {
        const room = roomMap.get(booking.roomId.toString())
        await db.collection('notifications').insertOne({
          userId,
          bookingId: booking._id,
          type: 'reminder',
          title: 'Booking Reminder',
          message: `Your session at ${room?.name || 'the arena'} starts at ${booking.startTime} today!`,
          read: false,
          createdAt: new Date(),
        })
      }
    }

    const notifications = await db.collection('notifications')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()

    const data = notifications.map((n) => ({
      _id: n._id.toString(),
      userId: n.userId.toString(),
      bookingId: n.bookingId?.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt?.toISOString?.() ?? '',
    }))

    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}