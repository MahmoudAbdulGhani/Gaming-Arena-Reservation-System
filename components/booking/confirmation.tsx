import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Calendar, Clock, Gamepad2, Download, LayoutDashboard, Cpu } from 'lucide-react'
import type { BookingData } from '@/app/booking/page'
import { roomTypeLabels } from '@/lib/types'

interface Props {
  bookingData: BookingData
}

export default function BookingConfirmation({ bookingData }: Props) {
  const { room, devices, date, startTime, durationHours, totalPrice } = bookingData
  if (!room) return null

  const endHour = parseInt(startTime.split(':')[0]) + durationHours
  const endTime = `${String(endHour).padStart(2, '0')}:00`
  const bookingCode = `GZ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-lg text-center">
        {/* Success icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#33E6A0]/10 border-2 border-[#33E6A0]/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#33E6A0]" aria-hidden="true" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-[#F5F6FA] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Booking Confirmed!
        </h2>
        <p className="text-[#9BA3B7] mb-8">
          Your devices have been reserved. See you at the arena!
        </p>

        {/* Booking code */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 mb-8">
          <span className="text-xs text-[#9BA3B7]">Booking Code</span>
          <span
            className="text-xl font-black text-[#7C5CFF] tracking-widest"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {bookingCode}
          </span>
        </div>

        {/* Summary card */}
        <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D] text-left mb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
              <Image src={room.images[0]} alt={room.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-bold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
                {room.name}
              </p>
              <p className="text-sm text-[#9BA3B7]">{roomTypeLabels[room.type]}</p>
            </div>
          </div>

          {/* Reserved devices */}
          {devices && devices.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[#1B2130] border border-[#262D3D]">
              <Cpu className="w-3.5 h-3.5 text-[#7C5CFF] shrink-0" aria-hidden="true" />
              <span className="text-xs text-[#9BA3B7]">Devices:</span>
              <div className="flex flex-wrap gap-1.5">
                {devices.map((d) => (
                  <span
                    key={d._id}
                    className="px-2 py-0.5 rounded-md bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-xs font-medium text-[#7C5CFF]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {d.deviceLabel}
                  </span>
                ))}
              </div>
            </div>
          )}

          <dl className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
              <dt className="sr-only">Date</dt>
              <dd className="text-sm text-[#F5F6FA]">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
              <dt className="sr-only">Time</dt>
              <dd className="text-sm text-[#F5F6FA]" style={{ fontFamily: 'var(--font-mono)' }}>
                {startTime} &ndash; {endTime} ({durationHours}h)
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
              <dt className="sr-only">Location</dt>
              <dd className="text-sm text-[#F5F6FA]">GameZone Arena, Main Floor</dd>
            </div>
            <div className="border-t border-[#262D3D] pt-3 flex items-center justify-between">
              <dt className="text-sm text-[#9BA3B7]">Amount Paid</dt>
              <dd className="text-xl font-black text-[#33E6A0]" style={{ fontFamily: 'var(--font-mono)' }}>
                ${totalPrice}
              </dd>
            </div>
          </dl>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white btn-primary-gradient transition-all duration-200 min-h-11"
          >
            <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
            View My Bookings
          </Link>
          <button
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#9BA3B7] bg-[#131824] border border-[#262D3D] hover:text-[#F5F6FA] hover:border-[#7C5CFF]/40 transition-all duration-200 min-h-11"
            aria-label="Download booking confirmation"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download Receipt
          </button>
        </div>

        <Link
          href="/booking"
          className="block mt-4 text-sm text-[#9BA3B7] hover:text-[#7C5CFF] transition-colors duration-200"
        >
          Make another booking
        </Link>
      </div>
    </div>
  )
}
