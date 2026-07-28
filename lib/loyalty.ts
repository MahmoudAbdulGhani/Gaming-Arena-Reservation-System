import type { Booking } from './types'
import { isNoShow } from './booking-policy'

export const EARN_PER_HOUR = 10
export const CARD_NO_SHOW_PENALTY = 5
export const CASH_NO_SHOW_PENALTY = 50

/**
 * Compute loyalty points from a user's booking history.
 *
 *  +10 for every completed booking
 *  -100 for every no-show (booking start time passed but status is still
 *       pending/confirmed — the user neither attended nor cancelled in time)
 *
 * Points never drop below 0.
 */
export function calculateLoyaltyPoints(bookings: Booking[]): number {
  const completed = bookings.filter((b) => b.status === 'completed').length
  const noShows = bookings.filter((b) => isNoShow(b)).length

  return Math.max(0, completed * EARN_PER_COMPLETED - noShows * NO_SHOW_PENALTY)
}
