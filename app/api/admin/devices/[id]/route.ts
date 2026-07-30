import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDbWithAdminCheck, errorResponse, toJSON } from '@/lib/admin-helper'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const { id } = await params
    const body = await request.json()
    const oid = new ObjectId(id)

    const update: Record<string, unknown> = {}
    const allowedFields = ['deviceLabel', 'status', 'specs', 'roomId']
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = field === 'roomId' ? new ObjectId(body[field]) : body[field]
      }
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const result = await db.collection('devices').findOneAndUpdate(
      { _id: oid },
      { $set: update },
      { returnDocument: 'after' }
    )
    if (!result) return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    return NextResponse.json(toJSON(result))
  } catch (error) {
    return errorResponse(error, 401)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const { id } = await params
    const oid = new ObjectId(id)
    const device = await db.collection('devices').findOne({ _id: oid })
    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    await db.collection('devices').deleteOne({ _id: oid })
    return NextResponse.json({ message: 'Device deleted' })
  } catch (error) {
    return errorResponse(error, 401)
  }
}
