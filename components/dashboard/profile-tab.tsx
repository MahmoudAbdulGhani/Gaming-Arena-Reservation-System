'use client'

import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { User } from '@/lib/types'

// Shared styling for every text input in this form.
const inputClass =
  'w-full bg-[#1B2130] border border-[#262D3D] rounded-lg px-4 py-3 text-[#F5F6FA] placeholder:text-[#9BA3B7] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF] transition-shadow duration-200'

interface ProfileTabProps {
  user: User | null
}

export default function ProfileTab({ user }: ProfileTabProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone ?? '')
    }
  }, [user])

  if (!user) {
    return (
      <div className="text-center py-12 text-[#9BA3B7]">
        Loading profile...
      </div>
    )
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const token = localStorage.getItem('gz_token')
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save changes')
      setMessage({ type: 'success', text: 'Profile updated.' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Something went wrong' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2
        className="text-2xl font-bold text-[#F5F6FA] mb-6"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Profile Settings
      </h2>

      <form
        onSubmit={handleSave}
        className="bg-[#131824] border border-[#262D3D] rounded-2xl p-8 max-w-2xl flex flex-col gap-6"
      >
        <div>
          <label htmlFor="fullName" className="block text-sm text-[#9BA3B7] mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm text-[#9BA3B7] mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm text-[#9BA3B7] mb-2">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className={inputClass}
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-[#33E6A0]' : 'text-[#FF5C7A]'}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white btn-primary-gradient glow-violet transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
