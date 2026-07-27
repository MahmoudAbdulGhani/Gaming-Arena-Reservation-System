import { NextResponse } from 'next/server'
import { getDbWithAdminCheck, errorResponse, toJSON } from '@/lib/admin-helper'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const { db } = await getDbWithAdminCheck(request)
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
      if (user) obj.user = { name: user.name, email: user.email }
      return obj
    })

    return NextResponse.json(data)
  } catch (error) {
    return errorResponse(error, 401)
  }
}
