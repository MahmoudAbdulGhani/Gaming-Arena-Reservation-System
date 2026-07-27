import type { Booking } from './types'
import { isNoShow } from './booking-policy'

export const EARN_PER_HOUR = 10
export const CARD_NO_SHOW_PENALTY = 5
export const CASH_NO_SHOW_PENALTY = 50

/**
 * Compute loyalty points from a user's booking history.
 *
 *  +10 for every hour booked in completed sessions
 *  -5  for every no-show paid by card (they already lost their money)
 *  -50 for every no-show paid by cash (arena got nothing)
 *
 * Points never drop below 0.
 */
export function calculateLoyaltyPoints(bookings: Booking[]): number {
  const earnedPoints = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.durationHours * EARN_PER_HOUR, 0)
  const cardNoShows = bookings.filter((b) => isNoShow(b) && b.paymentStatus === 'paid').length
  const cashNoShows = bookings.filter((b) => isNoShow(b) && b.paymentStatus !== 'paid').length

  return Math.max(0, earnedPoints - cardNoShows * CARD_NO_SHOW_PENALTY - cashNoShows * CASH_NO_SHOW_PENALTY)
}
