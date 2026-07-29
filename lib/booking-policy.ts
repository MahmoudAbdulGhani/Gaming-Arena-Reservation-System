import type { Db } from 'mongodb'
import type { Booking } from './types'

// Cancel is blocked within 1 hour of the start time.
// Modify is always allowed.
const MIN_HOURS_BEFORE_START = 1

export type BookingAction = 'modify' | 'cancel'

export interface PolicyResult {
  allowed: boolean
  reason?: string
}

export function checkBookingPolicy(booking: Booking, action: BookingAction): PolicyResult {
  if (action === 'modify') return { allowed: true }

  const startsAt = new Date(`${booking.bookingDate}T${booking.startTime}:00`)
  const hoursUntilStart = (startsAt.getTime() - Date.now()) / (1000 * 60 * 60)

  if (hoursUntilStart < MIN_HOURS_BEFORE_START) {
    return {
      allowed: false,
      reason: `Bookings can't be cancelled within ${MIN_HOURS_BEFORE_START} hour of the start time.`,
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
  if (booking.status !== 'pending') return false
  const startsAt = new Date(`${booking.bookingDate}T${booking.startTime}:00`)
  return startsAt.getTime() < Date.now()
}

export async function transitionBookingStatuses(db: Db): Promise<void> {
  try {
    const now = new Date()
    const todayStart = new Date(now.toISOString().split('T')[0])
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    await db.collection('bookings').updateMany(
      {
        status: 'confirmed',
        bookingDate: { $lte: todayStart },
        startTime: { $lte: currentTime },
        endTime: { $gte: currentTime },
      },
      { $set: { status: 'in_progress', updatedAt: new Date() } }
    )

    await db.collection('bookings').updateMany(
      {
        status: { $in: ['confirmed', 'in_progress'] },
        endTime: { $lt: currentTime },
      },
      { $set: { status: 'completed', updatedAt: new Date() } }
    )
  } catch {
    // Non-critical — status transitions should never break data fetching
  }
}