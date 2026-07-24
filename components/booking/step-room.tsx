'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Zap, Monitor, Gamepad2, Glasses, Users, Cpu } from 'lucide-react'
import { mockRooms, mockDevices } from '@/lib/mock-data'
import type { Room } from '@/lib/types'
import { getRoomAvailability, roomTypeLabels } from '@/lib/types'

const typeIcons: Record<string, React.ReactNode> = {
  pc: <Monitor className="w-4 h-4" />,
  console: <Gamepad2 className="w-4 h-4" />,
  vr: <Glasses className="w-4 h-4" />,
  private: <Users className="w-4 h-4" />,
}

interface Props {
  preselectedId: string | null
  onComplete: (room: Room) => void
}

export default function BookingStepRoom({ preselectedId, onComplete }: Props) {
  const [selected, setSelected] = useState<Room | null>(null)

  useEffect(() => {
    if (preselectedId) {
      const room = mockRooms.find((r) => r._id === preselectedId)
      if (room) {
        const roomDevices = mockDevices.filter((d) => d.roomId === room._id)
        if (getRoomAvailability(room, roomDevices) === 'available') setSelected(room)
      }
    }
  }, [preselectedId])

  const bookableRooms = mockRooms.filter((r) => r.status !== 'inactive' && r.status !== 'maintenance')

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F5F6FA] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Choose a Room
        </h2>
        <p className="text-[#9BA3B7]">Select a gaming room — you&apos;ll pick your specific devices next.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8" role="radiogroup" aria-label="Select a gaming room">
        {bookableRooms.map((room) => {
          const devices = mockDevices.filter((d) => d.roomId === room._id)
          const availableCount = devices.filter((d) => d.status === 'available').length

          return (
            <button
              key={room._id}
              onClick={() => setSelected(room)}
              role="radio"
              aria-checked={selected?._id === room._id}
              disabled={availableCount === 0}
              className={`relative text-left rounded-2xl border overflow-hidden transition-all duration-200 ${
                availableCount === 0
                  ? 'opacity-50 cursor-not-allowed border-[#262D3D]'
                  : selected?._id === room._id
                  ? 'border-[#7C5CFF] glow-violet-sm'
                  : 'border-[#262D3D] hover:border-[#7C5CFF]/40'
              } bg-[#131824]`}
            >
              {/* Selection indicator */}
              {selected?._id === room._id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#7C5CFF] flex items-center justify-center z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              )}

              <div className="relative h-36 overflow-hidden">
                <Image src={room.images[0]} alt={room.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131824] via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0B0E14]/80 text-xs text-[#9BA3B7] backdrop-blur-sm">
                    {typeIcons[room.type]}
                    {roomTypeLabels[room.type]}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
                    {room.name}
                  </h3>
                  <span className="text-[#7C5CFF] font-bold text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                    ${room.pricePerHour}/hr
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#9BA3B7]" aria-hidden="true" />
                  <span className={`text-xs font-semibold ${availableCount > 0 ? 'text-[#33E6A0]' : 'text-[#FF5C7A]'}`}>
                    {availableCount}
                  </span>
                  <span className="text-xs text-[#9BA3B7]">
                    / {devices.length} devices available
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => selected && onComplete(selected)}
        disabled={!selected}
        className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl text-base font-bold text-white btn-primary-gradient transition-all duration-200 min-h-[52px] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Zap className="w-5 h-5" aria-hidden="true" />
        Continue to Select Devices
      </button>
    </div>
  )
}
