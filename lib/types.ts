// ──────────────────────────────────────────────
//  Frontend-facing types for Gaming Arena Reservation System
// ──────────────────────────────────────────────

import type {
  RoomType,
  RoomStatus,
  DeviceStatus,
  BookingStatus,
  PaymentStatus,
  UserRole,
  TransactionStatus,
  NotificationType,
} from './models'

export type {
  RoomType,
  RoomStatus,
  DeviceStatus,
  BookingStatus,
  PaymentStatus,
  UserRole,
  TransactionStatus,
  NotificationType,
}

export interface Room {
  _id: string
  name: string
  type: RoomType
  description: string
  images: string[]
  pricePerHour: number
  totalDevices: number
  status: RoomStatus
  createdAt: string
  updatedAt: string
}

export interface Device {
  _id: string
  roomId: string
  deviceLabel: string
  status: DeviceStatus
  specs: string
  createdAt: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  isVerified: boolean
  loyaltyPoints: number
  createdAt: string
}

export interface Booking {
  _id: string
  userId: string
  roomId: string
  room?: Room // populated by the API route, not stored on the document
  deviceIds: string[]
  devices?: Device[] // populated by the API route, not stored on the document
  deviceCount: number
  bookingDate: string
  startTime: string
  endTime: string
  durationHours: number
  totalPrice: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  paymentId?: string
  confirmationMessage?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  _id: string
  bookingId: string
  userId: string
  amount: number
  currency: string
  paymentMethod: string
  transactionId: string
  status: TransactionStatus
  createdAt: string
  updatedAt: string
}

export interface Notification {
  _id: string
  userId: string
  bookingId?: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

// UI-only concept — has no matching database collection.
export interface TimeSlot {
  time: string
  available: boolean
}

// Shared display labels for RoomType — one place to edit, so every
// component (room cards, booking steps, confirmation) shows the same text.
export const roomTypeLabels: Record<RoomType, string> = {
  pc: 'PC',
  console: 'Console',
  vr: 'VR',
  private: 'Private Room',
}

// ──────────────────────────────────────────────
//  Derived / computed helpers
// ──────────────────────────────────────────────
//
//  Room.status (from the database) is the ADMIN-controlled field —
//  'active' | 'inactive' | 'maintenance' — set by an admin toggling the
//  room on/off or flagging the whole room for maintenance. It says
//  nothing about whether the room is bookable RIGHT NOW; that depends
//  on the live status of its devices, so it's computed here instead of
//  stored as a second field that could go stale.
//
//  Rooms with multiple devices (PC Lab, Console Lounge, VR Room) are
//  bookable as long as AT LEAST ONE device is free — one device being
//  in maintenance doesn't take the whole room down.
//
//  Rooms with exactly ONE device mirror that device's status directly
//  rather than being derived from a count: if the device is 'booked',
//  the room is 'booked'; if it's in 'maintenance', the room is too —
//  there's no "1 of 1 available" to fall back on.

export type RoomAvailability = 'available' | 'booked' | 'maintenance' | 'inactive'

export function getRoomAvailability(room: Room, devices: Device[]): RoomAvailability {
  if (room.status === 'inactive') return 'inactive'
  if (room.status === 'maintenance') return 'maintenance'
  return devices.length > 0 ? 'available' : 'booked'
}

// Payload shape for the admin "activate/deactivate room" action. Only
// 'active'/'inactive' are admin-toggleable this way — 'maintenance' is
// set separately (e.g. by staff flagging an issue), not part of the
// simple on/off switch.
export type RoomAdminStatus = Extract<RoomStatus, 'active' | 'inactive'>

export interface UpdateRoomStatusPayload {
  roomId: string
  status: RoomAdminStatus
}

// ──────────────────────────────────────────────
//  Time formatting
// ──────────────────────────────────────────────

/** Convert "14:00" → "2:00 PM" */
export function formatTime12(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}
