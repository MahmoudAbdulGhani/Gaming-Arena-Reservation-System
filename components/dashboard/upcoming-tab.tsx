'use client'

import { useState } from 'react'
import BookingCard from './booking-card'
import ModifyBookingModal from './modify-booking-modal'
import type { Booking } from '@/lib/types'

interface UpcomingTabProps {
  bookings: Booking[]
  onUpdateBooking: (bookingId: string, changes: Partial<Booking>) => void
}


export default function UpcomingTab({ bookings, onUpdateBooking  }: UpcomingTabProps) {
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed' || b.status === 'in_progress'
  )

  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [bookingToModify, setBookingToModify] = useState<Booking | null>(null)

  function handleConfirmCancel() {
    if (!bookingToCancel) return
    onUpdateBooking(bookingToCancel._id, { status: 'cancelled', cancellationReason: cancelReason })
    setBookingToCancel(null)
    setCancelReason('')
  }

  function handleSaveModify(bookingId: string, changes: Partial<Booking>) {
  onUpdateBooking(bookingId, changes)
  setBookingToModify(null)
}


  return (
  <div className="flex flex-col gap-4">
    {upcomingBookings.length === 0 ? (
      <p className="text-sm text-[#9BA3B7] text-center py-12">
        No upcoming bookings yet.
      </p>
    ) : (
      upcomingBookings.map((booking) => <BookingCard key={booking._id} 
      booking={booking}
      onCancel={(clickedBooking) => setBookingToCancel(clickedBooking) } 
      onModify={(clickedBooking) => setBookingToModify(clickedBooking) } />)
    )}

    {bookingToCancel && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setBookingToCancel(null); setCancelReason('') }}>
        <div className="bg-[#131824] border border-[#262D3D] rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>Cancel this booking?</h3>
          <p className="text-sm text-[#9BA3B7] mt-2">Are you sure you want to cancel your booking for <strong className="text-[#F5F6FA]">{bookingToCancel.room?.name ?? 'this room'}</strong> on {bookingToCancel.bookingDate ?? ''}? This can't be undone.</p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation (optional)"
            className="w-full mt-3 px-3 py-2 rounded-lg text-sm bg-[#1B2130] border border-[#262D3D] text-[#F5F6FA] placeholder-[#6b6b7b] resize-none outline-none focus:border-[#3B82F6]"
            rows={2}
          />
          <div className="flex items-center justify-end gap-3 mt-6">
            <button type="button" onClick={() => { setBookingToCancel(null); setCancelReason('') }} className="px-5 py-2 rounded-lg text-sm font-medium text-[#F5F6FA] border border-[#262D3D] hover:bg-[#1B2130] transition-colors duration-200">Never mind</button>
            <button type="button" onClick={handleConfirmCancel} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#FF5C7A] hover:bg-[#FF5C7A]/90 transition-colors duration-200">Yes, cancel it</button>
          </div>
        </div>
      </div>
    )}

      <ModifyBookingModal
        booking={bookingToModify}
        allBookings={bookings}
        isOpen={bookingToModify !== null}
        onClose={() => setBookingToModify(null)}
        onSave={handleSaveModify}
/>

  </div>
)
}
