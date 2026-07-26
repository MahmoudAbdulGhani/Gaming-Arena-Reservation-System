import type { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import HeroSection from '@/components/home/hero-section'
import StatsBar from '@/components/home/stats-bar'
import HowItWorks from '@/components/home/how-it-works'
import FeaturedRooms from '@/components/home/featured-rooms'
import Testimonials from '@/components/home/testimonials'
import CTABanner from '@/components/home/cta-banner'

export const metadata: Metadata = {
  title: 'GameZone Arena',
  description:
    'Reserve premium gaming rooms - PCs, consoles, VR rigs, and private rooms. Real-time availability, instant booking, and seamless online payment.',
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <HowItWorks />
        <FeaturedRooms />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  )
}
