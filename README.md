# GameZone Arena - Gaming Arena Reservation System

A web application for browsing gaming arenas, booking real-time slots, and managing reservations. Built with Next.js 16, TypeScript, MongoDB.

## Features

- **Room Browsing** - Browse PC, Console, VR, and Private rooms with availability status
- **Booking Flow** - Select room → pick date/time → choose devices → confirm & pay
- **Automatic Status Transitions** - `confirmed → in_progress → completed` with device freeing
- **Conflict Detection** - Time-slot based device conflict checking prevents double-booking
- **Private Rooms** - Flat rate pricing, books all devices, skips device selection step
- **Notifications** - In-app reminders 1 hour before booking, admin alerts on new bookings
- **Admin Panel** - Manage rooms, devices, users, bookings; process refunds; download reports
- **Payment** - Stripe card payments and cash payment support
- **Policy Enforcement** - Cancel blocked within 1 hour of start time; modify always allowed

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.11 (Turbopack) |
| Language | TypeScript |
| Database | MongoDB 7.x (native driver) |
| Auth | JWT + bcryptjs |
| Payments | Stripe |
| Email | Nodemailer (SMTP) |
| Styling | Tailwind CSS |

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance (local or Atlas)
- Stripe account (for payment features)
- Gmail app password (for email notifications)

### Environment Variables

Create `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/gars_db
JWT_SECRET=<your-jwt-secret>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>
SMTP_FROM="GameZone Arena <email>"

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-pk>
STRIPE_SECRET_KEY=<stripe-sk>
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

Run the MongoDB schema script to create collections and validators:

```bash
mongosh < database/gars-schema.mongodb.js
```

This creates `users`, `rooms`, `devices`, `bookings`, `payments`, and `notifications` collections with validation schemas and indexes.

## Booking Status Lifecycle

```
pending → confirmed → in_progress → completed
              ↘ cancelled              ↗
```

- **confirmed → in_progress**: Auto-transitions when start time is reached
- **in_progress → completed**: Auto-transitions when end time passes; devices freed
- **cancelled**: Manual (user cancel within policy) or admin refund
- Transitions run on every booking fetch (both user and admin GET routes)

## API Routes

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login with email/password |
| `GET /api/rooms` | List all rooms |
| `GET /api/rooms/:id` | Room details |
| `GET /api/rooms/:id/devices` | Devices in a room |
| `POST /api/bookings` | Create booking |
| `GET /api/bookings/my` | Current user's bookings |
| `PATCH /api/bookings/:id` | Cancel/modify booking |
| `GET /api/bookings/check-conflicts` | Check time-slot conflicts |
| `GET /api/admin/bookings` | All bookings (admin) |
| `POST /api/admin/bookings` | Create booking as admin |
| `PATCH /api/admin/bookings/:id/refund` | Refund booking |
| `PATCH /api/admin/bookings/:id/approve-cash` | Approve cash payment |
| `GET /api/notifications` | Get notifications |
| `PATCH /api/notifications/:id` | Mark notification as read |

## Project Structure

```
app/
  api/          — API routes (auth, bookings, rooms, admin, notifications)
  booking/      — Multi-step booking wizard
  dashboard/    — Customer dashboard
  rooms/        — Room listing & detail pages
  admin/        — Admin panel
components/
  booking/      — Booking flow components (step-room, step-datetime, step-devices, step-confirm)
  dashboard/    — Dashboard components (booking-card, tabs)
  ui/           — Shared UI components
lib/
  types.ts      — TypeScript types, utility functions
  models.ts     — Server-side type definitions
  mongodb.ts    — Database connection
  auth.ts       — JWT, password hashing, OTP
  booking-policy.ts — Policy rules (cancel/modify restrictions)
  booking-transitions.ts — Auto status transitions + device freeing
  email.ts      — Email sending
  stripe.ts     — Stripe client
  admin-helper.ts — Admin API utilities
database/
  gars-schema.mongodb.js — MongoDB schema + seed data
public/images/ — Room fallback images
```

## Key Design Decisions

- **Date stored as UTC Date**: `bookingDate` is stored as midnight UTC Date. Frontend `formatDate` parses the date string directly to avoid timezone shifts.
- **Device status vs booking conflicts**: Device `available/booked` status is a global flag. Time-slot conflicts are checked separately via the check-conflicts API, allowing the same device to be booked at different times.
- **Private rooms**: No per-device selection. Flat rate `pricePerHour × duration`. All room devices are booked/freed together.
