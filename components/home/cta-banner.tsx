import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function CTABanner() {
  return (
    <section
      className="py-24 bg-[#0B0E14]"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#131824] border border-[#7C5CFF]/20 p-12 text-center">
          {/* Background glow */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,92,255,0.4) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#7C5CFF] bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 mb-5 uppercase tracking-wider">
              Ready to Play?
            </span>
            <h2
              id="cta-heading"
              className="text-3xl sm:text-5xl font-bold text-[#F5F6FA] mb-4 text-balance"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              Your Next Session Starts Here
            </h2>
            <p className="max-w-xl mx-auto text-[#9BA3B7] leading-relaxed mb-8 text-pretty">
              Don&apos;t wait in line or call ahead. Book your gaming room online in minutes
              and show up ready to dominate.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/booking"
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white btn-primary-gradient glow-violet transition-all duration-200 min-h-13 w-full sm:w-auto"
              >
                <Zap className="w-5 h-5" aria-hidden="true" />
                Reserve Your Room
              </Link>
              <Link
                href="/auth/register"
                className="px-8 py-4 rounded-xl text-base font-semibold text-[#F5F6FA] bg-transparent border border-[#262D3D] hover:border-[#7C5CFF]/50 hover:bg-[#1B2130] transition-all duration-200 min-h-13 w-full sm:w-auto"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
