'use client'

import { useState, useEffect } from 'react'
import type { Booking } from '@/lib/types'
import { timeSlots } from '@/lib/static-data'
import { hasSlotConflict } from '@/lib/booking-policy'

interface ModifyBookingModalProps {
  booking: Booking | null
  allBookings: Booking[]
  isOpen: boolean
  onClose: () => void
  onSave: (bookingId: string, changes: Partial<Booking>) => void
}

// Adds `hours` to a "HH:MM" time string and returns the new "HH:MM" string.
function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + hours * 60
  const wrappedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const newH = Math.floor(wrappedMinutes / 60)
  const newM = wrappedMinutes % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

export default function ModifyBookingModal({ booking, allBookings, isOpen, onClose, onSave }: ModifyBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [conflictError, setConflictError] = useState('')

  // Whenever a (possibly different) booking is opened for editing,
  // reset the form fields to that booking's current values.
  useEffect(() => {
    if (booking) {
      setSelectedDate(booking.bookingDate)
      setSelectedTime(booking.startTime)
      setConflictError('')
    }
  }, [booking])

  if (!isOpen || !booking) return null
    const currentBooking = booking

  function handleSave() {
    const newEndTime = addHours(selectedTime, currentBooking.durationHours)

    const conflict = hasSlotConflict(
    selectedDate,
    selectedTime,
    newEndTime,
    currentBooking.roomId,
    currentBooking._id,
    allBookings
  )

  if (conflict) {
    setConflictError('That time slot is already booked for this room. Pick a different time.')
    return
  }
    setConflictError('')
    onSave(currentBooking._id, {
      bookingDate: selectedDate,
      startTime: selectedTime,
      endTime: newEndTime,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#131824] border border-[#262D3D] rounded-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
          Modify booking
        </h3>
        <p className="text-sm text-[#9BA3B7] mt-1">{booking.room?.name ?? 'Room'}</p>

        <div className="mt-5">
          <label htmlFor="modifyDate" className="block text-sm text-[#9BA3B7] mb-2">
            Date
          </label>
          <input
            id="modifyDate"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#1B2130] border border-[#262D3D] rounded-lg px-4 py-3 text-[#F5F6FA] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="modifyTime" className="block text-sm text-[#9BA3B7] mb-2">
            Start time
          </label>
          <select
            id="modifyTime"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full bg-[#1B2130] border border-[#262D3D] rounded-lg px-4 py-3 text-[#F5F6FA] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]"
          >
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
         {conflictError && (
            <p className="text-sm text-[#FF5C7A] mt-3">{conflictError}</p>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-[#F5F6FA] border border-[#262D3D] hover:bg-[#1B2130] transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white btn-primary-gradient transition-all duration-200"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
