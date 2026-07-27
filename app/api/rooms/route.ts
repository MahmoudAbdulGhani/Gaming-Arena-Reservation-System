import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const rooms = await db.collection('rooms').find().sort({ name: 1 }).toArray()
    const data = rooms.map((r) => ({
      _id: r._id.toString(),
      name: r.name,
      type: r.type,
      description: r.description ?? '',
      images: r.images ?? [],
      pricePerHour: r.pricePerHour,
      totalDevices: r.totalDevices,
      status: r.status,
      createdAt: r.createdAt?.toISOString() ?? '',
      updatedAt: r.updatedAt?.toISOString() ?? '',
    }))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
