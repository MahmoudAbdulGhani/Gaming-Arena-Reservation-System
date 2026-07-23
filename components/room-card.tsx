'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Monitor, Gamepad2, Glasses, Users, Cpu, Zap, Clock } from 'lucide-react'
import type { Room } from '@/lib/types'
import { getRoomAvailability } from '@/lib/types'
import { mockDevices } from '@/lib/mock-data'

const typeLabels: Record<string, string> = {
  pc: 'PC',
  console: 'Console',
  vr: 'VR',
  private: 'Private Room',
}

const typeIcons: Record<string, React.ReactNode> = {
  pc: <Monitor className="w-4 h-4" />,
  console: <Gamepad2 className="w-4 h-4" />,
  vr: <Glasses className="w-4 h-4" />,
  private: <Users className="w-4 h-4" />,
}

const typeColors: Record<string, string> = {
  pc: 'text-[#7C5CFF] bg-[#7C5CFF]/10',
  console: 'text-[#4C6FFF] bg-[#4C6FFF]/10',
  vr: 'text-[#33E6A0] bg-[#33E6A0]/10',
  private: 'text-[#FF9F5C] bg-[#FF9F5C]/10',
}

interface RoomCardProps {
  room: Room
  compact?: boolean
}

export default function RoomCard({ room, compact = false }: RoomCardProps) {
  const devices = mockDevices.filter((d) => d.roomId === room._id)
  const availableCount = devices.filter((d) => d.status === 'available').length
  const totalCount = devices.length

  const statusConfig = {
    available: { label: 'Rooms Open', color: 'text-[#33E6A0] bg-[#33E6A0]/10 border-[#33E6A0]/20' },
    booked: { label: 'Fully Booked', color: 'text-[#FF5C7A] bg-[#FF5C7A]/10 border-[#FF5C7A]/20' },
    maintenance: { label: 'Maintenance', color: 'text-[#9BA3B7] bg-[#9BA3B7]/10 border-[#9BA3B7]/20' },
    inactive: { label: 'Closed', color: 'text-[#9BA3B7] bg-[#9BA3B7]/10 border-[#9BA3B7]/20' },
  }

  // Room.status from the DB only says active/inactive/maintenance —
  // whether it's bookable *right now* depends on live device status too.
  const availability = getRoomAvailability(room, devices)
  const status = statusConfig[availability]
  const canBook = availability === 'available'

  return (
    <article
      className={`group bg-[#131824] border border-[#262D3D] rounded-2xl overflow-hidden card-hover ${canBook ? 'hover:border-[#7C5CFF]/40' : ''
        }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: compact ? '160px' : '200px' }}>
        <Image
          src={room.images[0] || '/images/room-pc.png'}
          alt={`${room.name} gaming room`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131824] via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
            {availability === 'available' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#33E6A0] animate-pulse" aria-hidden="true" />
            )}
            {status.label}
          </span>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${typeColors[room.type]}`}>
            {typeIcons[room.type]}
            {typeLabels[room.type]}
          </span>
        </div>

        {/* Device availability pill */}
        <div className="absolute bottom-3 right-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${availableCount > 0
            ? 'bg-[#0B0E14]/80 border-[#33E6A0]/30 text-[#33E6A0]'
            : 'bg-[#0B0E14]/80 border-[#FF5C7A]/30 text-[#FF5C7A]'
            }`}>
            <Cpu className="w-3 h-3" aria-hidden="true" />
            {availableCount}/{totalCount} free
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="text-base font-bold text-[#F5F6FA] leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {room.name}
          </h3>
          <div className="shrink-0 text-right">
            <span
              className="text-lg font-bold text-[#7C5CFF]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              ${room.pricePerHour}
            </span>
            <span className="text-xs text-[#9BA3B7]">/hr</span>
          </div>
        </div>

        {!compact && (
          <p className="text-sm text-[#9BA3B7] leading-relaxed mb-4 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Device count row */}
        {!compact && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1B2130] border border-[#262D3D]">
              <Users className="w-3 h-3 text-[#9BA3B7]" aria-hidden="true" />
              <span className="text-xs text-[#9BA3B7]">{totalCount} devices total</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${availableCount > 0
              ? 'bg-[#33E6A0]/5 border-[#33E6A0]/20'
              : 'bg-[#FF5C7A]/5 border-[#FF5C7A]/20'
              }`}>
              <span className={`text-xs font-semibold ${availableCount > 0 ? 'text-[#33E6A0]' : 'text-[#FF5C7A]'}`}>
                {availableCount} available
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link
            href={`/rooms/${room._id}`}
            className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-[#9BA3B7] bg-[#1B2130] hover:bg-[#262D3D] hover:text-[#F5F6FA] border border-[#262D3D] transition-all duration-200 min-h-[44px] flex items-center justify-center"
          >
            View Room
          </Link>
          {canBook ? (
            <Link
              href={`/booking?room=${room._id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-primary-gradient transition-all duration-200 min-h-[44px]"
            >
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              Book
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#9BA3B7] bg-[#1B2130] border border-[#262D3D] cursor-not-allowed opacity-60 min-h-[44px]"
              aria-disabled="true"
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {availability === 'maintenance'
                ? 'Maintenance'
                : availability === 'inactive'
                  ? 'Closed'
                  : 'No devices free'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
