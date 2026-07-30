import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { generateOtp, getOtpExpiry, generateVerifyToken } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const db = await getDb()

    const record = await db.collection('otps').findOne({ verifyToken: token })
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
    }

    const user = await db.collection('users').findOne({ email: record.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
    }

    const otp = generateOtp()
    const expiresAt = getOtpExpiry()
    const newToken = generateVerifyToken()

    await db.collection('otps').deleteMany({ email: record.email })
    await db.collection('otps').insertOne({
      email: record.email,
      otp,
      verifyToken: newToken,
      expiresAt,
      createdAt: new Date(),
    })

    await sendOtpEmail(record.email, otp)

    return NextResponse.json({
      message: 'OTP sent successfully',
      verifyToken: newToken,
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
