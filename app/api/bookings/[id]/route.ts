import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { errorResponse } from '@/lib/admin-helper'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payload = verifyToken(authHeader.slice(7))

    const { id } = await params
    const body = await request.json()
    const db = await getDb()

    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.userId.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const update: Record<string, unknown> = { updatedAt: new Date() }

    if (body.status === 'cancelled') {
      update.status = 'cancelled'
      const roomDoc = await db.collection('rooms').findOne({ _id: booking.roomId })
      if (roomDoc?.type === 'private') {
        // Free ALL devices in the room for private room bookings
        const allRoomDevices = await db.collection('devices').find({ roomId: booking.roomId }).toArray()
        const allDeviceIds = allRoomDevices.map((d) => d._id)
        if (allDeviceIds.length > 0) {
          await db.collection('devices').updateMany(
            { _id: { $in: allDeviceIds } },
            { $set: { status: 'available' } }
          )
        }
      } else if (booking.deviceIds && booking.deviceIds.length > 0) {
        await db.collection('devices').updateMany(
          { _id: { $in: booking.deviceIds } },
          { $set: { status: 'available' } }
        )
      }
    }

    if (body.bookingDate) update.bookingDate = new Date(body.bookingDate)
    if (body.startTime) update.startTime = body.startTime
    if (body.endTime) update.endTime = body.endTime

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    )

    const updated = await db.collection('bookings').findOne({ _id: new ObjectId(id) })
    return NextResponse.json({
      _id: updated!._id.toString(),
      status: updated!.status,
      bookingDate: updated!.bookingDate?.toISOString()?.split('T')[0] ?? updated!.bookingDate,
      startTime: updated!.startTime,
      endTime: updated!.endTime,
      updatedAt: updated!.updatedAt?.toISOString() ?? '',
    })
  } catch (error) {
    return errorResponse(error)
  }
}
