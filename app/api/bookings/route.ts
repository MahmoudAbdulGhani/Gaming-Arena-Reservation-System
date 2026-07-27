import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload: { userId: string; email: string; role: string }
    try {
      payload = verifyToken(authHeader.slice(7))
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const {
      userId: targetUserId,
      roomId,
      deviceIds,
      bookingDate,
      startTime,
      endTime,
      durationHours,
      totalPrice,
      paymentMethod,
      paymentId,
    } = body

    if (!roomId || !bookingDate || !startTime || !endTime || !durationHours) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const isAdmin = payload.role === 'admin'
    const bookingUserId = isAdmin && targetUserId ? targetUserId : payload.userId

    const db = await getDb()

    const now = new Date()
    const bookingDoc = {
      userId: new ObjectId(bookingUserId),
      roomId: new ObjectId(roomId),
      deviceIds: (deviceIds ?? []).map((id: string) => new ObjectId(id)),
      deviceCount: (deviceIds ?? []).length,
      bookingDate,
      startTime,
      endTime,
      durationHours,
      totalPrice,
      status: paymentMethod === 'cash' ? 'pending' : 'confirmed',
      paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'paid',
      paymentId: paymentId ?? null,
      confirmationMessage: paymentMethod === 'cash'
        ? 'Booking pending — pay at the front desk to confirm.'
        : 'Booking confirmed. Payment received.',
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection('bookings').insertOne(bookingDoc)

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...bookingDoc,
      userId: bookingUserId,
      roomId,
      deviceIds: deviceIds ?? [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
