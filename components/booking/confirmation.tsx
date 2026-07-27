'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Clock, Calendar, Gamepad2, Download, LayoutDashboard, Cpu, Banknote, AlertCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import type { BookingData } from '@/app/booking/page'
import { roomTypeLabels } from '@/lib/types'


interface Props {
  bookingData: BookingData
}

export default function BookingConfirmation({ bookingData }: Props) {
  const { room, devices, date, startTime, durationHours, totalPrice, paymentMethod } = bookingData

  

  const [bookingCode] = useState(() =>
    `GZ-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  )

  if (!room) return null

  const currentRoom = room

  const endHour = parseInt(startTime.split(':')[0]) + durationHours
  const endTime = `${String(endHour).padStart(2, '0')}:00`

  const isCash = paymentMethod === 'cash'

// function handleDownloadReceipt() {
//   const doc = new jsPDF()
//   const pageCenter = 105 // half of the A4 page's 210mm width
//   let y = 20

//   // Logo — purple rounded square, matching the navbar's logo treatment
//   const logoSize = 10
//   doc.setFillColor(124, 92, 255)
//   doc.roundedRect(pageCenter - logoSize / 2, y, logoSize, logoSize, 2, 2, 'F')
//   doc.setFont('helvetica', 'bold')
//   doc.setFontSize(9)
//   doc.setTextColor(255, 255, 255)
//   doc.text('G', pageCenter, y + logoSize / 2 + 1, { align: 'center' })

//   y += logoSize + 8
//   doc.setFont('helvetica', 'bold')
//   doc.setFontSize(18)
//   doc.setTextColor(0, 0, 0)
//   doc.text('GameZone', pageCenter, y, { align: 'center' })

//   y += 7
//   doc.setFont('helvetica', 'normal')
//   doc.setFontSize(11)
//   doc.setTextColor(120, 120, 120)
//   doc.text('Booking Receipt', pageCenter, y, { align: 'center' })

//   y += 8
//   doc.setDrawColor(210, 210, 210)
//   doc.line(40, y, 170, y)

//   // Status line
//   y += 12
//   doc.setFont('helvetica', 'bold')
//   doc.setFontSize(14)
//   doc.setTextColor(0, 0, 0)
//   doc.text(isCash ? 'Booking Pending — Payment Approval Required' : 'Booking Confirmed', pageCenter, y, { align: 'center' })

//   // Pending-approval note (cash only)
//   if (isCash) {
//     y += 8
//     doc.setFont('helvetica', 'bold')
//     doc.setFontSize(12)
//     doc.setTextColor(255, 179, 71)
//     doc.text('Pending Payment Approval', pageCenter, y, { align: 'center' })
//     doc.setTextColor(0, 0, 0)
//   }

//   // Booking code
//   y += 10
//   doc.setFont('helvetica', 'normal')
//   doc.setFontSize(11)
//   doc.text(`Booking Code: ${bookingCode}`, pageCenter, y, { align: 'center' })

//   // Room + type
//   y += 12
//   doc.setFont('helvetica', 'bold')
//   doc.setFontSize(13)
//   doc.text(currentRoom.name, pageCenter, y, { align: 'center' })
//   doc.setFont('helvetica', 'normal')
//   doc.setFontSize(10)
//   doc.setTextColor(120, 120, 120)
//   doc.text(roomTypeLabels[currentRoom.type], pageCenter, y + 6, { align: 'center' })
//   doc.setTextColor(0, 0, 0)

//   y += 16

//   // Devices
//   if (devices && devices.length > 0) {
//     doc.text(`Devices: ${devices.map((d) => d.deviceLabel).join(', ')}`, pageCenter, y, { align: 'center' })
//     y += 8
//   }

//   // Date / time / location
//   const formattedDate = new Date(date).toLocaleDateString('en-US', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   })
//   doc.text(`Date: ${formattedDate}`, pageCenter, y, { align: 'center' })
//   y += 8
//   doc.text(`Time: ${startTime} - ${endTime} (${durationHours}h)`, pageCenter, y, { align: 'center' })
//   y += 8
//   doc.text('Location: GameZone Arena, Main Floor', pageCenter, y, { align: 'center' })

//   // Amount
//   y += 10
//   doc.setDrawColor(210, 210, 210)
//   doc.line(40, y, 170, y)
//   y += 10
//   doc.setFont('helvetica', 'bold')
//   doc.setFontSize(14)
//   doc.text(isCash ? 'Amount Due:' : 'Amount Paid:', pageCenter, y, { align: 'center' })
//   y += 8
//   doc.setFontSize(16)
//   doc.text(`$${totalPrice}`, pageCenter, y, { align: 'center' })

//   // Cash note
//   if (isCash) {
//     y += 12
//     doc.setFont('helvetica', 'normal')
//     doc.setFontSize(9)
//     doc.setTextColor(180, 120, 20)
//     const note = doc.splitTextToSize(
//       'Pay cash at the front desk. Your booking will be confirmed once payment is received.',
//       130
//     )
//     doc.text(note, pageCenter, y, { align: 'center' })
//   }

//   doc.save(`receipt-${bookingCode}.pdf`)
function handleDownloadReceipt() {
  const doc = new jsPDF()
  const pageWidth = 210
  const pageCenter = 105

  // ---- Header band ----
  doc.setFillColor(60, 52, 137)
  doc.rect(0, 0, pageWidth, 32, 'F')

  const logoSize = 9
  doc.setFillColor(127, 119, 221)
  doc.roundedRect(20, 9, logoSize, logoSize, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('G', 20 + logoSize / 2, 9 + logoSize / 2 + 1.2, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('GameZone Arena', 33, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(206, 203, 246)
  doc.text('Booking Receipt', 33, 22)

  let y = 46

  // ---- Status pill ----
  const pillText = isCash ? 'Booking Pending' : 'Booking Confirmed'
  const pillBg: [number, number, number] = isCash ? [250, 238, 218] : [234, 243, 222]
  const pillTextColor: [number, number, number] = isCash ? [133, 79, 11] : [39, 80, 10]

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  const pillTextWidth = doc.getTextWidth(pillText)
  const pillPaddingX = 8
  const pillWidth = pillTextWidth + pillPaddingX * 2
  const pillHeight = 9
  const pillX = pageCenter - pillWidth / 2

  doc.setFillColor(...pillBg)
  doc.roundedRect(pillX, y, pillWidth, pillHeight, pillHeight / 2, pillHeight / 2, 'F')
  doc.setTextColor(...pillTextColor)
  doc.text(pillText, pageCenter, y + pillHeight / 2 + 1.5, { align: 'center' })

  y += pillHeight + 10

  // ---- Booking code ----
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(60, 52, 137)
  doc.text(bookingCode, pageCenter, y, { align: 'center' })

  y += 12

  // ---- Room name + type ----
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(38, 33, 92)
  doc.text(currentRoom.name, pageCenter, y, { align: 'center' })

  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(136, 135, 128)
  doc.text(roomTypeLabels[currentRoom.type], pageCenter, y, { align: 'center' })

  y += 10
  doc.setDrawColor(211, 209, 199)
  doc.line(45, y, 165, y)

  y += 10

  // ---- Two-column details ----
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const rows: [string, string][] = [
    ['Date', formattedDate],
    ['Time', `${startTime} - ${endTime} (${durationHours}h)`],
  ]
  if (devices && devices.length > 0) {
    rows.push(['Devices', devices.map((d) => d.deviceLabel).join(', ')])
  }
  rows.push(['Location', 'GameZone Arena, Main Floor'])

  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(136, 135, 128)
    doc.text(label, 45, y)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(44, 44, 42)
    doc.text(value, 165, y, { align: 'right' })

    y += 8
  })

  y += 6

  // ---- Highlighted amount box ----
  const amountBg: [number, number, number] = isCash ? [250, 238, 218] : [234, 243, 222]
  const amountLabelColor: [number, number, number] = isCash ? [133, 79, 11] : [59, 109, 17]
  const amountValueColor: [number, number, number] = isCash ? [65, 36, 2] : [23, 52, 4]

  const boxHeight = 20
  doc.setFillColor(...amountBg)
  doc.roundedRect(45, y, 120, boxHeight, 4, 4, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...amountLabelColor)
  doc.text(isCash ? 'Amount Due' : 'Amount Paid', 53, y + boxHeight / 2 + 1)

  doc.setFontSize(16)
  doc.setTextColor(...amountValueColor)
  doc.text(`$${totalPrice}`, 157, y + boxHeight / 2 + 2, { align: 'right' })

  y += boxHeight + 12

  // ---- Cash note ----
  if (isCash) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(133, 79, 11)
    const note = doc.splitTextToSize(
      'Pay cash at the front desk. Your booking will be confirmed once payment is received.',
      130
    )
    doc.text(note, pageCenter, y, { align: 'center' })
    y += note.length * 5 + 6
  }

  // ---- Footer ----
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(180, 178, 169)
  doc.text('Thanks for booking with GameZone Arena', pageCenter, y, { align: 'center' })

  doc.save(`receipt-${bookingCode}.pdf`)
}

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-lg text-center">
        {/* Status icon */}
        <div className="flex items-center justify-center mb-6">
          {isCash ? (
            <div className="w-20 h-20 rounded-full bg-[#FFB347]/10 border-2 border-[#FFB347]/30 flex items-center justify-center">
              <Clock className="w-10 h-10 text-[#FFB347]" aria-hidden="true" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#33E6A0]/10 border-2 border-[#33E6A0]/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#33E6A0]" aria-hidden="true" />
            </div>
          )}
        </div>

        {isCash ? (
          <>
            <h2 className="text-3xl font-black text-[#F5F6FA] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Booking Pending
            </h2>
            <p className="text-[#9BA3B7] mb-4">
              Your reservation is saved. Pay at the front desk to confirm.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FFB347]/10 border border-[#FFB347]/20 mb-8">
              <AlertCircle className="w-4 h-4 text-[#FFB347]" />
              <span className="text-sm font-semibold text-[#FFB347]">Pending Payment Approval</span>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black text-[#F5F6FA] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Booking Confirmed!
            </h2>
            <p className="text-[#9BA3B7] mb-8">
              Your devices have been reserved. See you at the arena!
            </p>
          </>
        )}

        {/* Booking code */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 mb-8">
          <span className="text-xs text-[#9BA3B7]">Booking Code</span>
          <span
            className="text-xl font-black text-[#7C5CFF] tracking-widest"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {bookingCode}
          </span>
        </div>

        {/* Summary card */}
        <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D] text-left mb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
              <Image src={currentRoom.images[0]} alt={currentRoom.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-bold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
                {currentRoom.name}
              </p>
              <p className="text-sm text-[#9BA3B7]">{roomTypeLabels[currentRoom.type]}</p>
            </div>
          </div>

          {/* Reserved devices */}
          {devices && devices.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[#1B2130] border border-[#262D3D]">
              <Cpu className="w-3.5 h-3.5 text-[#7C5CFF] shrink-0" aria-hidden="true" />
              <span className="text-xs text-[#9BA3B7]">Devices:</span>
              <div className="flex flex-wrap gap-1.5">
                {devices.map((d) => (
                  <span
                    key={d._id}
                    className="px-2 py-0.5 rounded-md bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-xs font-medium text-[#7C5CFF]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {d.deviceLabel}
                  </span>
                ))}
              </div>
            </div>
          )}

          <dl className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
              <dt className="sr-only">Date</dt>
              <dd className="text-sm text-[#F5F6FA]">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
              <dt className="sr-only">Time</dt>
              <dd className="text-sm text-[#F5F6FA]" style={{ fontFamily: 'var(--font-mono)' }}>
                {startTime} &ndash; {endTime} ({durationHours}h)
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
              <dt className="sr-only">Location</dt>
              <dd className="text-sm text-[#F5F6FA]">GameZone Arena, Main Floor</dd>
            </div>
            <div className="border-t border-[#262D3D] pt-3 flex items-center justify-between">
              <dt className="text-sm text-[#9BA3B7]">
                {isCash ? 'Amount Due' : 'Amount Paid'}
              </dt>
              <dd className={`text-xl font-black ${isCash ? 'text-[#FFB347]' : 'text-[#33E6A0]'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                ${totalPrice}
              </dd>
            </div>
            {isCash && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFB347]/5 border border-[#FFB347]/15">
                <Banknote className="w-4 h-4 text-[#FFB347] shrink-0" />
                <span className="text-xs text-[#FFB347]">
                  Pay cash at the front desk. Your booking will be confirmed once payment is received.
                </span>
              </div>
            )}
          </dl>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white btn-primary-gradient transition-all duration-200 min-h-11"
          >
            <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
            View My Bookings
          </Link>
          <button
            onClick={handleDownloadReceipt}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#9BA3B7] bg-[#131824] border border-[#262D3D] hover:text-[#F5F6FA] hover:border-[#7C5CFF]/40 transition-all duration-200 min-h-11"
            aria-label="Download booking confirmation"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download Receipt
          </button>
        </div>

        <Link
          href="/booking"
          className="block mt-4 text-sm text-[#9BA3B7] hover:text-[#7C5CFF] transition-colors duration-200"
        >
          Make another booking
        </Link>
      </div>
    </div>
  )
}


