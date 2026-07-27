import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDbWithAdminCheck, errorResponse, toJSON } from '@/lib/admin-helper'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const { id } = await params
    const room = await db.collection('rooms').findOne({ _id: new ObjectId(id) })
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    return NextResponse.json(toJSON(room))
  } catch (error) {
    return errorResponse(error, 401)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const { id } = await params
    const oid = new ObjectId(id)
    const room = await db.collection('rooms').findOne({ _id: oid })
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    await db.collection('rooms').deleteOne({ _id: oid })
    await db.collection('devices').deleteMany({ roomId: oid })
    return NextResponse.json({ message: 'Room and associated devices deleted' })
  } catch (error) {
    return errorResponse(error, 401)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const { id } = await params
    const body = await request.json()
    const oid = new ObjectId(id)

    const update: Record<string, unknown> = { updatedAt: new Date() }
    const allowedFields = ['name', 'type', 'pricePerHour', 'totalDevices', 'status', 'description', 'images']
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field]
      }
    }

    const result = await db.collection('rooms').findOneAndUpdate(
      { _id: oid },
      { $set: update },
      { returnDocument: 'after' }
    )
    if (!result) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    return NextResponse.json(toJSON(result))
  } catch (error) {
    return errorResponse(error, 401)
  }
}
