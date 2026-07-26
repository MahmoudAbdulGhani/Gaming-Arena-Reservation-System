import type { Booking } from './types'

// The client proposal requires modify/cancel to be limited by "policy
// limits" but doesn't specify a number. 2 hours is a placeholder —
// confirm the real threshold with the team before this ships for real.
const MIN_HOURS_BEFORE_START = 2

export type BookingAction = 'modify' | 'cancel'

export interface PolicyResult {
  allowed: boolean
  reason?: string
}

export function checkBookingPolicy(booking: Booking, action: BookingAction): PolicyResult {
  const startsAt = new Date(`${booking.bookingDate}T${booking.startTime}:00`)
  const hoursUntilStart = (startsAt.getTime() - Date.now()) / (1000 * 60 * 60)

  if (hoursUntilStart < MIN_HOURS_BEFORE_START) {
    return {
      allowed: false,
      reason: `Bookings can't be ${action === 'modify' ? 'modified' : 'cancelled'} within ${MIN_HOURS_BEFORE_START} hours of the start time.`,
    }
  }

  return { allowed: true }
}


export function hasSlotConflict(
  candidateDate: string,
  candidateStartTime: string,
  candidateEndTime: string,
  roomId: string,
  excludeBookingId: string,
  allBookings: Booking[]
): boolean {
  return allBookings.some((other) => {
    if (other._id === excludeBookingId) return false
    if (other.roomId !== roomId) return false
    if (other.bookingDate !== candidateDate) return false
    if (other.status === 'cancelled') return false

    // Two time ranges overlap if one starts before the other ends,
    // in both directions.
    return candidateStartTime < other.endTime && other.startTime < candidateEndTime
  })
}

export function isNoShow(booking: Booking): boolean {
  const startsAt = new Date(`${booking.bookingDate}T${booking.startTime}:00`)
  const isStillUpcomingStatus = booking.status === 'pending' || booking.status === 'confirmed'

  return isStillUpcomingStatus && startsAt.getTime() < Date.now()
}