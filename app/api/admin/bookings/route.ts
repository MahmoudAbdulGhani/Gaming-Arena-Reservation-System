import { NextResponse } from 'next/server'
import { getDbWithAdminCheck, errorResponse, toJSON } from '@/lib/admin-helper'

export async function GET() {
  try {
    const request = new Request('http://dummy')
    const { db } = await getDbWithAdminCheck(request)
    const bookings = await db.collection('bookings').find().sort({ createdAt: -1 }).toArray()

    const roomIds = [...new Set(bookings.map((b) => b.roomId.toString()))]
    const rooms = await db.collection('rooms').find({ _id: { $in: roomIds.map((id) => id) } }).toArray()
    const roomMap = new Map(rooms.map((r) => [r._id.toString(), r]))

    const data = bookings.map((b) => {
      const obj = toJSON(b)
      const room = roomMap.get(b.roomId.toString())
      if (room) obj.room = toJSON(room)
      return obj
    })

    return NextResponse.json(data)
  } catch (error) {
    return errorResponse(error, 401)
  }
}
