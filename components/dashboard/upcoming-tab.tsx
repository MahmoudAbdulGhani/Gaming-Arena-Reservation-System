import { useState } from 'react'
import BookingCard from './booking-card'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import ModifyBookingModal from './modify-booking-modal'
// import { mockBookings } from '@/lib/mock-data'
import type { Booking } from '@/lib/types'

interface UpcomingTabProps {
  bookings: Booking[]
  onUpdateBooking: (bookingId: string, changes: Partial<Booking>) => void
}


export default function UpcomingTab({ bookings, onUpdateBooking  }: UpcomingTabProps) {
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  )

  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const [bookingToModify, setBookingToModify] = useState<Booking | null>(null)

  function handleConfirmCancel() {
    if (!bookingToCancel) return
    onUpdateBooking(bookingToCancel._id, { status: 'cancelled' })
    setBookingToCancel(null)
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

    <ConfirmDialog
        isOpen={bookingToCancel !== null}
        title="Cancel this booking?"
        message={`Are you sure you want to cancel your booking for ${bookingToCancel?.room?.name ?? 'this room'} on ${bookingToCancel?.bookingDate ?? ''}? This can't be undone.`}
        confirmLabel="Yes, cancel it"
        cancelLabel="Never mind"
        onConfirm={handleConfirmCancel}
        onCancel={() => setBookingToCancel(null)}
      />

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