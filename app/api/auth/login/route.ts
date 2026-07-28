import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { comparePassword, generateToken, generateOtp, getOtpExpiry, generateVerifyToken } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const db = await getDb()
    const user = await db.collection('users').findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await comparePassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.isVerified) {
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
        requiresOtp: true,
        verifyToken,
        message: 'Please verify your email first. OTP has been sent.',
      })
    }

    const token = generateToken({ _id: user._id, email: user.email, role: user.role })

    return NextResponse.json({
      token,
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
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
