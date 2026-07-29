import { type Db, ObjectId } from 'mongodb'

export async function transitionAndFreeDevices(db: Db): Promise<void> {
  try {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // confirmed → in_progress (devices stay booked — session active)
    await db.collection('bookings').updateMany(
      {
        status: 'confirmed',
        bookingDate: { $lte: new Date(now.toISOString().split('T')[0]) },
        startTime: { $lte: currentTime },
        endTime: { $gte: currentTime },
      },
      { $set: { status: 'in_progress', updatedAt: new Date() } }
    )

    const toComplete = await db.collection('bookings').find({
      status: { $in: ['confirmed', 'in_progress'] },
      endTime: { $lt: currentTime },
    }).toArray()

    if (toComplete.length === 0) return

    const deviceIdsToFree: ObjectId[] = []
    const privateRoomIds = new Set<string>()

    for (const booking of toComplete) {
      for (const d of booking.deviceIds ?? []) {
        deviceIdsToFree.push(d instanceof ObjectId ? d : new ObjectId(d.toString()))
      }
      const room = await db.collection('rooms').findOne({ _id: booking.roomId })
      if (room?.type === 'private') {
        privateRoomIds.add(booking.roomId.toString())
      }
    }

    if (deviceIdsToFree.length > 0) {
      await db.collection('devices').updateMany(
        { _id: { $in: deviceIdsToFree } },
        { $set: { status: 'available' } }
      )
    }

    for (const roomId of privateRoomIds) {
      const allDevices = await db.collection('devices').find({ roomId: new ObjectId(roomId) }).toArray()
      if (allDevices.length > 0) {
        await db.collection('devices').updateMany(
          { _id: { $in: allDevices.map(d => d._id) } },
          { $set: { status: 'available' } }
        )
      }
    }

    await db.collection('bookings').updateMany(
      { _id: { $in: toComplete.map(b => b._id) } },
      { $set: { status: 'completed', updatedAt: new Date() } }
    )
  } catch {
    // Non-critical — status transitions should never break data fetching
  }
}
