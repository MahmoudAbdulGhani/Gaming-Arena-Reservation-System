
import type { Booking } from './types'
import { isNoShow } from './booking-policy'

export const EARN_PER_HOUR = 10
export const CARD_NO_SHOW_PENALTY = 5
export const CASH_NO_SHOW_PENALTY = 50

export function calculateLoyaltyPoints(bookings: Booking[]): number {
  const completedHours = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.durationHours ?? 0), 0)
  const noShows = bookings.filter((b) => isNoShow(b)).length
  const noShowPenalty = noShows * CARD_NO_SHOW_PENALTY

  return Math.max(0, completedHours * EARN_PER_HOUR - noShowPenalty)
}