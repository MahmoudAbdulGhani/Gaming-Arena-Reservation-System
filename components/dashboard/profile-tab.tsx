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

  function handleSave(e: FormEvent) {
    e.preventDefault()
    console.log('Saving profile (no backend yet):', { name, email, phone })
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

        <button
          type="submit"
          className="w-full py-3 rounded-lg text-sm font-semibold text-white btn-primary-gradient glow-violet transition-all duration-200"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
