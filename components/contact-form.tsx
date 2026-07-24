'use client'

import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'

const subjectOptions = [
  'General Inquiry',
  'Booking Help',
  'Private Events & Parties',
  'Tournament Hosting',
  'Membership & Pricing',
  'Technical Support',
  'Other',
]

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof formData>>({})

  const validate = () => {
    const errs: Partial<typeof formData> = {}
    if (!formData.name.trim()) errs.name = 'Name is required.'
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Enter a valid email address.'
    if (!formData.subject) errs.subject = 'Please select a subject.'
    if (formData.message.trim().length < 10) errs.message = 'Message must be at least 10 characters.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Simulate submission — connect to API route in production
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#33E6A0]/10 border-2 border-[#33E6A0]/30 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-[#33E6A0]" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-[#F5F6FA] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Message Sent!
        </h3>
        <p className="text-sm text-[#9BA3B7] max-w-xs">
          Thanks for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => { setSent(false); setFormData({ name: '', email: '', subject: '', message: '' }) }}
          className="mt-6 text-sm text-[#7C5CFF] hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  const inputClass = (field: keyof typeof formData) =>
    `w-full px-4 py-3 rounded-xl bg-[#1B2130] border ${
      errors[field] ? 'border-[#FF5C7A]/60' : 'border-[#262D3D]'
    } text-[#F5F6FA] placeholder-[#9BA3B7]/50 focus:outline-none focus:border-[#7C5CFF]/60 text-sm transition-colors min-h-[44px]`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-[#F5F6FA] mb-1.5">
            Full Name
          </label>
          <input
            id="contact-name"
            type="text"
            placeholder="Alex Chen"
            value={formData.name}
            onChange={handleChange('name')}
            className={inputClass('name')}
            autoComplete="name"
            aria-required="true"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p role="alert" className="flex items-center gap-1 text-xs text-[#FF5C7A] mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-[#F5F6FA] mb-1.5">
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange('email')}
            className={inputClass('email')}
            autoComplete="email"
            aria-required="true"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p role="alert" className="flex items-center gap-1 text-xs text-[#FF5C7A] mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-[#F5F6FA] mb-1.5">
          Subject
        </label>
        <select
          id="contact-subject"
          value={formData.subject}
          onChange={handleChange('subject')}
          className={`${inputClass('subject')} cursor-pointer`}
          aria-required="true"
          aria-invalid={!!errors.subject}
        >
          <option value="">Select a subject...</option>
          {subjectOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {errors.subject && (
          <p role="alert" className="flex items-center gap-1 text-xs text-[#FF5C7A] mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-[#F5F6FA] mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Tell us how we can help..."
          value={formData.message}
          onChange={handleChange('message')}
          className={`${inputClass('message')} resize-none leading-relaxed`}
          aria-required="true"
          aria-invalid={!!errors.message}
          style={{ minHeight: '120px' }}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.message ? (
            <p role="alert" className="flex items-center gap-1 text-xs text-[#FF5C7A]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-[#9BA3B7]">{formData.message.length}/500</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl text-sm font-bold text-white btn-primary-gradient transition-all duration-200 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
        aria-busy={loading}
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
        ) : (
          <Send className="w-4 h-4" aria-hidden="true" />
        )}
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
