'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, Lock, AlertCircle, CreditCard, Banknote, Clock } from 'lucide-react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { BookingData } from '@/app/booking/page'
import { roomTypeLabels } from '@/lib/types'

interface Props {
  bookingData: BookingData
  onComplete: (data: Partial<BookingData>) => void
  onBack: () => void
}

const cardElementStyle = {
  style: {
    base: {
      fontSize: '16px',
      color: '#F5F6FA',
      fontFamily: 'var(--font-mono)',
      '::placeholder': { color: '#9BA3B7' },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#FF5C7A',
      iconColor: '#FF5C7A',
    },
  },
  hidePostalCode: true,
}

export default function BookingStepConfirm({ bookingData, onComplete, onBack }: Props) {
  const stripe = useStripe()
  const elements = useElements()

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>(bookingData.paymentMethod)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [cardComplete, setCardComplete] = useState(false)

  const handlePay = async () => {
    if (!agreedToTerms) { setPaymentError('You must agree to the terms'); return }
    setPaymentError('')
    setIsProcessing(true)

    try {
      if (paymentMethod === 'cash') {
        await new Promise((r) => setTimeout(r, 500))
        onComplete({ paymentMethod: 'cash' })
        return
      }

      if (!stripe || !elements) return
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return

      const amountInCents = bookingData.totalPrice * 100

      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInCents,
          currency: 'usd',
          metadata: {
            roomId: bookingData.room?._id,
            deviceCount: bookingData.devices?.length,
            date: bookingData.date,
            startTime: bookingData.startTime,
            durationHours: bookingData.durationHours,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start payment')

      const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: 'GameZone Customer' },
        },
      })

      if (stripeError) throw new Error(stripeError.message)

      onComplete({ paymentMethod: 'card' })
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!bookingData.room) return null

  const { room, devices, date, startTime, durationHours, totalPrice } = bookingData
  const endHour = parseInt(startTime.split(':')[0]) + durationHours
  const endTime = `${String(endHour).padStart(2, '0')}:00`

  const isCard = paymentMethod === 'card'
  const canSubmit = agreedToTerms && (isCard ? !!stripe && cardComplete : true)

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
            <div className="absolute inset-0 bg-gradient-to-t from-[#131824]/80 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <p className="text-base font-bold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
                {room.name}
              </p>
              <p className="text-xs text-[#9BA3B7]">{roomTypeLabels[room.type]}</p>
            </div>
          </div>

          {devices && devices.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-[#1B2130] border border-[#262D3D]">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-3.5 h-3.5 text-[#7C5CFF]" aria-hidden="true" />
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
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-[#7C5CFF]" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
              Payment Method
            </h3>
          </div>

          {/* Method toggle */}
          <div className="grid grid-cols-2 gap-2 mb-5" role="radiogroup" aria-label="Payment method">
            <button
              onClick={() => { setPaymentMethod('card'); setPaymentError('') }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                isCard
                  ? 'bg-[#7C5CFF]/15 border-[#7C5CFF] text-[#7C5CFF]'
                  : 'bg-[#1B2130] border-[#262D3D] text-[#9BA3B7] hover:border-[#7C5CFF]/40 hover:text-[#F5F6FA]'
              }`}
              role="radio"
              aria-checked={isCard}
            >
              <CreditCard className="w-4 h-4" />
              Card
            </button>
            <button
              onClick={() => { setPaymentMethod('cash'); setPaymentError(''); setCardComplete(false) }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                !isCard
                  ? 'bg-[#33E6A0]/15 border-[#33E6A0] text-[#33E6A0]'
                  : 'bg-[#1B2130] border-[#262D3D] text-[#9BA3B7] hover:border-[#33E6A0]/40 hover:text-[#F5F6FA]'
              }`}
              role="radio"
              aria-checked={!isCard}
            >
              <Banknote className="w-4 h-4" />
              Cash
            </button>
          </div>

          {/* Card form (Stripe) */}
          {isCard && (
            <div className="p-4 rounded-xl bg-[#1B2130] border border-[#262D3D] mb-4" style={{ minHeight: '44px' }}>
              <label className="block text-xs text-[#9BA3B7] mb-3">Card Details</label>
              <div style={{ minHeight: '24px' }}>
                <CardElement
                  options={cardElementStyle}
                  onChange={(e) => setCardComplete(e.complete)}
                />
              </div>
            </div>
          )}

          {/* Cash notice */}
          {!isCard && (
            <div className="p-4 rounded-xl bg-[#33E6A0]/5 border border-[#33E6A0]/15 mb-4 space-y-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#33E6A0] shrink-0" />
                <span className="text-sm font-semibold text-[#33E6A0]">Pay at the Arena</span>
              </div>
              <p className="text-xs text-[#9BA3B7] leading-relaxed">
                Your booking will be <span className="text-[#FFB347] font-semibold">pending</span> until
                an admin confirms your cash payment. Arrive at the front desk to pay and finalize.
              </p>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#131824]">
                <Clock className="w-3.5 h-3.5 text-[#FFB347] shrink-0" />
                <span className="text-[10px] text-[#FFB347]">Pending approval after payment at venue</span>
              </div>
            </div>
          )}

          {paymentError && (
            <div className="p-3 rounded-xl bg-[#FF5C7A]/10 border border-[#FF5C7A]/20 mb-4">
              <p className="text-xs text-[#FF5C7A] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {paymentError}
              </p>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => { setAgreedToTerms(e.target.checked); setPaymentError('') }}
              className="mt-0.5 rounded accent-[#7C5CFF]"
            />
            <span className="text-xs text-[#9BA3B7] leading-relaxed">
              I agree to the{' '}
              <a href="#" className="text-[#7C5CFF] hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-[#7C5CFF] hover:underline">Cancellation Policy</a>
            </span>
          </label>

          {isCard && (
            <div className="p-3 rounded-xl bg-[#7C5CFF]/5 border border-[#7C5CFF]/10">
              <p className="text-[10px] text-[#9BA3B7] leading-relaxed">
                Test mode — use card <span style={{ fontFamily: 'var(--font-mono)' }}>4242 4242 4242 4242</span>,
                any future date, any CVC.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#9BA3B7] bg-[#131824] border border-[#262D3D] hover:text-[#F5F6FA] hover:border-[#7C5CFF]/40 transition-all duration-200 min-h-[44px] disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>
        <button
          onClick={handlePay}
          disabled={isProcessing || !canSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white btn-primary-gradient glow-violet transition-all duration-200 min-h-[44px] disabled:opacity-70"
          aria-busy={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
              {isCard ? 'Processing Payment...' : 'Reserving...'}
            </>
          ) : isCard ? (
            <>
              <Lock className="w-4 h-4" aria-hidden="true" />
              Pay ${totalPrice} &mdash; Confirm Booking
            </>
          ) : (
            <>
              <Banknote className="w-4 h-4" aria-hidden="true" />
              Reserve &mdash; Pay ${totalPrice} Later
            </>
          )}
        </button>
      </div>
    </div>
  )
}
