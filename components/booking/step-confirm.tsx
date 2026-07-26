'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, CreditCard, Lock, AlertCircle, Cpu } from 'lucide-react'
import type { BookingData } from '@/app/booking/page'
import { roomTypeLabels } from '@/lib/types'

interface Props {
  bookingData: BookingData
  onComplete: () => void
  onBack: () => void
}

export default function BookingStepConfirm({ bookingData, onComplete, onBack }: Props) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Cardholder name is required'
    if (cardNumber.replace(/\s/g, '').length < 16) newErrors.card = 'Enter a valid 16-digit card number'
    if (expiry.length < 5) newErrors.expiry = 'Enter a valid expiry date'
    if (cvc.length < 3) newErrors.cvc = 'Enter a valid CVC'
    if (!agreedToTerms) newErrors.terms = 'You must agree to the terms'
    return newErrors
  }

  const handlePay = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 2000))
    setIsProcessing(false)
    onComplete()
  }

  if (!bookingData.room) return null

  const { room, devices, date, startTime, durationHours, totalPrice } = bookingData
  const endHour = parseInt(startTime.split(':')[0]) + durationHours
  const endTime = `${String(endHour).padStart(2, '0')}:00`

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F5F6FA] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Confirm & Pay
        </h2>
        <p className="text-[#9BA3B7]">Review your booking details and complete payment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Booking summary */}
        <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D]">
          <h3 className="text-sm font-semibold text-[#F5F6FA] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Booking Summary
          </h3>

          <div className="relative h-32 rounded-xl overflow-hidden mb-4">
            <Image src={room.images[0]} alt={room.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-[#131824]/80 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <p className="text-base font-bold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
                {room.name}
              </p>
              <p className="text-xs text-[#9BA3B7]">{roomTypeLabels[room.type]}</p>
            </div>
          </div>

          {/* Reserved devices list */}
          {devices && devices.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-[#1B2130] border border-[#262D3D]">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-3.5 h-3.5 text-[#7C5CFF]" aria-hidden="true" />
                <span className="text-xs font-semibold text-[#F5F6FA]">Reserved Devices ({devices.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {devices.map((d) => (
                  <span
                    key={d._id}
                    className="px-2 py-1 rounded-md bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-xs font-medium text-[#7C5CFF]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {d.deviceLabel}
                  </span>
                ))}
              </div>
            </div>
          )}

          <dl className="space-y-3">
            {[
              {
                label: 'Date',
                value: new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
              },
              { label: 'Time', value: `${startTime} – ${endTime}` },
              { label: 'Duration', value: `${durationHours} hour${durationHours > 1 ? 's' : ''}` },
              { label: 'Devices', value: `${devices?.length ?? 0} × $${room.pricePerHour}/hr` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <dt className="text-[#9BA3B7]">{label}</dt>
                <dd className="text-[#F5F6FA] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>{value}</dd>
              </div>
            ))}
            <div className="border-t border-[#262D3D] pt-3 flex items-center justify-between">
              <dt className="text-[#F5F6FA] font-semibold">Total</dt>
              <dd className="text-2xl font-black text-[#7C5CFF]" style={{ fontFamily: 'var(--font-mono)' }}>
                ${totalPrice}
              </dd>
            </div>
          </dl>
        </div>

        {/* Payment form */}
        <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D]">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-[#7C5CFF]" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
              Payment Details
            </h3>
            <div className="ml-auto flex items-center gap-1 text-xs text-[#9BA3B7]">
              <Lock className="w-3 h-3" aria-hidden="true" />
              Secure
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="cardholder-name" className="block text-xs text-[#9BA3B7] mb-1.5">
                Cardholder Name
              </label>
              <input
                id="cardholder-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#1B2130] border ${errors.name ? 'border-[#FF5C7A]' : 'border-[#262D3D]'} text-[#F5F6FA] placeholder-[#9BA3B7]/50 focus:outline-none focus:border-[#7C5CFF]/60 text-sm transition-colors`}
                autoComplete="cc-name"
              />
              {errors.name && (
                <p className="text-xs text-[#FF5C7A] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="card-number" className="block text-xs text-[#9BA3B7] mb-1.5">
                Card Number
              </label>
              <input
                id="card-number"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className={`w-full px-4 py-2.5 rounded-xl bg-[#1B2130] border ${errors.card ? 'border-[#FF5C7A]' : 'border-[#262D3D]'} text-[#F5F6FA] placeholder-[#9BA3B7]/50 focus:outline-none focus:border-[#7C5CFF]/60 text-sm transition-colors`}
                autoComplete="cc-number"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              {errors.card && (
                <p className="text-xs text-[#FF5C7A] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.card}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expiry" className="block text-xs text-[#9BA3B7] mb-1.5">
                  Expiry Date
                </label>
                <input
                  id="expiry"
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#1B2130] border ${errors.expiry ? 'border-[#FF5C7A]' : 'border-[#262D3D]'} text-[#F5F6FA] placeholder-[#9BA3B7]/50 focus:outline-none focus:border-[#7C5CFF]/60 text-sm transition-colors`}
                  autoComplete="cc-exp"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
                {errors.expiry && <p className="text-xs text-[#FF5C7A] mt-1">{errors.expiry}</p>}
              </div>
              <div>
                <label htmlFor="cvc" className="block text-xs text-[#9BA3B7] mb-1.5">
                  CVC
                </label>
                <input
                  id="cvc"
                  type="text"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#1B2130] border ${errors.cvc ? 'border-[#FF5C7A]' : 'border-[#262D3D]'} text-[#F5F6FA] placeholder-[#9BA3B7]/50 focus:outline-none focus:border-[#7C5CFF]/60 text-sm transition-colors`}
                  autoComplete="cc-csc"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
                {errors.cvc && <p className="text-xs text-[#FF5C7A] mt-1">{errors.cvc}</p>}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded accent-[#7C5CFF]"
              />
              <span className="text-xs text-[#9BA3B7] leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-[#7C5CFF] hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-[#7C5CFF] hover:underline">Cancellation Policy</a>
              </span>
            </label>
            {errors.terms && (
              <p className="text-xs text-[#FF5C7A] flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.terms}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#9BA3B7] bg-[#131824] border border-[#262D3D] hover:text-[#F5F6FA] hover:border-[#7C5CFF]/40 transition-all duration-200 min-h-11 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white btn-primary-gradient glow-violet transition-all duration-200 min-h-11 disabled:opacity-70"
          aria-busy={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" aria-hidden="true" />
              Pay ${totalPrice} &mdash; Confirm Booking
            </>
          )}
        </button>
      </div>
    </div>
  )
}
