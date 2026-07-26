'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const inputClass =
  'w-full bg-[#1B2130] border border-[#262D3D] rounded-lg px-4 py-3 text-[#F5F6FA] placeholder:text-[#9BA3B7] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF] transition-shadow duration-200'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }

    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.requiresOtp) {
        router.push(`/auth/verify-otp?token=${encodeURIComponent(result.verifyToken!)}`)
      } else {
        router.push(result.role === 'admin' ? '/admin' : '/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7C5CFF]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#4C6FFF]/5 blur-[100px] pointer-events-none" />

      {/* Logo */}
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

      {/* Card */}
      <div className="w-full max-w-md bg-[#131824] border border-[#262D3D] rounded-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold text-[#F5F6FA] mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Welcome Back
          </h1>
          <p className="text-sm text-[#9BA3B7]">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-[#FF5C7A]/10 border border-[#FF5C7A]/30 rounded-lg px-4 py-3 text-sm text-[#FF5C7A]">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm text-[#9BA3B7] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-[#9BA3B7] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pr-11`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA3B7] hover:text-[#F5F6FA] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[#262D3D] bg-[#1B2130] text-[#7C5CFF] focus:ring-[#7C5CFF]"
              />
              <span className="text-sm text-[#9BA3B7]">Remember me</span>
            </label>
            <Link
              href="#"
              className="text-sm text-[#7C5CFF] hover:text-[#8B6FFF] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white btn-primary-gradient glow-violet transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#262D3D] text-center">
          <p className="text-sm text-[#9BA3B7]">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-[#7C5CFF] hover:text-[#8B6FFF] font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
