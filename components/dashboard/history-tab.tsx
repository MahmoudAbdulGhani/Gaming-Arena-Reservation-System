import BookingCard from './booking-card'
// import { mockBookings } from '@/lib/mock-data'
import type { Booking } from '@/lib/types'

interface HistoryTabProps {
  bookings: Booking[]
  onUpdateBooking: (bookingId: string, changes: Partial<Booking>) => void
}


export default function HistoryTab({ bookings, onUpdateBooking }: HistoryTabProps) {
  const historyBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  )

  return (
  <div className="flex flex-col gap-4">
    {historyBookings.length === 0 ? (
      <p className="text-sm text-[#9BA3B7] text-center py-12">
        No history bookings yet.
      </p>
    ) : (
      historyBookings.map((booking) => <BookingCard key={booking._id} booking={booking} />)
    )}
  </div>
)
}