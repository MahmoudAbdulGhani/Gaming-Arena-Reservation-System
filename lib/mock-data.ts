import type { Room, Device, Booking, User } from './types'

export const mockRooms: Room[] = [
  {
    _id: 'r1',
    name: 'Alpha Station',
    type: 'pc',
    description:
      'Flagship PC gaming room with 6 high-end rigs powered by RTX 4090 and Intel Core i9. Experience buttery-smooth gameplay at 240Hz with mechanical tactile feedback.',
    images: ['/images/room-pc.png'],
    pricePerHour: 15,
    totalDevices: 6,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    _id: 'r2',
    name: 'Beta Station ',
    type: 'pc',
    description:
      'High-performance PC room with RTX 4080 rigs and ultra-wide curved displays. Perfect for immersive single-player or competitive FPS sessions.',
    images: ['/images/room-pc.png'],
    pricePerHour: 12,
    totalDevices: 4,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    _id: 'r3',
    name: 'Console Lounge',
    type: 'console',
    description:
      'PS5 and Xbox Series X setups on premium 4K OLED TVs. Perfect for sports, racing, and fighting games with your friends.',
    images: ['/images/room-console.png'],
    pricePerHour: 10,
    totalDevices: 4,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    _id: 'r4',
    name: 'VR Arena',
    type: 'vr',
    description:
      'Full-room VR play spaces with Meta Quest Pro and Valve Index headsets. Dive into immersive virtual worlds, rhythm games, and multiplayer VR experiences.',
    images: ['/images/room-vr.png'],
    pricePerHour: 20,
    totalDevices: 3,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    _id: 'r5',
    name: 'Private Suite A',
    type: 'private',
    description:
      'Exclusive glass-walled private room with 6 high-end PCs, a mini fridge, lounge seating, and dedicated support. Perfect for birthday parties and corporate events.',
    images: ['/images/room-private.png'],
    pricePerHour: 80,
    totalDevices: 6,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    _id: 'r6',
    name: 'Private Suite B',
    type: 'private',
    description:
      'Intimate private room with 4 gaming rooms, a console setup, and ambient smart lighting. Ideal for tournaments, team scrims, or an elevated group session.',
    images: ['/images/room-private.png'],
    pricePerHour: 60,
    totalDevices: 4,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

export const mockDevices: Device[] = [
  // Alpha Station  6 PCs
  { _id: 'd1', roomId: 'r1', deviceLabel: 'PC-01', status: 'available', specs: 'i9-14900K · RTX 4090 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd2', roomId: 'r1', deviceLabel: 'PC-02', status: 'available', specs: 'i9-14900K · RTX 4090 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd3', roomId: 'r1', deviceLabel: 'PC-03', status: 'booked', specs: 'i9-14900K · RTX 4090 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd4', roomId: 'r1', deviceLabel: 'PC-04', status: 'available', specs: 'i9-14900K · RTX 4090 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd5', roomId: 'r1', deviceLabel: 'PC-05', status: 'booked', specs: 'i9-14900K · RTX 4090 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd6', roomId: 'r1', deviceLabel: 'PC-06', status: 'maintenance', specs: 'i9-14900K · RTX 4090 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },

  // Beta Station  4 PCs
  { _id: 'd7', roomId: 'r2', deviceLabel: 'PC-01', status: 'available', specs: 'Ryzen 9 7950X · RTX 4080 · 32GB · 34" 144Hz UW', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd8', roomId: 'r2', deviceLabel: 'PC-02', status: 'available', specs: 'Ryzen 9 7950X · RTX 4080 · 32GB · 34" 144Hz UW', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd9', roomId: 'r2', deviceLabel: 'PC-03', status: 'available', specs: 'Ryzen 9 7950X · RTX 4080 · 32GB · 34" 144Hz UW', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd10', roomId: 'r2', deviceLabel: 'PC-04', status: 'available', specs: 'Ryzen 9 7950X · RTX 4080 · 32GB · 34" 144Hz UW', createdAt: '2026-01-01T00:00:00Z' },

  // Console Lounge (r3) – 4 consoles
  { _id: 'd11', roomId: 'r3', deviceLabel: 'Console-01', status: 'available', specs: 'PS5 · 65" 4K OLED 120Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd12', roomId: 'r3', deviceLabel: 'Console-02', status: 'booked', specs: 'PS5 · 55" 4K 120Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd13', roomId: 'r3', deviceLabel: 'Console-03', status: 'available', specs: 'Xbox Series X · 65" 4K OLED 120Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd14', roomId: 'r3', deviceLabel: 'Console-04', status: 'available', specs: 'Xbox Series X + Racing Wheel · 55" 4K', createdAt: '2026-01-01T00:00:00Z' },

  // VR Arena (r4) – 3 headsets
  { _id: 'd15', roomId: 'r4', deviceLabel: 'VR-01', status: 'available', specs: 'Meta Quest Pro · 4×4m play area', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd16', roomId: 'r4', deviceLabel: 'VR-02', status: 'available', specs: 'Meta Quest Pro · 4×4m play area', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd17', roomId: 'r4', deviceLabel: 'VR-03', status: 'maintenance', specs: 'Valve Index · Full-body tracking', createdAt: '2026-01-01T00:00:00Z' },

  // Private Suite A (r5) – 6 PCs
  { _id: 'd18', roomId: 'r5', deviceLabel: 'PC-01', status: 'available', specs: 'i9 · RTX 4080 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd19', roomId: 'r5', deviceLabel: 'PC-02', status: 'available', specs: 'i9 · RTX 4080 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd20', roomId: 'r5', deviceLabel: 'PC-03', status: 'available', specs: 'i9 · RTX 4080 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd21', roomId: 'r5', deviceLabel: 'PC-04', status: 'available', specs: 'i9 · RTX 4080 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd22', roomId: 'r5', deviceLabel: 'PC-05', status: 'available', specs: 'i9 · RTX 4080 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd23', roomId: 'r5', deviceLabel: 'PC-06', status: 'available', specs: 'i9 · RTX 4080 · 64GB · 27" 240Hz', createdAt: '2026-01-01T00:00:00Z' },

  // Private Suite B (r6) – 4 PCs
  { _id: 'd24', roomId: 'r6', deviceLabel: 'PC-01', status: 'available', specs: 'Ryzen 9 · RTX 4070 · 32GB · 27" 165Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd25', roomId: 'r6', deviceLabel: 'PC-02', status: 'available', specs: 'Ryzen 9 · RTX 4070 · 32GB · 27" 165Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd26', roomId: 'r6', deviceLabel: 'PC-03', status: 'available', specs: 'Ryzen 9 · RTX 4070 · 32GB · 27" 165Hz', createdAt: '2026-01-01T00:00:00Z' },
  { _id: 'd27', roomId: 'r6', deviceLabel: 'PC-04', status: 'booked', specs: 'Ryzen 9 · RTX 4070 · 32GB · 27" 165Hz', createdAt: '2026-01-01T00:00:00Z' },
]

export const mockBookings: Booking[] = [
  // ── Upcoming (pending / confirmed) — 3 total ──
  {
    _id: 'b1',
    userId: 'u1',
    roomId: 'r1',
    room: mockRooms[0],
    deviceIds: ['d3', 'd5'],
    deviceCount: 2,
    bookingDate: '2026-07-25',
    startTime: '14:00',
    endTime: '16:00',
    durationHours: 2,
    totalPrice: 60,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-07-21T10:00:00Z',
    updatedAt: '2026-07-21T10:00:00Z',
  },
  {
    _id: 'b2',
    userId: 'u1',
    roomId: 'r4',
    room: mockRooms[3],
    deviceIds: ['d15'],
    deviceCount: 1,
    bookingDate: '2026-07-28',
    startTime: '18:00',
    endTime: '19:00',
    durationHours: 1,
    totalPrice: 20,
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: '2026-07-21T11:00:00Z',
    updatedAt: '2026-07-21T11:00:00Z',
  },
  {
    _id: 'b3',
    userId: 'u1',
    roomId: 'r2',
    room: mockRooms[1],
    deviceIds: ['d9'],
    deviceCount: 1,
    bookingDate: '2026-07-30',
    startTime: '16:00',
    endTime: '18:00',
    durationHours: 2,
    totalPrice: 24,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-07-22T09:00:00Z',
    updatedAt: '2026-07-22T09:00:00Z',
  },

  // ── History (completed / cancelled) — 3 total ──
  {
    _id: 'b4',
    userId: 'u1',
    roomId: 'r3',
    room: mockRooms[2],
    deviceIds: ['d11', 'd13'],
    deviceCount: 2,
    bookingDate: '2026-07-10',
    startTime: '19:00',
    endTime: '22:00',
    durationHours: 3,
    totalPrice: 148,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: '2026-07-08T09:00:00Z',
    updatedAt: '2026-07-10T22:00:00Z',
  },
  {
    _id: 'b5',
    userId: 'u1',
    roomId: 'r5',
    room: mockRooms[4],
    deviceIds: ['d18', 'd19', 'd20'],
    deviceCount: 3,
    bookingDate: '2026-07-15',
    startTime: '20:00',
    endTime: '23:00',
    durationHours: 3,
    totalPrice: 120,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: '2026-07-10T09:00:00Z',
    updatedAt: '2026-07-15T23:00:00Z',
  },
  {
    _id: 'b6',
    userId: 'u1',
    roomId: 'r6',
    room: mockRooms[5],
    deviceIds: ['d24'],
    deviceCount: 1,
    bookingDate: '2026-07-05',
    startTime: '15:00',
    endTime: '17:00',
    durationHours: 2,
    totalPrice: 120,
    status: 'cancelled',
    paymentStatus: 'refunded',
    createdAt: '2026-07-03T09:00:00Z',
    updatedAt: '2026-07-05T14:00:00Z',
  },
]

export const mockUser: User = {
  _id: 'u1',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  role: 'customer',
  phone: '+1 (555) 234-5678',
  isVerified: true,
  loyaltyPoints: 0,
  createdAt: '2026-03-15T00:00:00Z',
}

export interface AdminUser extends User {
  bookings: number
  totalSpent: number
}

export const mockUsers: AdminUser[] = [
  {
    _id: 'u2',
    name: 'Marcus Chen',
    email: 'marcus.chen@email.com',
    role: 'admin',
    isVerified: true,
    loyaltyPoints: 0,
    createdAt: '2025-01-12T00:00:00Z',
    bookings: 24,
    totalSpent: 890,
  },
  {
    _id: 'u3',
    name: 'Priya Nair',
    email: 'priya.nair@email.com',
    role: 'customer',
    isVerified: true,
    loyaltyPoints: 110,
    createdAt: '2025-03-04T00:00:00Z',
    bookings: 11,
    totalSpent: 312,
  },
  {
    _id: 'u4',
    name: 'Jordan Miles',
    email: 'jordan.miles@email.com',
    role: 'customer',
    isVerified: true,
    loyaltyPoints: 70,
    createdAt: '2025-04-18T00:00:00Z',
    bookings: 7,
    totalSpent: 196,
  },
  {
    _id: 'u5',
    name: 'Aya Tanaka',
    email: 'aya.tanaka@email.com',
    role: 'customer',
    isVerified: false,
    loyaltyPoints: 30,
    createdAt: '2025-06-30T00:00:00Z',
    bookings: 3,
    totalSpent: 68,
  },
  {
    _id: 'u6',
    name: 'Levi Okonkwo',
    email: 'levi.okonkwo@email.com',
    role: 'customer',
    isVerified: false,
    loyaltyPoints: 0,
    createdAt: '2026-07-19T00:00:00Z',
    bookings: 0,
    totalSpent: 0,
  },
]

export const testimonials = [
  {
    id: 1,
    name: 'Marcus R.',
    role: 'Esports Player',
    content:
      "The Alpha PC Lab is insane - RTX 4090 at 240Hz makes my aim feel like a superpower. Best arena I've been to in the city.",
    rating: 5,
  },
  {
    id: 2,
    name: 'Priya S.',
    role: 'Casual Gamer',
    content:
      'Booked two VR headsets for my birthday and the whole group was blown away. Booking individual devices online took 2 minutes flat.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Jordan T.',
    role: 'Team Captain',
    content:
      'We rented Private Suite A with 4 PCs for our tournament scrims. The room setup is flawless and the support staff was really helpful.',
    rating: 5,
  },
]

export const timeSlots = [
  '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00',
]

export interface ReservedSlot {
  start: string
  end: string
}

// Reserved time ranges per device — each entry means the device is
// booked from `start` (inclusive) to `end` (exclusive).
export const reservedDeviceSlots: Record<string, ReservedSlot[]> = {
  d3:  [{ start: '14:00', end: '16:00' }],
  d5:  [{ start: '14:00', end: '16:00' }],
  d12: [{ start: '10:00', end: '14:00' }],
  d15: [{ start: '18:00', end: '19:00' }],
}