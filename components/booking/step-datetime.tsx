'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { timeSlots, reservedDeviceSlots } from '@/lib/mock-data'
import type { BookingData } from '@/app/booking/page'

interface Props {
  bookingData: BookingData
  onComplete: (data: Partial<BookingData>) => void
  onBack: () => void
}

function getWeekDates(anchor: Date): Date[] {
  const result: Date[] = []
  const start = new Date(anchor)
  start.setDate(start.getDate() - start.getDay())
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    result.push(d)
  }
  return result
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const hourOf = (t: string) => Number(t.split(':')[0])

function devicesOverlap(
  deviceIds: string[],
  startHour: number,
  endHour: number,
): boolean {
  return deviceIds.some((id) => {
    const ranges = reservedDeviceSlots[id] ?? []
    return ranges.some((r) => {
      const rs = hourOf(r.start)
      const re = hourOf(r.end)
      return rs < endHour && re > startHour
    })
  })
}

export default function BookingStepDateTime({ bookingData, onComplete, onBack }: Props) {
  const today = useMemo(() => new Date(), [])
  const nowHour = today.getHours()
  const nowMinute = today.getMinutes()
  const [weekAnchor, setWeekAnchor] = useState(today)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)

  const weekDates = getWeekDates(weekAnchor)
  const { room, devices } = bookingData

  const deviceIds = useMemo(
    () => devices?.map((d) => d._id) ?? [],
    [devices],
  )

  const isToday = useMemo(() => {
    if (!selectedDate) return false
    return selectedDate === today.toISOString().split('T')[0]
  }, [selectedDate, today])

  const isSlotPast = (time: string): boolean => {
    if (!isToday) return false
    const h = hourOf(time)
    return h < nowHour || (h === nowHour && nowMinute > 0)
  }

  const isSlotBlocked = (time: string): boolean => {
    if (deviceIds.length === 0) return false
    const h = hourOf(time)
    return devicesOverlap(deviceIds, h, h + 1)
  }

  const maxDuration = useMemo(() => {
    if (!selectedTime) return 1
    const startH = hourOf(selectedTime)
    const limit = Math.min(24 - startH, 6)
    if (limit <= 0) return 1
    for (let d = 1; d <= limit; d++) {
      if (devicesOverlap(deviceIds, startH, startH + d)) {
        return d
      }
    }
    return limit
  }, [selectedTime, deviceIds])

  const effectiveDuration = Math.min(duration, maxDuration)

  const endTime = () => {
    if (!selectedTime) return ''
    const h = hourOf(selectedTime)
    return `${String(h + effectiveDuration).padStart(2, '0')}:00`
  }

  const totalPrice = room && devices
    ? room.pricePerHour * devices.length * effectiveDuration
    : 0

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (duration > 1) setDuration(1)
  }

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return
    onComplete({
      date: selectedDate,
      startTime: selectedTime,
      durationHours: effectiveDuration,
      totalPrice,
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F5F6FA] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Pick a Date & Time
        </h2>
        <p className="text-[#9BA3B7]">
          Select your session time in{' '}
          <span className="text-[#F5F6FA] font-medium">{room?.name}</span>
          {devices && devices.length > 0 && (
            <> for <span className="text-[#7C5CFF] font-medium">{devices.length} device{devices.length !== 1 ? 's' : ''}</span></>
          )}
          .
        </p>
      </div>

      {/* Calendar */}
      <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D] mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const prev = new Date(weekAnchor)
              prev.setDate(prev.getDate() - 7)
              if (prev >= today) setWeekAnchor(prev)
            }}
            className="w-9 h-9 rounded-lg bg-[#1B2130] border border-[#262D3D] flex items-center justify-center text-[#9BA3B7] hover:text-[#F5F6FA] hover:border-[#7C5CFF]/40 transition-all duration-200"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
            {MONTHS[weekDates[0].getMonth()]} {weekDates[0].getDate()} &ndash;{' '}
            {MONTHS[weekDates[6].getMonth()]} {weekDates[6].getDate()},{' '}
            {weekDates[0].getFullYear()}
          </span>
          <button
            onClick={() => {
              const next = new Date(weekAnchor)
              next.setDate(next.getDate() + 7)
              setWeekAnchor(next)
            }}
            className="w-9 h-9 rounded-lg bg-[#1B2130] border border-[#262D3D] flex items-center justify-center text-[#9BA3B7] hover:text-[#F5F6FA] hover:border-[#7C5CFF]/40 transition-all duration-200"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2" role="group" aria-label="Select date">
          {weekDates.map((date) => {
            const dateStr = date.toISOString().split('T')[0]
            const isPast = date < today && date.toDateString() !== today.toDateString()
            const isSelected = selectedDate === dateStr
            const isTodayBtn = date.toDateString() === today.toDateString()

            return (
              <button
                key={dateStr}
                disabled={isPast}
                onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); setDuration(1) }}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-200 ${
                  isPast
                    ? 'opacity-30 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#7C5CFF] text-white glow-violet-sm'
                    : 'bg-[#1B2130] text-[#9BA3B7] border border-[#262D3D] hover:border-[#7C5CFF]/40 hover:text-[#F5F6FA]'
                }`}
                aria-pressed={isSelected}
                aria-label={`${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`}
              >
                <span className="text-xs">{DAYS[date.getDay()]}</span>
                <span className={`text-base font-bold ${isTodayBtn && !isSelected ? 'text-[#7C5CFF]' : ''}`}
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {date.getDate()}
                </span>
                {isTodayBtn && <span className="w-1 h-1 rounded-full bg-current" aria-label="Today" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D] mb-6">
          <h3 className="text-sm font-semibold text-[#F5F6FA] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <Clock className="w-4 h-4 text-[#7C5CFF]" aria-hidden="true" />
            Available Time Slots
          </h3>
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            role="group"
            aria-label="Select start time"
            style={{ scrollbarWidth: 'thin' }}
          >
            {timeSlots.map((time) => {
              const past = isSlotPast(time)
              const booked = isSlotBlocked(time)
              const disabled = past || booked
              const isSelected = selectedTime === time

              return (
                <button
                  key={time}
                  disabled={disabled}
                  onClick={() => handleTimeSelect(time)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${
                    disabled
                      ? past
                        ? 'bg-[#9BA3B7]/5 text-[#9BA3B7]/30 border border-[#262D3D]/50 cursor-not-allowed'
                        : 'bg-[#FF5C7A]/10 text-[#FF5C7A]/50 border border-[#FF5C7A]/20 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#7C5CFF] text-white glow-violet-sm'
                      : 'bg-[#1B2130] text-[#9BA3B7] border border-[#262D3D] hover:border-[#7C5CFF]/40 hover:text-[#F5F6FA]'
                  }`}
                  aria-pressed={isSelected}
                  aria-disabled={disabled}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {time}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#9BA3B7]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#7C5CFF]/20 border border-[#7C5CFF]/40" aria-hidden="true" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#FF5C7A]/10 border border-[#FF5C7A]/20" aria-hidden="true" />
              Devices booked
            </span>
            {isToday && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#9BA3B7]/5 border border-[#262D3D]/50" aria-hidden="true" />
                Past
              </span>
            )}
          </div>
        </div>
      )}

      {/* Duration */}
      {selectedTime && (
        <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D] mb-6">
          <h3 className="text-sm font-semibold text-[#F5F6FA] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Session Duration
            {maxDuration < 6 && (
              <span className="ml-2 text-xs font-normal text-[#9BA3B7]">
                (max {maxDuration}h — conflicts with upcoming reservations)
              </span>
            )}
          </h3>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Select duration">
            {[1, 2, 3, 4, 5, 6].map((h) => {
              const tooLong = h > maxDuration
              return (
                <button
                  key={h}
                  disabled={tooLong}
                  onClick={() => setDuration(h)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${
                    tooLong
                      ? 'bg-[#9BA3B7]/5 text-[#9BA3B7]/30 border border-[#262D3D]/50 cursor-not-allowed line-through'
                      : effectiveDuration === h
                      ? 'bg-[#7C5CFF] text-white'
                      : 'bg-[#1B2130] text-[#9BA3B7] border border-[#262D3D] hover:border-[#7C5CFF]/40 hover:text-[#F5F6FA]'
                  }`}
                  aria-pressed={effectiveDuration === h}
                  aria-disabled={tooLong}
                >
                  {h}h
                </button>
              )
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 rounded-xl bg-[#1B2130] border border-[#262D3D] space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9BA3B7]">Session</span>
              <span className="text-[#F5F6FA] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                {selectedTime} &ndash; {endTime()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9BA3B7]">Devices × rate</span>
              <span className="text-[#F5F6FA] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                {devices?.length ?? 0} × ${room?.pricePerHour}/hr × {effectiveDuration}h
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-[#262D3D] pt-2">
              <span className="text-[#9BA3B7]">Total price</span>
              <span className="text-[#7C5CFF] font-bold text-lg" style={{ fontFamily: 'var(--font-mono)' }}>
                ${totalPrice}
              </span>
            </div>
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
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-white btn-primary-gradient transition-all duration-200 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Confirm
        </button>
      </div>
    </div>
  )
}
