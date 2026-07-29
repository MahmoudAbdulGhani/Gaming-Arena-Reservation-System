import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const date = searchParams.get('date')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')

    if (!roomId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
    }

    const db = await getDb()

    const conflicting = await db
      .collection('bookings')
      .find({
        roomId: new ObjectId(roomId),
        bookingDate: new Date(date),
        status: { $in: ['pending', 'confirmed', 'in_progress'] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      })
      .toArray()

    const bookedDeviceIds = new Set<string>()
    for (const b of conflicting) {
      for (const d of b.deviceIds ?? []) {
        bookedDeviceIds.add(d.toString())
      }
    }

    return NextResponse.json({ bookedDeviceIds: [...bookedDeviceIds] })
  } catch {
    return NextResponse.json({ bookedDeviceIds: [] })
  }
}
