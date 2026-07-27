import Stripe from 'stripe'

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is missing from .env.local')
  }
  return new Stripe(key, {
    apiVersion: '2026-06-24.dahlia',
  })
}

let cached: Stripe | undefined
const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!cached) cached = getStripe()
    return Reflect.get(cached, prop)
  },
})

export default stripe