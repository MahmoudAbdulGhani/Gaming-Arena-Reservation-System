import BookingCard from './booking-card'
import { mockBookings } from '@/lib/mock-data'

export default function UpcomingTab() {
  const upcomingBookings = mockBookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  )

  return (
  <div className="flex flex-col gap-4">
    {upcomingBookings.length === 0 ? (
      <p className="text-sm text-[#9BA3B7] text-center py-12">
        No upcoming bookings yet.
      </p>
    ) : (
      upcomingBookings.map((booking) => <BookingCard key={booking._id} booking={booking} />)
    )}
  </div>
)
}