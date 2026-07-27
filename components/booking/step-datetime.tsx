'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { timeSlots } from '@/lib/static-data'
import { formatTime12 } from '@/lib/types'
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

export default function BookingStepDateTime({ bookingData, onComplete, onBack }: Props) {
  const today = useMemo(() => new Date(), [])
  const nowHour = today.getHours()
  const nowMinute = today.getMinutes()
  const [weekAnchor, setWeekAnchor] = useState(today)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)

  const weekDates = getWeekDates(weekAnchor)
  const { room } = bookingData

  const isToday = useMemo(() => {
    if (!selectedDate) return false
    return selectedDate === today.toISOString().split('T')[0]
  }, [selectedDate, today])

  const isSlotPast = (time: string): boolean => {
    if (!isToday) return false
    const h = hourOf(time)
    return h < nowHour || (h === nowHour && nowMinute > 0)
  }

  const maxDuration = useMemo(() => {
    if (!selectedTime) return 1
    const startH = hourOf(selectedTime)
    return Math.min(24 - startH, 8)
  }, [selectedTime])

  const effectiveDuration = Math.min(duration, maxDuration)

  const endTime = () => {
    if (!selectedTime) return ''
    const h = hourOf(selectedTime)
    return `${String(h + effectiveDuration).padStart(2, '0')}:00`
  }

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
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F5F6FA] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Pick a Date & Time
        </h2>
        <p className="text-[#9BA3B7]">
          Select your session date and time in{' '}
          <span className="text-[#F5F6FA] font-medium">{room?.name}</span>.
          You&apos;ll choose devices in the next step.
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
              const isSelected = selectedTime === time

              return (
                <button
                  key={time}
                  disabled={past}
                  onClick={() => handleTimeSelect(time)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${
                    past
                      ? 'bg-[#FF5C7A]/10 text-[#FF5C7A]/50 border border-[#FF5C7A]/20 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#7C5CFF] text-white glow-violet-sm'
                      : 'bg-[#1B2130] text-[#9BA3B7] border border-[#262D3D] hover:border-[#7C5CFF]/40 hover:text-[#F5F6FA]'
                  }`}
                  aria-pressed={isSelected}
                  aria-disabled={past}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {formatTime12(time)}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#9BA3B7]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#7C5CFF]/20 border border-[#7C5CFF]/40" aria-hidden="true" />
              Available
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
            {maxDuration < 8 && (
              <span className="ml-2 text-xs font-normal text-[#9BA3B7]">
                (max {maxDuration}h)
              </span>
            )}
          </h3>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Select duration">
            {[1, 2, 3, 4, 5, 6].map((h) => (
              <button
                key={h}
                onClick={() => setDuration(h)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${
                  duration === h
                    ? 'bg-[#7C5CFF] text-white'
                    : 'bg-[#1B2130] text-[#9BA3B7] border border-[#262D3D] hover:border-[#7C5CFF]/40 hover:text-[#F5F6FA]'
                }`}
                aria-pressed={duration === h}
              >
                {h}h
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 rounded-xl bg-[#1B2130] border border-[#262D3D] space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9BA3B7]">Session</span>
              <span className="text-[#F5F6FA] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                {formatTime12(selectedTime)} &ndash; {formatTime12(endTime())}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9BA3B7]">Duration</span>
              <span className="text-[#F5F6FA] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                {effectiveDuration} hour{effectiveDuration !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#9BA3B7] bg-[#131824] border border-[#262D3D] hover:text-[#F5F6FA] hover:border-[#7C5CFF]/40 transition-all duration-200 min-h-11"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-white btn-primary-gradient transition-all duration-200 min-h-11 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Confirm
        </button>
      </div>
    </div>
  )
}
