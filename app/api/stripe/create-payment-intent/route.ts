import { NextResponse } from 'next/server'
import stripe from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const { amount, currency, metadata } = await req.json()

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least 50 cents' },
        { status: 400 },
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: metadata ?? {},
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment intent creation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
