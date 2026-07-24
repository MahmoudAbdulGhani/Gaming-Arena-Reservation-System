import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { hashPassword, generateOtp, getOtpExpiry, generateVerifyToken } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const db = await getDb()
    const existing = await db.collection('users').findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    await db.collection('users').insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      phone: phone || '',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const otp = generateOtp()
    const expiresAt = getOtpExpiry()
    const verifyToken = generateVerifyToken()

    await db.collection('otps').deleteMany({ email: email.toLowerCase() })
    await db.collection('otps').insertOne({
      email: email.toLowerCase(),
      otp,
      verifyToken,
      expiresAt,
      createdAt: new Date(),
    })

    await sendOtpEmail(email.toLowerCase(), otp)

    return NextResponse.json({
      message: 'Account created. Verify your email with the OTP sent.',
      verifyToken,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
