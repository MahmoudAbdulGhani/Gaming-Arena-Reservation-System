import { NextResponse } from 'next/server'
import { getDbWithAdminCheck, errorResponse, toJSON } from '@/lib/admin-helper'

export async function GET() {
  try {
    const request = new Request('http://dummy')
    const { db } = await getDbWithAdminCheck(request)
    const devices = await db.collection('devices').find().sort({ deviceLabel: 1 }).toArray()
    return NextResponse.json(devices.map(toJSON))
  } catch (error) {
    return errorResponse(error, 401)
  }
}
