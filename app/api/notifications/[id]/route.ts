import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload: { userId: string }
    try {
      payload = verifyToken(authHeader.slice(7))
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const db = await getDb()
    const result = await db.collection('notifications').findOneAndUpdate(
      { _id: new ObjectId(id), userId: new ObjectId(payload.userId) },
      { $set: { read: true } },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json({ _id: result._id.toString(), read: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}