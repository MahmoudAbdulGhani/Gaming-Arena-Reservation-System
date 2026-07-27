import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await getDb()
    const { id } = await params
    const devices = await db
      .collection('devices')
      .find({ roomId: new ObjectId(id) })
      .sort({ deviceLabel: 1 })
      .toArray()
    const data = devices.map((d) => ({
      _id: d._id.toString(),
      roomId: d.roomId.toString(),
      deviceLabel: d.deviceLabel,
      status: d.status,
      specs: d.specs ?? '',
      createdAt: d.createdAt?.toISOString() ?? '',
    }))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
