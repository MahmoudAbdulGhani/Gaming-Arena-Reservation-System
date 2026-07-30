'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Zap, Monitor, Gamepad2, Glasses, Users, Cpu } from 'lucide-react'
import type { Room, Device } from '@/lib/types'
import { roomTypeLabels } from '@/lib/types'
import { getRoomPrimaryImage } from '@/lib/room-images'

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
  const [rooms, setRooms] = useState<Room[]>([])
  const [devicesMap, setDevicesMap] = useState<Record<string, Device[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rooms').then(r => r.json()).then((data: Room[]) => {
      setRooms(data)
      Promise.all(data.map(room =>
        fetch(`/api/rooms/${room._id}/devices`).then(r => r.json())
      )).then(results => {
        const map: Record<string, Device[]> = {}
        data.forEach((room, i) => {
          map[room._id] = results[i]
        })
        setDevicesMap(map)
        setLoading(false)
      })
    })
  }, [])

  useEffect(() => {
    if (preselectedId && !loading) {
      const room = rooms.find((r) => r._id === preselectedId)
      if (room && room.status !== 'inactive' && room.status !== 'maintenance') {
        setSelected(room)
      }
    }
  }, [preselectedId, rooms, loading])

  const bookableRooms = rooms.filter((r) => r.status !== 'inactive' && r.status !== 'maintenance')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
      </div>
    )
  }

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
          const devices = devicesMap[room._id] ?? []

          return (
            <button
              key={room._id}
              onClick={() => setSelected(room)}
              role="radio"
              aria-checked={selected?._id === room._id}
              disabled={false}
              className={`relative text-left rounded-2xl border overflow-hidden transition-all duration-200 ${
                selected?._id === room._id
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
                <Image src={getRoomPrimaryImage(room)} alt={room.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-[#131824] via-transparent to-transparent" />
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
                  {room.type === 'private' ? (
                    <>
                      <Users className="w-3.5 h-3.5 text-[#9BA3B7]" aria-hidden="true" />
                      <span className="text-xs font-semibold text-[#9BA3B7]">
                        {room.totalDevices}
                      </span>
                      <span className="text-xs text-[#9BA3B7]">
                        capacity
                      </span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5 text-[#9BA3B7]" aria-hidden="true" />
                      <span className="text-xs font-semibold text-[#9BA3B7]">
                        {devices.length}
                      </span>
                      <span className="text-xs text-[#9BA3B7]">
                        {devices.length === 1 ? ' device' : ' devices'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => selected && onComplete(selected)}
        disabled={!selected}
        className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl text-base font-bold text-white btn-primary-gradient transition-all duration-200 min-h-13 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Zap className="w-5 h-5" aria-hidden="true" />
        Continue to Select Devices
      </button>
    </div>
  )
}
