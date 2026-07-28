import type { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ContactForm from '@/components/contact-form'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const metadata: Metadata = {
  description: 'Get in touch with GameZone Arena. We are here to help with bookings, events, and general inquiries.',
}

const contactInfo = [
  {
    icon: MapPin,
    label: 'Address',
    value: '123 Gamer\'s Boulevard, Tech District',
    detail: 'Downtown City Center',
    href: 'https://maps.google.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+961 03 30 60 90',
    detail: 'Mon–Sun, 10 AM – 12 AM',
    href: 'tel:+9610000000',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'support@gamezone.com',
    detail: 'We respond within 24 hours',
    href: 'mailto:support@gamezone.com',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Daily: 10:00 AM – 12:00 AM',
    detail: 'Open 365 days a year',
    href: null,
  },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0B0E14] pt-20">
        {/* Page header */}
        <div className="bg-[#131824] border-b border-[#262D3D] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#7C5CFF] bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 mb-3 uppercase tracking-wider">
              Get in Touch
            </span>
            <h1
              className="text-3xl sm:text-4xl font-bold text-[#F5F6FA] mb-2 text-balance"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Contact Us
            </h1>
            <p className="text-[#9BA3B7] max-w-xl">
              Have questions about bookings, private events, or tournaments? We&apos;re happy to help.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left: contact info */}
            <aside className="lg:col-span-2 space-y-6">
              <div>
                <h2
                  className="text-lg font-bold text-[#F5F6FA] mb-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Arena Information
                </h2>
                <div className="space-y-4">
                  {contactInfo.map(({ icon: Icon, label, value, detail, href }) => (
                    <div
                      key={label}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-[#131824] border border-[#262D3D]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#7C5CFF]" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-[#9BA3B7] mb-0.5 uppercase tracking-wider">{label}</p>
                        {href ? (
                          <a
                            href={href}
                            className="text-sm font-semibold text-[#F5F6FA] hover:text-[#7C5CFF] transition-colors duration-200 block"
                            target={href.startsWith('https') ? '_blank' : undefined}
                            rel={href.startsWith('https') ? 'noopener noreferrer' : undefined}
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-[#F5F6FA]">{value}</p>
                        )}
                        <p className="text-xs text-[#9BA3B7] mt-0.5">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="rounded-2xl bg-[#131824] border border-[#262D3D] overflow-hidden">
                <div className="h-48 bg-[#1B2130] flex items-center justify-center relative">
                  <div className="absolute inset-0 hero-texture opacity-50" aria-hidden="true" />
                  <div className="relative text-center">
                    <MapPin className="w-10 h-10 text-[#7C5CFF] mx-auto mb-2" aria-hidden="true" />
                    <p className="text-sm font-semibold text-[#F5F6FA]">GameZone Arena</p>
                    <p className="text-xs text-[#9BA3B7]">123 Gamer&apos;s Boulevard</p>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs text-[#7C5CFF] hover:underline"
                    >
                      Open in Maps
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right: contact form */}
            <div className="lg:col-span-3">
              <h2
                className="text-lg font-bold text-[#F5F6FA] mb-6"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Send a Message
              </h2>
              <div className="p-8 rounded-2xl bg-[#131824] border border-[#262D3D]">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
