'use client'

import { useState } from 'react'
import { ChevronLeft, Cpu, Zap, CheckCircle2 } from 'lucide-react'
import { mockDevices } from '@/lib/mock-data'
import type { BookingData } from '@/app/booking/page'
import type { Device } from '@/lib/types'

interface Props {
  bookingData: BookingData
  onComplete: (devices: Device[]) => void
  onBack: () => void
}

export default function BookingStepDevices({ bookingData, onBack, onComplete }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { room } = bookingData
  if (!room) return null

  const roomDevices = mockDevices.filter((d) => d.roomId === room._id)
  const availableDevices = roomDevices.filter((d) => d.status === 'available')

  const toggle = (deviceId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(deviceId)) {
        next.delete(deviceId)
      } else {
        next.add(deviceId)
      }
      return next
    })
  }

  const deviceStatusConfig = {
    available: {
      label: 'Available',
      cardBg: 'bg-[#131824] border-[#262D3D] hover:border-[#7C5CFF]/50',
      selectedBg: 'bg-[#7C5CFF]/10 border-[#7C5CFF]',
      dot: 'bg-[#33E6A0] animate-pulse',
      labelColor: 'text-[#33E6A0]',
      disabled: false,
    },
    booked: {
      label: 'Booked',
      cardBg: 'bg-[#131824]/60 border-[#262D3D] opacity-50',
      selectedBg: '',
      dot: 'bg-[#FF5C7A]',
      labelColor: 'text-[#FF5C7A]',
      disabled: true,
    },
    maintenance: {
      label: 'Maintenance',
      cardBg: 'bg-[#131824]/60 border-[#262D3D] opacity-50',
      selectedBg: '',
      dot: 'bg-[#9BA3B7]',
      labelColor: 'text-[#9BA3B7]',
      disabled: true,
    },
  }

  const selectedDevices = roomDevices.filter((d) => selectedIds.has(d._id))
  const totalPrice = selectedDevices.length * room.pricePerHour

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F5F6FA] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Select Devices
        </h2>
        <p className="text-[#9BA3B7]">
          Pick the available devices you want to reserve in{' '}
          <span className="text-[#F5F6FA] font-medium">{room.name}</span>. Only available devices can be selected.
        </p>
      </div>

      {/* Room summary chip */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#131824] border border-[#262D3D] mb-6">
        <Cpu className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <span className="text-sm text-[#F5F6FA] font-medium">{room.name}</span>
          <span className="text-sm text-[#9BA3B7] ml-2">
            &mdash; {availableDevices.length} of {roomDevices.length} devices free
          </span>
        </div>
        <span className="text-sm text-[#7C5CFF] font-bold shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
          ${room.pricePerHour}/hr each
        </span>
      </div>

      {/* Devices grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
        role="group"
        aria-label="Select devices to reserve"
      >
        {roomDevices.map((device) => {
          const cfg = deviceStatusConfig[device.status]
          const isSelected = selectedIds.has(device._id)

          return (
            <button
              key={device._id}
              onClick={() => !cfg.disabled && toggle(device._id)}
              disabled={cfg.disabled}
              aria-pressed={isSelected}
              aria-disabled={cfg.disabled}
              className={`relative text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                cfg.disabled
                  ? cfg.cardBg + ' cursor-not-allowed'
                  : isSelected
                  ? cfg.selectedBg
                  : cfg.cardBg
              }`}
            >
              {/* Selected checkmark */}
              {isSelected && !cfg.disabled && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#7C5CFF] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} aria-hidden="true" />
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-sm font-bold ${isSelected ? 'text-[#7C5CFF]' : 'text-[#F5F6FA]'}`}
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {device.deviceLabel}
                    </span>
                    <span className={`text-xs font-semibold ${cfg.labelColor}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p
                    className="text-xs text-[#9BA3B7] leading-relaxed"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {device.specs}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selection summary */}
      {selectedIds.size > 0 && (
        <div className="p-4 rounded-xl bg-[#1B2130] border border-[#7C5CFF]/30 mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#9BA3B7]">Selected devices</span>
            <span className="text-[#F5F6FA] font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
              {selectedIds.size} device{selectedIds.size !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9BA3B7]">Price per hour (total)</span>
            <span className="text-[#7C5CFF] font-bold text-lg" style={{ fontFamily: 'var(--font-mono)' }}>
              ${totalPrice}
            </span>
          </div>
          <p className="text-xs text-[#9BA3B7] mt-2">
            Final total depends on session duration (selected in next step).
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#9BA3B7] bg-[#131824] border border-[#262D3D] hover:text-[#F5F6FA] hover:border-[#7C5CFF]/40 transition-all duration-200 min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>
        <button
          onClick={() => onComplete(selectedDevices)}
          disabled={selectedIds.size === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white btn-primary-gradient transition-all duration-200 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4" aria-hidden="true" />
          Continue with {selectedIds.size} Device{selectedIds.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  )
}
