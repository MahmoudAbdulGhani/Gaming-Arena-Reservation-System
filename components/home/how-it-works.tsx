import { Search, CalendarCheck, Gamepad2 } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Search,
    title: 'Browse & Choose',
    description:
      'Explore our lineup of premium gaming rooms - PCs, consoles, VR rigs, and private rooms. Filter by type, price, and availability.',
  },
  {
    step: '02',
    icon: CalendarCheck,
    title: 'Pick Your Slot',
    description:
      'Select your preferred date and time from our live availability calendar. See exactly which slots are open in real time - no guessing.',
  },
  {
    step: '03',
    icon: Gamepad2,
    title: 'Play & Enjoy',
    description:
      'Complete your booking with secure online payment. Receive instant confirmation and show up ready to play - we handle the rest.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#0B0E14]" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#7C5CFF] bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 mb-4 uppercase tracking-wider">
            Simple Process
          </span>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl font-bold text-[#F5F6FA] mb-4 text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Book in Under 2 Minutes
          </h2>
          <p className="max-w-xl mx-auto text-[#9BA3B7] leading-relaxed text-pretty">
            From browsing to booking, our streamlined flow gets you gaming as fast as possible.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-[#7C5CFF]/40 to-transparent"
            aria-hidden="true"
          />

          {steps.map(({ step, icon: Icon, title, description }) => (
            <div
              key={step}
              className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-[#131824] border border-[#262D3D] hover:border-[#7C5CFF]/30 transition-all duration-200 card-hover"
            >
              {/* Step number */}
              <span
                className="absolute top-4 right-4 text-4xl font-black text-[#F5F6FA]/5 select-none"
                style={{ fontFamily: 'var(--font-display)' }}
                aria-hidden="true"
              >
                {step}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 flex items-center justify-center mb-5 glow-violet-sm">
                <Icon className="w-7 h-7 text-[#7C5CFF]" aria-hidden="true" />
              </div>

              <h3
                className="text-lg font-bold text-[#F5F6FA] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {title}
              </h3>
              <p className="text-sm text-[#9BA3B7] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
