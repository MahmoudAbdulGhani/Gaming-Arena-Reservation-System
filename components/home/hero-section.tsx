'use client'

import Link from 'next/link'
import { Zap, ChevronRight, Star } from 'lucide-react'
import BookLink from '@/components/book-link'

export default function HeroSection() {
    return (
        <section
            className="relative min-h-screen flex items-center overflow-hidden hero-texture"
            aria-label="Hero"
        >
            {/* Background video - right side */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[#0B0E14]/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0E14]" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left - Text */}
                    <div>
                        <h1
                            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#F5F6FA] text-balance mb-6 leading-none"
                            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
                        >
                            Level Up Your{' '}
                            <span className="text-transparent bg-clip-text"
                                style={{ backgroundImage: 'linear-gradient(135deg, #7C5CFF, #4C6FFF)' }}>
                                Gaming
                            </span>
                            <br />
                            Experience
                        </h1>

                        <p className="max-w-xl text-lg sm:text-xl text-[#9BA3B7] leading-relaxed mb-10 text-pretty">
                            Book premium gaming rooms - high end PCs, consoles, VR rigs, and private rooms. Real-time availability, instant confirmation.
                        </p>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                            <BookLink
                                href="/booking"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white btn-primary-gradient glow-violet transition-all duration-200 min-h-[52px]"
                            >
                                <Zap className="w-5 h-5" aria-hidden="true" />
                                Book Your Slot
                            </BookLink>
                            <Link
                                href="/rooms"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-[#F5F6FA] bg-[#1B2130] border border-[#262D3D] hover:border-[#7C5CFF]/50 hover:bg-[#262D3D] transition-all duration-200 min-h-[52px]"
                            >
                                Browse Rooms
                                <ChevronRight className="w-4 h-4" aria-hidden="true" />
                            </Link>
                        </div>

                        {/* Social proof */}
                        <div className="flex flex-col sm:flex-row items-start gap-6 text-sm text-[#9BA3B7]">
                            <div className="flex items-center gap-2">
                                <div className="flex" aria-label="5 star rating">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-[#FFB800] fill-[#FFB800]" aria-hidden="true" />
                                    ))}
                                </div>
                                <span>4.9 / 5 from 340+ reviews</span>
                            </div>
                            <span className="hidden sm:block text-[#262D3D]" aria-hidden="true">|</span>
                            <span>500+ sessions booked this month</span>
                            <span className="hidden sm:block text-[#262D3D]" aria-hidden="true">|</span>
                            <span>Instant online payment</span>
                        </div>
                    </div>

                    {/* Right - Video */}
                    <div className="relative hidden lg:block">
                        <div className="relative rounded-2xl overflow-hidden border border-[#262D3D] shadow-2xl shadow-[#7C5CFF]/10">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                poster="/images/hero-bg.png"
                                className="w-full object-cover"
                                style={{ aspectRatio: '4/3' }}
                                aria-hidden="true"
                            >
                                <source src="/video/Intro.mp4" type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14]/40 to-transparent" />
                        </div>
                        {/* Decorative glow */}
                        <div className="absolute -inset-4 bg-[#7C5CFF]/5 rounded-3xl blur-2xl -z-10" aria-hidden="true" />
                    </div>
                </div>
            </div>
        </section>
    )
}
