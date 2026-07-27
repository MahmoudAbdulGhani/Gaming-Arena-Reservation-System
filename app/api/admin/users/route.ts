import { NextResponse } from 'next/server'
import { getDbWithAdminCheck, errorResponse } from '@/lib/admin-helper'

export async function GET() {
  try {
    const request = new Request('http://dummy')
    const { db } = await getDbWithAdminCheck(request)
    const users = await db.collection('users').find().sort({ name: 1 }).toArray()
    const data = users.map((u) => {
      const { password, ...rest } = u
      return {
        _id: rest._id.toString(),
        name: rest.name,
        email: rest.email,
        role: rest.role,
        phone: rest.phone ?? undefined,
        isVerified: rest.isVerified,
        loyaltyPoints: rest.loyaltyPoints,
        createdAt: rest.createdAt?.toISOString() ?? '',
        updatedAt: rest.updatedAt?.toISOString() ?? '',
      }
    })
    return NextResponse.json(data)
  } catch (error) {
    return errorResponse(error, 401)
  }
}
