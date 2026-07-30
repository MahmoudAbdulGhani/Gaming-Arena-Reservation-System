import { ObjectId } from 'mongodb';

// ================================================================
// USER
// ================================================================
export type UserRole = 'customer' | 'admin' | 'staff';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string; // unique
  password: string; // hashed
  role: UserRole;
  phone?: string;
  isVerified: boolean;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

// ================================================================
// ROOM
// ================================================================
export type RoomType = 'pc' | 'console' | 'vr' | 'private';
export type RoomStatus = 'active' | 'inactive' | 'maintenance';

export interface Room {
  _id?: ObjectId;
  name: string;
  type: RoomType;
  description?: string;
  images: string[];
  pricePerHour: number;
  totalDevices: number;
  status: RoomStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ================================================================
// DEVICE  (1 room -> many devices)
// ================================================================
export type DeviceStatus = 'available' | 'booked' | 'maintenance';

export interface Device {
  _id?: ObjectId;
  roomId: ObjectId; // FK -> rooms._id
  deviceLabel: string;
  status: DeviceStatus;
  specs?: string;
  createdAt: Date;
}

// ================================================================
// BOOKING  (1 user -> many bookings, 1 room -> many bookings,
//           1 booking -> many devices, 1 booking -> 1 payment)
// ================================================================
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Booking {
  _id?: ObjectId;
  userId: ObjectId; // FK -> users._id
  roomId: ObjectId; // FK -> rooms._id
  deviceIds: ObjectId[]; // FK -> devices._id (array)
  deviceCount: number;
  bookingDate: Date;
  startTime: string; // e.g. "18:00"
  endTime: string; // e.g. "20:00"
  durationHours: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId?: ObjectId; // FK -> payments._id
  confirmationMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ================================================================
// NOTIFICATION
// ================================================================
export type NotificationType = 'reminder' | 'confirmation' | 'cancellation' | 'info';

export interface Notification {
  _id?: ObjectId;
  userId: ObjectId; // FK -> users._id
  bookingId?: ObjectId; // FK -> bookings._id (optional)
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// ================================================================
// PAYMENT  (1 booking -> 1 payment)
// ================================================================
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  _id?: ObjectId;
  bookingId: ObjectId; // FK -> bookings._id, unique
  userId: ObjectId; // FK -> users._id
  amount: number;
  currency: string;
  paymentMethod?: string; // e.g. "card", "stripe", "cash"
  transactionId?: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}
