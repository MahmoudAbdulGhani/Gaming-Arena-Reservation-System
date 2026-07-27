import Link from 'next/link'
import { Gamepad2, ExternalLink, Share2, Globe, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0B0E14] border-t border-[#262D3D]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="GameZone Arena Home">
              <div className="w-9 h-9 rounded-lg bg-[#7C5CFF] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span
                className="text-lg font-bold text-[#F5F6FA]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Game<span className="text-[#7C5CFF]">Zone</span>
              </span>
            </Link>
            <p className="text-sm text-[#9BA3B7] leading-relaxed mb-6">
              The premier destination for gaming enthusiasts. Premium rooms, real-time
              booking, and an unmatched arena experience.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Share2, label: 'Twitter / X', href: '#' },
                { Icon: Globe, label: 'Instagram', href: '#' },
                { Icon: ExternalLink, label: 'YouTube', href: '#' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`Follow us on ${label}`}
                  className="w-9 h-9 rounded-lg bg-[#1B2130] flex items-center justify-center text-[#9BA3B7] hover:text-[#7C5CFF] hover:bg-[#7C5CFF]/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-sm font-semibold text-[#F5F6FA] uppercase tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Quick Links
            </h3>
            <ul className="space-y-3" role="list">
              {[
                { label: 'Home', href: '/' },
                { label: 'Rooms', href: '/rooms' },
                { label: 'Book a Session', href: '/booking' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[#9BA3B7] hover:text-[#7C5CFF] transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Room Types */}
          <div>
            <h3
              className="text-sm font-semibold text-[#F5F6FA] uppercase tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Rooms
            </h3>
            <ul className="space-y-3" role="list">
              {[
                { label: 'Gaming PCs', href: '/rooms?type=PC' },
                { label: 'Console Zone', href: '/rooms?type=Console' },
                { label: 'VR Experience', href: '/rooms?type=VR' },
                { label: 'Private Suites', href: '/rooms?type=Private Room' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[#9BA3B7] hover:text-[#7C5CFF] transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-sm font-semibold text-[#F5F6FA] uppercase tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Contact
            </h3>
            <ul className="space-y-3" role="list">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#7C5CFF] mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-sm text-[#9BA3B7]">
                  123 Gamer&apos;s Boulevard, Tech District
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
                <a
                  href="tel:+15551234567"
                  className="text-sm text-[#9BA3B7] hover:text-[#7C5CFF] transition-colors duration-200"
                >
                  +961 30 60 90
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#7C5CFF] shrink-0" aria-hidden="true" />
                <a
                  href="mailto:hello@gamezone.gg"
                  className="text-sm text-[#9BA3B7] hover:text-[#7C5CFF] transition-colors duration-200"
                >
                  support@gamezone.com
                </a>
              </li>
            </ul>
            <div className="mt-6 p-3 rounded-xl bg-[#131824] border border-[#262D3D]">
              <p className="text-xs text-[#9BA3B7] mb-1">Arena Hours</p>
              <p className="text-sm text-[#F5F6FA] font-medium">Daily: 10:00 AM – 12:00 AM</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#262D3D] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#9BA3B7]">
            &copy; {new Date().getFullYear()} GameZone Arena. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-[#9BA3B7] hover:text-[#F5F6FA] transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-[#9BA3B7] hover:text-[#F5F6FA] transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
