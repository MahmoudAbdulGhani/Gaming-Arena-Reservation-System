
// import type { Booking } from './types'
// import { isNoShow } from './booking-policy'

// export const EARN_PER_COMPLETED = 10
// export const NO_SHOW_PENALTY = 100

// export const EARN_PER_HOUR = 10
// export const CARD_NO_SHOW_PENALTY = 5
// export const CASH_NO_SHOW_PENALTY = 50

// /**
 
// Compute loyalty points from a user's booking history.*
// +10 for every confirmed or completed booking (paid sessions)
// -100 for every no-show (unpaid pending booking past its start time)*
// Points never drop below 0.*/
// export function calculateLoyaltyPoints(bookings: Booking[]): number {
//   const paid = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length
//   const noShows = bookings.filter((b) => isNoShow(b)).length

//   return Math.max(0, paid * EARN_PER_COMPLETED - noShows * NO_SHOW_PENALTY)
// }

import type { Booking } from './types'
import { isNoShow } from './booking-policy'

export const EARN_PER_HOUR = 10
export const CARD_NO_SHOW_PENALTY = 5
export const CASH_NO_SHOW_PENALTY = 50

/**
 
Compute loyalty points from a user's booking history.*
+10 for every hour booked in completed sessions
-5  for every no-show paid by card (they already lost their money)
-50 for every no-show paid by cash (arena got nothing)*
Points never drop below 0.*/
export function calculateLoyaltyPoints(bookings: Booking[]): number {
  const completed = bookings.filter((b) => b.status === 'completed').length
  const noShows = bookings.filter((b) => isNoShow(b)).length

  return Math.max(0, completed * EARN_PER_COMPLETED - noShows * NO_SHOW_PENALTY)
}