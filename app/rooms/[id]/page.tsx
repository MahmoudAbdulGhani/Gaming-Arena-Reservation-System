import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { mockRooms, mockDevices } from '@/lib/mock-data'
import { getRoomAvailability } from '@/lib/types'
import {
  Monitor,
  Gamepad2,
  Glasses,
  Users,
  Zap,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
  Ban,
  Cpu,
} from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

const typeLabels: Record<string, string> = {
  pc: 'PC',
  console: 'Console',
  vr: 'VR',
  private: 'Private Room',
}

const typeIcons: Record<string, React.ReactNode> = {
  pc: <Monitor className="w-5 h-5" />,
  console: <Gamepad2 className="w-5 h-5" />,
  vr: <Glasses className="w-5 h-5" />,
  private: <Users className="w-5 h-5" />,
}

const deviceStatusConfig = {
  available: { label: 'Available', color: 'text-[#33E6A0]', bg: 'bg-[#33E6A0]/10 border-[#33E6A0]/30', dot: 'bg-[#33E6A0]' },
  booked: { label: 'Booked', color: 'text-[#FF5C7A]', bg: 'bg-[#FF5C7A]/10 border-[#FF5C7A]/30', dot: 'bg-[#FF5C7A]' },
  maintenance: { label: 'Maintenance', color: 'text-[#9BA3B7]', bg: 'bg-[#9BA3B7]/10 border-[#9BA3B7]/30', dot: 'bg-[#9BA3B7]' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const room = mockRooms.find((r) => r._id === id)
  if (!room) return { title: 'Room Not Found' }
  return {
    title: `${room.name} — GameZone Arena`,
    description: room.description,
  }
}

export default async function RoomDetailPage({ params }: Props) {
  const { id } = await params
  const room = mockRooms.find((r) => r._id === id)
  if (!room) notFound()

  const devices = mockDevices.filter((d) => d.roomId === room._id)
  const availableCount = devices.filter((d) => d.status === 'available').length

  const relatedRooms = mockRooms
    .filter((r) => r.type === room.type && r._id !== room._id)
    .slice(0, 3)

  const roomStatusConfig = {
    available: { label: 'Devices Available', icon: CheckCircle2, color: 'text-[#33E6A0]', bg: 'bg-[#33E6A0]/10 border-[#33E6A0]/20' },
    booked: { label: 'Fully Booked', icon: XCircle, color: 'text-[#FF5C7A]', bg: 'bg-[#FF5C7A]/10 border-[#FF5C7A]/20' },
    maintenance: { label: 'Under Maintenance', icon: Wrench, color: 'text-[#9BA3B7]', bg: 'bg-[#9BA3B7]/10 border-[#9BA3B7]/20' },
    inactive: { label: 'Room Closed', icon: Ban, color: 'text-[#9BA3B7]', bg: 'bg-[#9BA3B7]/10 border-[#9BA3B7]/20' },
  }

  // room.status alone is just the admin on/off switch — bookability also
  // depends on live device status, so compute it the same way RoomCard does.
  const availability = getRoomAvailability(room, devices)
  const statusInfo = roomStatusConfig[availability]
  const StatusIcon = statusInfo.icon
  const canBook = availability === 'available'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0B0E14] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#9BA3B7] mb-8" aria-label="Breadcrumb">
            <Link href="/rooms" className="flex items-center gap-1 hover:text-[#7C5CFF] transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Back to Rooms
            </Link>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left: Image + description + devices */}
            <div className="lg:col-span-3 space-y-6">
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <Image
                  src={room.images[0] || '/images/room-pc.png'}
                  alt={`${room.name} gaming room`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14]/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0E14]/80 border border-[#262D3D] text-sm text-[#F5F6FA] backdrop-blur-sm">
                    {typeIcons[room.type]}
                    {typeLabels[room.type]}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D]">
                <h2 className="text-lg font-bold text-[#F5F6FA] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  About This Room
                </h2>
                <p className="text-sm text-[#9BA3B7] leading-relaxed">{room.description}</p>
              </div>

              {/* Devices grid */}
              <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#7C5CFF]" aria-hidden="true" />
                    <h2 className="text-lg font-bold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
                      Devices in This Room
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#33E6A0] font-semibold">{availableCount}</span>
                    <span className="text-[#9BA3B7]">/ {devices.length} available</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 text-xs text-[#9BA3B7]">
                  {Object.entries(deviceStatusConfig).map(([key, val]) => (
                    <span key={key} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${val.dot}`} aria-hidden="true" />
                      {val.label}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {devices.map((device) => {
                    const cfg = deviceStatusConfig[device.status]
                    return (
                      <div
                        key={device._id}
                        className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${cfg.bg}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot} ${device.status === 'available' ? 'animate-pulse' : ''}`} aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`text-sm font-bold ${cfg.color}`} style={{ fontFamily: 'var(--font-display)' }}>
                              {device.deviceLabel}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#9BA3B7] leading-relaxed" style={{ fontFamily: 'var(--font-mono)' }}>
                            {device.specs}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: Booking card */}
            <aside className="lg:col-span-2 space-y-6">
              <div className="sticky top-24 p-6 rounded-2xl bg-[#131824] border border-[#262D3D]">
                {/* Name + status */}
                <h1 className="text-2xl font-bold text-[#F5F6FA] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  {room.name}
                </h1>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mb-6 ${statusInfo.bg} ${statusInfo.color}`}>
                  {availability === 'available' && (
                    <span className="w-2 h-2 rounded-full bg-[#33E6A0] animate-pulse" aria-hidden="true" />
                  )}
                  {availability !== 'available' && <StatusIcon className="w-4 h-4" aria-hidden="true" />}
                  {statusInfo.label}
                </div>

                {/* Price */}
                <div className="p-4 rounded-xl bg-[#1B2130] border border-[#262D3D] mb-4">
                  <p className="text-xs text-[#9BA3B7] mb-1">Price per hour (per device)</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#7C5CFF]" style={{ fontFamily: 'var(--font-mono)' }}>
                      ${room.pricePerHour}
                    </span>
                    <span className="text-[#9BA3B7]">/hr per device</span>
                  </div>
                </div>

                {/* Device availability summary */}
                <div className="p-4 rounded-xl bg-[#1B2130] border border-[#262D3D] mb-4">
                  <p className="text-xs text-[#9BA3B7] mb-3">Device Availability</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {devices.map((device) => {
                      const cfg = deviceStatusConfig[device.status]
                      return (
                        <div
                          key={device._id}
                          title={`${device.deviceLabel}: ${cfg.label}`}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold ${cfg.bg} ${cfg.color}`}
                        >
                          {device.deviceLabel.replace(/[^0-9]/g, '')}
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-[#9BA3B7] mt-3">
                    You can select which devices to reserve in the booking flow.
                  </p>
                </div>

                {/* Opening hours */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-[#262D3D] mb-6">
                  <Clock className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-[#9BA3B7]">Available Hours</p>
                    <p className="text-sm text-[#F5F6FA] font-medium">Daily: 10:00 AM – 12:00 AM</p>
                  </div>
                </div>

                {/* CTA */}
                {canBook ? (
                  <Link
                    href={`/booking?room=${room._id}`}
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl text-base font-bold text-white btn-primary-gradient glow-violet transition-all duration-200 min-h-[52px]"
                  >
                    <Zap className="w-5 h-5" aria-hidden="true" />
                    Reserve Devices in This Room
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl text-base font-semibold text-[#9BA3B7] bg-[#1B2130] border border-[#262D3D] cursor-not-allowed opacity-60 min-h-[52px]"
                    aria-disabled="true"
                  >
                    No Devices Available
                  </button>
                )}

                <p className="text-xs text-center text-[#9BA3B7] mt-3">
                  No cancellation fee up to 2 hours before session
                </p>
              </div>
            </aside>
          </div>

          {/* Related rooms */}
          {relatedRooms.length > 0 && (
            <section className="mt-16" aria-labelledby="related-heading">
              <h2
                id="related-heading"
                className="text-2xl font-bold text-[#F5F6FA] mb-6"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Similar {typeLabels[room.type]} Rooms
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedRooms.map((r) => {
                  const rDevices = mockDevices.filter((d) => d.roomId === r._id)
                  const rAvail = rDevices.filter((d) => d.status === 'available').length
                  return (
                    <article key={r._id} className="group bg-[#131824] border border-[#262D3D] rounded-2xl overflow-hidden card-hover">
                      <div className="relative h-40 overflow-hidden">
                        <Image src={r.images[0]} alt={r.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-[#F5F6FA] mb-1" style={{ fontFamily: 'var(--font-display)' }}>{r.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#9BA3B7]" style={{ fontFamily: 'var(--font-mono)' }}>${r.pricePerHour}/hr</span>
                            <span className="text-xs text-[#33E6A0]">{rAvail}/{rDevices.length} free</span>
                          </div>
                          <Link href={`/rooms/${r._id}`} className="text-xs text-[#7C5CFF] hover:underline">View &rarr;</Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
