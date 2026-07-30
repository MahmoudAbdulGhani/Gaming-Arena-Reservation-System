
import type { Booking } from './types'

export const EARN_PER_HOUR = 10

export function calculateLoyaltyPoints(bookings: Booking[]): number {
  const completedHours = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.durationHours ?? 0), 0)

  return completedHours * EARN_PER_HOUR
}