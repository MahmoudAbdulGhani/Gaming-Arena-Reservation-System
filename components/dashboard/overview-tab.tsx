'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cpu, Calendar, Clock, Award } from 'lucide-react'
import StatCard from './stat-card'
import BookingCard from './booking-card'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import ModifyBookingModal from './modify-booking-modal'
import type { Booking, User } from '@/lib/types'

// How many upcoming bookings to preview here before the user has to
// click "View all" and go to the full Upcoming tab.
const PREVIEW_COUNT = 2

interface OverviewTabProps {
  user: User | null
  // Lets the "View all" link jump straight to the Upcoming tab — the
  // active-tab state itself lives one level up, in dashboard-tabs.tsx.
  bookings: Booking[]
  onUpdateBooking: (bookingId: string, changes: Partial<Booking>) => void
  onViewAllUpcoming?: () => void
}

export default function OverviewTab({ user, onUpdateBooking,onViewAllUpcoming, bookings }: OverviewTabProps) {
  const totalBookings = bookings.length

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed' || b.status === 'in_progress'
  )
  const upcomingCount = upcomingBookings.length

  const completedCount = bookings.filter((b) => b.status === 'completed').length

  // The real, persisted loyalty total lives on the user record itself
  // (incremented server-side whenever a card booking is made) — not
  // recomputed from booking history, since bookings never actually
  // reach a 'completed' status in the current system.
  const loyaltyPoints = user?.loyaltyPoints ?? 0

  // Same Modify/Cancel wiring as upcoming-tab.tsx — this preview list
  // uses the same BookingCard, so it needs its own copy of this state
  // since OverviewTab and UpcomingTab are separate component instances.
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
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          icon={<Cpu className="w-6 h-6" aria-hidden="true" />}
          iconColorClass="bg-[#7C5CFF]/15 text-[#7C5CFF]"
          value={totalBookings}
          label="Total Bookings"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" aria-hidden="true" />}
          iconColorClass="bg-[#33E6A0]/15 text-[#33E6A0]"
          value={upcomingCount}
          label="Upcoming"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" aria-hidden="true" />}
          iconColorClass="bg-[#FF9F5C]/15 text-[#FF9F5C]"
          value={completedCount}
          label="Completed"
        />
        <StatCard
          icon={<Award className="w-6 h-6" aria-hidden="true" />}
          iconColorClass="bg-[#4C6FFF]/15 text-[#4C6FFF]"
          value={loyaltyPoints}
          label="Loyalty Points"
        />
      </div>

      {/* Upcoming Sessions preview */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-bold text-[#F5F6FA]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Upcoming Sessions
          </h2>

          {onViewAllUpcoming ? (
            <button
              type="button"
              onClick={onViewAllUpcoming}
              className="text-sm font-medium text-[#7C5CFF] hover:text-[#8B6FFF] transition-colors duration-200"
            >
              View all
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#7C5CFF] hover:text-[#8B6FFF] transition-colors duration-200"
            >
              View all
            </Link>
          )}
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="text-sm text-[#9BA3B7] text-center py-12">No upcoming bookings yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {upcomingBookings.slice(0, PREVIEW_COUNT).map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={(clickedBooking) => setBookingToCancel(clickedBooking)}
                onModify={(clickedBooking) => setBookingToModify(clickedBooking)}
              />
            ))}
          </div>
        )}
      </div>

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
