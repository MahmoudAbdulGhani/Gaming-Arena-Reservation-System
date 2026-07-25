'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gamepad2, Zap, LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Book Now', href: '/booking' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0B0E14]/95 backdrop-blur-md border-b border-[#262D3D]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="GameZone Arena Home">
            <div className="w-9 h-9 rounded-lg bg-[#7C5CFF] flex items-center justify-center glow-violet-sm group-hover:scale-110 transition-transform duration-200">
              <Gamepad2 className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span
              className="text-lg font-bold text-[#F5F6FA] tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Game<span className="text-[#7C5CFF]">Zone</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => {
              const href = link.label === 'Dashboard' && user?.role === 'admin' ? '/admin' : link.href
              const isActive = pathname === href
              return (
                <li key={link.href}>
                  <Link
                    href={href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#7C5CFF] bg-[#7C5CFF]/10'
                        : 'text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-9 rounded-lg bg-[#1B2130] animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130] transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-md bg-[#7C5CFF]/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#7C5CFF]" />
                  </div>
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#9BA3B7] hover:text-[#FF5C7A] hover:bg-[#FF5C7A]/10 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <Link
                  href="/booking"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white btn-primary-gradient transition-all duration-200 min-h-11"
                >
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  Book Now
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-[#9BA3B7] hover:text-[#F5F6FA] transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/booking"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white btn-primary-gradient transition-all duration-200 min-h-11"
                >
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  Book Now
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
