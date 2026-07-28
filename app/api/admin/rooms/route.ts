import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDbWithAdminCheck, errorResponse, toJSON } from '@/lib/admin-helper'

export async function GET(request: Request) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const rooms = await db.collection('rooms').find().sort({ name: 1 }).toArray()
    return NextResponse.json(rooms.map(toJSON))
  } catch (error) {
    return errorResponse(error, 401)
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await getDbWithAdminCheck(request)
    const body = await request.json()
    const { name, type, pricePerHour, totalDevices, status, description, images } = body

    const now = new Date()
    const roomDoc = {
      name,
      type,
      pricePerHour: Number(pricePerHour),
      totalDevices: Number(totalDevices),
      status: status ?? 'active',
      description: description ?? '',
      images: images ?? [],
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection('rooms').insertOne(roomDoc)
    const roomId = result.insertedId

    const devices = []
    if (totalDevices > 0) {
      const prefix = type === 'pc' ? 'PC' : type === 'console' ? 'Console' : type === 'vr' ? 'VR' : 'PV'
      for (let i = 1; i <= totalDevices; i++) {
        const label = `${prefix}-${String(i).padStart(2, '0')}`
        devices.push({
          roomId,
          deviceLabel: label,
          status: 'available',
          createdAt: now,
        })
      }
    }

    if (devices.length > 0) {
      await db.collection('devices').insertMany(devices)
    }

    const created = await db.collection('rooms').findOne({ _id: roomId })
    return NextResponse.json(toJSON(created!), { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
