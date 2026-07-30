import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { token, otp } = await request.json()

    if (!token || !otp) {
      return NextResponse.json({ error: 'Token and OTP are required' }, { status: 400 })
    }

    const db = await getDb()

    const record = await db.collection('otps').findOne({
      verifyToken: token,
      otp,
      expiresAt: { $gt: new Date() },
    })

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    await db.collection('otps').deleteMany({ email: record.email })

    await db.collection('users').updateOne(
      { email: record.email },
      { $set: { isVerified: true, updatedAt: new Date() } }
    )

    const user = await db.collection('users').findOne(
      { email: record.email },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const jwtToken = generateToken({ _id: user._id, email: user.email, role: user.role })

    return NextResponse.json({
      token: jwtToken,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        isVerified: true,
        loyaltyPoints: user.loyaltyPoints ?? 0,
        createdAt: user.createdAt?.toISOString?.() ?? '',
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
