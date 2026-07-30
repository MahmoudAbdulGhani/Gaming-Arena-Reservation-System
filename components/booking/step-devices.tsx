'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, Cpu, Zap, CheckCircle2 } from 'lucide-react'
import type { BookingData } from '@/app/booking/page'
import type { Device } from '@/lib/types'

interface Props {
  bookingData: BookingData
  onComplete: (data: { devices: Device[]; totalPrice: number }) => void
  onBack: () => void
}

export default function BookingStepDevices({ bookingData, onBack, onComplete }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [bookedDeviceIds, setBookedDeviceIds] = useState<Set<string>>(new Set())

  const { room, date, startTime, durationHours } = bookingData

  const endTime = useMemo(() => {
    if (!startTime) return ''
    const h = Number(startTime.split(':')[0])
    return `${String(h + (durationHours ?? 1)).padStart(2, '0')}:00`
  }, [startTime, durationHours])

  useEffect(() => {
    if (!room) return
    setLoading(true)
    setSelectedIds(new Set())
    Promise.all([
      fetch(`/api/rooms/${room._id}/devices`).then((r) => r.json()),
      date && startTime && endTime
        ? fetch(`/api/bookings/check-conflicts?roomId=${room._id}&date=${date}&startTime=${startTime}&endTime=${endTime}`).then((r) => r.json())
        : Promise.resolve({ bookedDeviceIds: [] }),
    ]).then(([devicesData, conflicts]) => {
      setDevices(devicesData as Device[])
      setBookedDeviceIds(new Set<string>(conflicts.bookedDeviceIds ?? []))
      setLoading(false)
    })
  }, [room?._id, date, startTime, endTime])

  const toggleDevice = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!room) return null

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

  const getDeviceConfig = (device: Device) => {
    if (device.status === 'maintenance') return deviceStatusConfig.maintenance
    if (bookedDeviceIds.has(device._id)) return deviceStatusConfig.booked
    return deviceStatusConfig.available
  }

  const availableCount = devices.filter((d) => d.status !== 'maintenance' && !bookedDeviceIds.has(d._id)).length
  const selectedDevices = devices.filter((d) => selectedIds.has(d._id))
  const totalPrice = room.pricePerHour * selectedDevices.length * (durationHours ?? 1)

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
          Select Devices
        </h2>
        <p className="text-[#9BA3B7]">
          Pick one or more available devices in{' '}
          <span className="text-[#F5F6FA] font-medium">{room.name}</span>{' '}
          for{' '}
          <span className="text-[#7C5CFF] font-medium">{durationHours ?? 1}h</span>{' '}
          starting at{' '}
          <span className="text-[#F5F6FA] font-medium">{startTime}</span>.
        </p>
      </div>

      {/* Room summary chip */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#131824] border border-[#262D3D] mb-6">
        <Cpu className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <span className="text-sm text-[#F5F6FA] font-medium">{room.name}</span>
          <span className="text-sm text-[#9BA3B7] ml-2">
            &ndash; {availableCount} of {devices.length} devices free
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
        {devices.map((device) => {
          const cfg = getDeviceConfig(device)
          const isSelected = selectedIds.has(device._id)
          const disabled = cfg.disabled

          return (
            <button
              key={device._id}
              onClick={() => { if (!disabled) toggleDevice(device._id) }}
              disabled={disabled}
              aria-checked={isSelected}
              aria-disabled={disabled}
              className={`relative text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${disabled
                  ? cfg.cardBg + ' cursor-not-allowed'
                  : isSelected
                    ? cfg.selectedBg
                    : cfg.cardBg
                }`}
            >
              {isSelected && !disabled && (
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
      {selectedDevices.length > 0 && (
        <div className="p-4 rounded-xl bg-[#1B2130] border border-[#7C5CFF]/30 mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9BA3B7]">Selected devices</span>
            <span className="text-[#F5F6FA] font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
              {selectedDevices.map((d) => d.deviceLabel).join(', ')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9BA3B7]">Price breakdown</span>
            <span className="text-[#F5F6FA] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
              {selectedDevices.length} × ${room.pricePerHour}/hr × {durationHours ?? 1}h
            </span>
          </div>
          <div className="flex items-center justify-between text-sm border-t border-[#262D3D] pt-2">
            <span className="text-[#9BA3B7]">Total price</span>
            <span className="text-[#7C5CFF] font-bold text-lg" style={{ fontFamily: 'var(--font-mono)' }}>
              ${totalPrice}
            </span>
          </div>
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
          onClick={() => onComplete({ devices: selectedDevices, totalPrice })}
          disabled={selectedDevices.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white btn-primary-gradient transition-all duration-200 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4" aria-hidden="true" />
          {selectedDevices.length > 0
            ? `Continue with ${selectedDevices.length} device${selectedDevices.length !== 1 ? 's' : ''}`
            : 'Continue'}
        </button>
      </div>
    </div>
  )
}
