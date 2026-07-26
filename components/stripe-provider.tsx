'use client'

import { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

let stripePromise: ReturnType<typeof loadStripe> | null = null

function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) return null
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

export default function StripeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const stripe = getStripe()

  useEffect(() => {
    if (!stripe) return
    stripe.then((s) => { if (s) setReady(true) })
  }, [stripe])

  if (!stripe) {
    return (
      <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D] text-center">
        <p className="text-[#FF5C7A] text-sm">Stripe is not configured. Add your test keys to <code className="text-xs bg-[#1B2130] px-1.5 py-0.5 rounded">.env.local</code></p>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="p-6 rounded-2xl bg-[#131824] border border-[#262D3D] flex items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
        <span className="text-sm text-[#9BA3B7]">Loading payment form...</span>
      </div>
    )
  }

  return (
    <Elements stripe={stripe}>
      {children}
    </Elements>
  )
}
