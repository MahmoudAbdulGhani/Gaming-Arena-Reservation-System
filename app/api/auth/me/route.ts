import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { verifyToken } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const db = await getDb()
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        isVerified: user.isVerified,
        loyaltyPoints: user.loyaltyPoints ?? 0,
        createdAt: user.createdAt?.toISOString?.() ?? '',
      },
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payload = verifyToken(authHeader.slice(7))

    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const db = await getDb()

    // Make sure the new email isn't already taken by a different account.
    const existing = await db.collection('users').findOne({ email, _id: { $ne: new ObjectId(payload.userId) } })
    if (existing) {
      return NextResponse.json({ error: 'That email is already in use' }, { status: 409 })
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { name, email, phone, updatedAt: new Date() } }
    )

    const updated = await db.collection('users').findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    )

    return NextResponse.json({
      user: {
        _id: updated!._id.toString(),
        name: updated!.name,
        email: updated!.email,
        role: updated!.role,
        phone: updated!.phone || '',
        isVerified: updated!.isVerified,
        loyaltyPoints: updated!.loyaltyPoints ?? 0,
        createdAt: updated!.createdAt?.toISOString?.() ?? '',
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
