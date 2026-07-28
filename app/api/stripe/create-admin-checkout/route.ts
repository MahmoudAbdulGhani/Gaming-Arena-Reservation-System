import { NextResponse } from 'next/server'
import stripe from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const { amount, metadata } = await req.json()

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least 50 cents' },
        { status: 400 },
      )
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'GameZone Arena Booking',
            description: `Booking reservation for ${metadata?.roomName || 'Room'}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      metadata: metadata ?? {},
      success_url: `${origin}/admin?payment_success=1`,
      cancel_url: `${origin}/admin?payment_cancelled=1`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout session creation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
