import { Star, Quote } from 'lucide-react'
import { testimonials } from '@/lib/static-data'

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#131824]" aria-labelledby="testimonials-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#33E6A0] bg-[#33E6A0]/10 border border-[#33E6A0]/20 mb-4 uppercase tracking-wider">
            Reviews
          </span>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl font-bold text-[#F5F6FA] mb-4 text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            What Gamers Are Saying
          </h2>
          <p className="max-w-lg mx-auto text-[#9BA3B7] leading-relaxed">
            Hundreds of players have leveled up their experience at GameZone Arena.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <blockquote
              key={t.id}
              className="p-6 rounded-2xl bg-[#1B2130] border border-[#262D3D] hover:border-[#7C5CFF]/30 transition-all duration-200 card-hover flex flex-col"
            >
              <Quote className="w-7 h-7 text-[#7C5CFF]/40 mb-4 shrink-0" aria-hidden="true" />
              <p className="text-sm text-[#9BA3B7] leading-relaxed mb-6 flex-1">{t.content}</p>
              <footer className="flex items-center justify-between gap-4">
                <div>
                  <cite className="text-sm font-semibold text-[#F5F6FA] not-italic">{t.name}</cite>
                  <p className="text-xs text-[#9BA3B7]">{t.role}</p>
                </div>
                <div className="flex" aria-label={`${t.rating} out of 5 stars`}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800]" aria-hidden="true" />
                  ))}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
