import { NextResponse } from 'next/server'
import { verifyToken, type JwtPayload } from './auth'
import { getDb } from './mongodb'
import { ObjectId } from 'mongodb'

export function getAdminToken(request: Request): JwtPayload {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }
  const payload = verifyToken(authHeader.slice(7))
  if (payload.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return payload
}

export function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : 'Internal server error'
  return NextResponse.json({ error: message }, { status })
}

export async function getDbWithAdminCheck(request: Request) {
  const payload = getAdminToken(request)
  const db = await getDb()
  return { db, payload }
}

export function toJSON(doc: Record<string, unknown>): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(doc)) {
    if (value instanceof ObjectId) {
      obj[key] = value.toString()
    } else if (value instanceof Date) {
      obj[key] = value.toISOString()
    } else if (Array.isArray(value)) {
      obj[key] = value.map((item) =>
        item instanceof ObjectId ? item.toString() : item
      )
    } else {
      obj[key] = value
    }
  }
  return obj
}
