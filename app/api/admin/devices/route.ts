import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDbWithAdminCheck, errorResponse, toJSON } from '@/lib/admin-helper'

export async function GET(request: Request) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const devices = await db.collection('devices').find().sort({ deviceLabel: 1 }).toArray()
    return NextResponse.json(devices.map(toJSON))
  } catch (error) {
    return errorResponse(error, 401)
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const body = await request.json()
    const { roomId, deviceLabel, status, specs } = body
    if (!roomId || !deviceLabel) {
      return NextResponse.json({ error: 'roomId and deviceLabel are required' }, { status: 400 })
    }
    const now = new Date()
    const doc = {
      roomId: new ObjectId(roomId),
      deviceLabel,
      status: status ?? 'available',
      specs: specs ?? '',
      createdAt: now,
    }
    const result = await db.collection('devices').insertOne(doc)
    const created = await db.collection('devices').findOne({ _id: result.insertedId })
    return NextResponse.json(toJSON(created!), { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
