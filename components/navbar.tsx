'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Gamepad2, LogOut, User, Menu, X, ExternalLink } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import BookLink from '@/components/book-link'
import NotificationBell from '@/components/notification-bell'

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
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  const isAdmin = pathname.startsWith('/admin')

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
            {isAdmin && (
              <span className="hidden md:inline-flex items-center gap-1 text-sm text-[#9BA3B7] font-medium">
                <span className="text-[#262D3D]" aria-hidden="true">›</span>
                Admin Panel
              </span>
            )}
          </Link>

          {isAdmin ? (
            /* ── Admin navbar ── */
            <>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130] transition-all duration-200 cursor-pointer border-none bg-transparent"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Desktop admin CTA */}
              <div className="hidden md:flex items-center gap-3">
                {user && <NotificationBell />}
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white btn-primary-gradient transition-all duration-200 whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Site
                </Link>
                <button
                  onClick={() => { logout(); router.push('/') }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#9BA3B7] hover:text-[#FF5C7A] hover:bg-[#FF5C7A]/10 transition-all duration-200 whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            /* ── Regular navbar ── */
            <>
              {/* Desktop nav links */}
              <ul className="hidden md:flex items-center gap-1" role="list">
                {navLinks.map((link) => {
                  const href = link.label === 'Dashboard' && user?.role === 'admin' ? '/admin' : link.href
                  const isActive = pathname === href
                  if (link.label === 'Book Now') {
                    return (
                      <li key={link.href}>
                        <BookLink
                          href={link.href}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            isActive
                              ? 'text-[#7C5CFF] bg-[#7C5CFF]/10'
                              : 'text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130]'
                          }`}
                        >
                          {link.label}
                        </BookLink>
                      </li>
                    )
                  }
                  return (
                    <li key={link.href}>
                      <Link
                        href={href}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130] transition-all duration-200 cursor-pointer border-none bg-transparent"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-3">
                {loading ? (
                  <div className="w-20 h-9 rounded-lg bg-[#1B2130] animate-pulse" />
                ) : user ? (
                  <>
                    <NotificationBell />
                    <Link
                      href={user.role === 'admin' ? '/admin' : '/dashboard'}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130] transition-all duration-200 whitespace-nowrap"
                    >
                      <div className="w-7 h-7 rounded-md bg-[#7C5CFF]/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-[#7C5CFF]" />
                      </div>
                      {user.name.split(' ')[0]}
                    </Link>
                    <button
                      onClick={() => { logout(); router.push('/') }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#9BA3B7] hover:text-[#FF5C7A] hover:bg-[#FF5C7A]/10 transition-all duration-200 whitespace-nowrap"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-4 py-2 text-sm font-medium text-[#9BA3B7] hover:text-[#F5F6FA] transition-colors duration-200 whitespace-nowrap"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#262D3D] bg-[#0B0E14]/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              {isAdmin ? (
                <>
                  <div className="px-4 py-2.5 text-xs font-semibold text-[#7C5CFF] uppercase tracking-wider">Admin Panel</div>
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white btn-primary-gradient transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Site
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); logout(); router.push('/') }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#9BA3B7] hover:text-[#FF5C7A] hover:bg-[#FF5C7A]/10 transition-all duration-200 cursor-pointer border-none bg-transparent"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {navLinks.map((link) => {
                    const href = link.label === 'Dashboard' && user?.role === 'admin' ? '/admin' : link.href
                    const isActive = pathname === href
                    if (link.label === 'Book Now') {
                      return (
                        <BookLink
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'text-[#7C5CFF] bg-[#7C5CFF]/10'
                              : 'text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130]'
                          }`}
                        >
                          {link.label}
                        </BookLink>
                      )
                    }
                    return (
                      <Link
                        key={link.href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-[#7C5CFF] bg-[#7C5CFF]/10'
                            : 'text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                  <hr className="border-[#262D3D] my-2" />
                  {loading ? (
                    <div className="h-9 rounded-lg bg-[#1B2130] animate-pulse" />
                  ) : user ? (
                    <>
                      <Link
                        href={user.role === 'admin' ? '/admin' : '/dashboard'}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130] transition-all duration-200"
                      >
                        <div className="w-7 h-7 rounded-md bg-[#7C5CFF]/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-[#7C5CFF]" />
                        </div>
                        {user.name.split(' ')[0]}
                      </Link>
                      <button
                        onClick={() => { setMobileOpen(false); logout(); router.push('/') }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#9BA3B7] hover:text-[#FF5C7A] hover:bg-[#FF5C7A]/10 transition-all duration-200 cursor-pointer border-none bg-transparent"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130] transition-all duration-200"
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
