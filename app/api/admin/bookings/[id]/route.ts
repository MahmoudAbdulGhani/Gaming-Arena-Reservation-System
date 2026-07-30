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

    const body = await request.json().catch(() => ({}))
    const newStatus = body.status
    const cancellationReason = body.cancellationReason || ''

    if (newStatus === 'cancelled') {
        const now = new Date()

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

        const setFields: Record<string, unknown> = { status: 'cancelled', updatedAt: now }
        if (cancellationReason) setFields.cancellationReason = cancellationReason

        await db.collection('bookings').updateOne(
          { _id: oid },
          { $set: setFields }
        )

        const roomDocName = roomDoc?.name || 'Unknown Room'
        const code = booking._id.toString().slice(-6).toUpperCase()
        const reasonSuffix = cancellationReason ? ` Reason: ${cancellationReason}` : ''
        await db.collection('notifications').insertOne({
          userId: booking.userId,
          bookingId: oid,
          type: 'cancellation',
          title: 'Booking Cancelled',
          message: `Your booking ${code} at ${roomDocName} has been cancelled by an admin.${reasonSuffix}`,
          read: false,
          createdAt: now,
        })

        const updated = await db.collection('bookings').findOne({ _id: oid })
        return NextResponse.json(toJSON(updated!))
      }

    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  } catch (error) {
    return errorResponse(error, 401)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await getDbWithAdminCheck(_request)
    const { id } = await params
    const result = await db.collection('bookings').deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Booking deleted' })
  } catch (error) {
    return errorResponse(error, 401)
  }
}
