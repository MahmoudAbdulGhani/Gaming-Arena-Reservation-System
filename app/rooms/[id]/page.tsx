import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ReserveButton from '@/components/reserve-button'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getRoomAvailability } from '@/lib/types'
import {
  Monitor,
  Gamepad2,
  Glasses,
  Users,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
  Ban,
} from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

const typeIcons: Record<string, React.ReactNode> = {
  pc: <Monitor className="w-4 h-4" />,
  console: <Gamepad2 className="w-4 h-4" />,
  vr: <Glasses className="w-4 h-4" />,
  private: <Users className="w-4 h-4" />,
}

const typeLabels: Record<string, string> = {
  pc: 'PC Station',
  console: 'Console Lounge',
  vr: 'VR Room',
  private: 'Private Room',
}

const typeDefaultImages: Record<string, string> = {
  pc: '/images/room-pc.png',
  console: '/images/room-console.png',
  vr: '/images/room-vr.png',
  private: '/images/room-private.png',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const db = await getDb()
  const room = await db.collection('rooms').findOne({ _id: new ObjectId(id) })
  if (!room) return { title: 'Room Not Found' }
  return {
    description: room.description || `Book ${room.name} at GameZone Arena.`,
  }
}

export default async function RoomDetailPage({ params }: Props) {
  const { id } = await params
  const db = await getDb()
  const room = await db.collection('rooms').findOne({ _id: new ObjectId(id) })
  if (!room) notFound()

  const roomData = {
    _id: room._id.toString(),
    name: room.name,
    type: room.type,
    description: room.description ?? '',
    images: room.images ?? [],
    pricePerHour: room.pricePerHour,
    totalDevices: room.totalDevices,
    status: room.status,
    createdAt: room.createdAt?.toISOString() ?? '',
    updatedAt: room.updatedAt?.toISOString() ?? '',
  }

  const deviceDocs = await db.collection('devices').find({ roomId: new ObjectId(id) }).toArray()
  const devices = deviceDocs.map((d) => ({
    _id: d._id.toString(),
    roomId: d.roomId.toString(),
    deviceLabel: d.deviceLabel,
    status: d.status,
    specs: d.specs ?? '',
    createdAt: d.createdAt?.toISOString() ?? '',
  }))

  const availability = getRoomAvailability(roomData, devices)
  const availableDevices = devices.filter((d) => d.status === 'available')
  const allRoomIds = (await db.collection('rooms').find({}, { projection: { _id: 1 } }).toArray()).map((r) => r._id.toString())
  const relatedIds = allRoomIds.filter((rid) => rid !== id).slice(0, 3)
  const relatedDocs = await db.collection('rooms').find({ _id: { $in: relatedIds.map((rid) => new ObjectId(rid)) } }).toArray()
  const relatedRooms = relatedDocs.map((r) => ({
    _id: r._id.toString(),
    name: r.name,
    type: r.type,
    description: r.description ?? '',
    images: r.images ?? [],
    pricePerHour: r.pricePerHour,
    totalDevices: r.totalDevices,
    status: r.status,
  }))

  const canBook = availability === 'available'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0B0E14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 text-sm text-[#9BA3B7] hover:text-[#F5F6FA] transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="relative h-[400px] rounded-2xl overflow-hidden mb-6">
                <Image
                  src={roomData.images[0] || typeDefaultImages[roomData.type] || '/images/room-pc.png'}
                  alt={roomData.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B0E14]/80 backdrop-blur-sm text-sm font-semibold text-[#F5F6FA] border border-[#262D3D]">
                    {typeIcons[roomData.type]}
                    {typeLabels[roomData.type]}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-[#F5F6FA] mb-3">{roomData.name}</h1>
              <p className="text-[#9BA3B7] leading-relaxed mb-8">{roomData.description}</p>

              <h2 className="text-xl font-bold text-[#F5F6FA] mb-4">Devices in this Room</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {devices.map((device) => (
                  <div
                    key={device._id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[#131824] border border-[#262D3D]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F5F6FA]">{device.deviceLabel}</p>
                      {device.specs && (
                        <p className="text-xs text-[#9BA3B7] mt-0.5">{device.specs}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${device.status === 'available'
                      ? 'text-[#33E6A0] bg-[#33E6A0]/10 border border-[#33E6A0]/20'
                      : device.status === 'booked'
                      ? 'text-[#FF5C7A] bg-[#FF5C7A]/10 border border-[#FF5C7A]/20'
                      : 'text-[#FF9F5C] bg-[#FF9F5C]/10 border border-[#FF9F5C]/20'
                    }`}>
                      {device.status === 'available' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : device.status === 'booked' ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <Wrench className="w-3 h-3" />
                      )}
                      {device.status === 'available' ? 'Available' : device.status === 'booked' ? 'Booked' : 'Maintenance'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-[#131824] border border-[#262D3D] rounded-2xl p-6">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-[#7C5CFF]">${roomData.pricePerHour}</span>
                  <span className="text-sm text-[#9BA3B7]">{roomData.type === 'private' ? '/hour (flat rate)' : '/hour per device'}</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9BA3B7]">Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${availability === 'available'
                      ? 'text-[#33E6A0] bg-[#33E6A0]/10'
                      : availability === 'booked'
                      ? 'text-[#FF5C7A] bg-[#FF5C7A]/10'
                      : availability === 'maintenance'
                      ? 'text-[#9BA3B7] bg-[#9BA3B7]/10'
                      : 'text-[#9BA3B7] bg-[#9BA3B7]/10'
                    }`}>
                      {availability === 'available' && <><span className="w-1.5 h-1.5 rounded-full bg-[#33E6A0] animate-pulse" />Available</>}
                      {availability === 'booked' && <><Ban className="w-3 h-3" />Fully Booked</>}
                      {availability === 'maintenance' && <><Wrench className="w-3 h-3" />Maintenance</>}
                      {availability === 'inactive' && <><Ban className="w-3 h-3" />Closed</>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9BA3B7]">Devices</span>
                    <span className="text-[#F5F6FA] font-medium">{availableDevices.length} / {devices.length} available</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9BA3B7]">Type</span>
                    <span className="text-[#F5F6FA] font-medium">{typeLabels[roomData.type]}</span>
                  </div>
                </div>

                <ReserveButton roomId={id} canBook={canBook} />

                <p className="text-xs text-[#9BA3B7] text-center mt-4">
                  Free cancellation up to 24 hours before your session.
                </p>
              </div>
            </div>
          </div>

          {relatedRooms.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-[#F5F6FA] mb-6">Similar Rooms</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedRooms.map((r) => (
                  <Link
                    key={r._id}
                    href={`/rooms/${r._id}`}
                    className="group bg-[#131824] border border-[#262D3D] rounded-2xl overflow-hidden hover:border-[#7C5CFF]/40 transition-all duration-200"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={r.images?.[0] || typeDefaultImages[r.type] || '/images/room-pc.png'}
                        alt={r.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131824] via-transparent to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-[#F5F6FA] mb-1">{r.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#9BA3B7]">{typeLabels[r.type]}</span>
                        <span className="text-[#7C5CFF] font-bold">${r.pricePerHour}/hr</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
