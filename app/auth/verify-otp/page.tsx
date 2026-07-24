'use client'

import { Suspense } from 'react'
import { useState, useRef, useEffect } from 'react'
import type { FormEvent, KeyboardEvent, ClipboardEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Gamepad2, Loader2, Mail } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const { verifyOtp, resendOtp } = useAuth()

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!token) router.push('/auth/login')
  }, [token, router])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newDigits = [...digits]
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setDigits(newDigits)
    const nextIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }
    setError('')
    setLoading(true)
    try {
      const role = await verifyOtp(token, otp)
      router.push(role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setError('')
    try {
      const newToken = await resendOtp(token)
      const params = new URLSearchParams({ token: newToken })
      router.replace(`/auth/verify-otp?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7C5CFF]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#33E6A0]/5 blur-[100px] pointer-events-none" />

      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-[#7C5CFF] flex items-center justify-center glow-violet-sm group-hover:scale-110 transition-transform duration-200">
          <Gamepad2 className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <span
          className="text-xl font-bold text-[#F5F6FA] tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Game<span className="text-[#7C5CFF]">Zone</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-[#131824] border border-[#262D3D] rounded-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-[#7C5CFF]" />
          </div>
          <h1
            className="text-2xl font-bold text-[#F5F6FA] mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Verify Your Email
          </h1>
          <p className="text-sm text-[#9BA3B7]">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-[#FF5C7A]/10 border border-[#FF5C7A]/30 rounded-lg px-4 py-3 text-sm text-[#FF5C7A] text-center">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="w-12 h-14 bg-[#1B2130] border border-[#262D3D] rounded-lg text-center text-xl font-bold text-[#F5F6FA] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF] transition-shadow duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || digits.join('').length !== 6}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white btn-primary-gradient glow-violet transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#262D3D] text-center space-y-3">
          <p className="text-sm text-[#9BA3B7]">
            Didn&apos;t receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[#7C5CFF] hover:text-[#8B6FFF] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending...' : 'Resend'}
            </button>
          </p>
          <p className="text-sm text-[#9BA3B7]">
            <Link
              href="/auth/login"
              className="text-[#7C5CFF] hover:text-[#8B6FFF] font-semibold transition-colors"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  )
}
