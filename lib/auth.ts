import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { ObjectId } from 'mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret'
const SALT_ROUNDS = 12
const OTP_EXPIRY_MINUTES = 5

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export interface OtpRecord {
  email: string
  otp: string
  expiresAt: Date
  createdAt: Date
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: { _id: ObjectId | string; email: string; role: string }): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
}

export function generateVerifyToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
