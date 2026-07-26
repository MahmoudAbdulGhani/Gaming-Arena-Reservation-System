import type { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardTabs from '@/components/dashboard/dashboard-tabs'
import { mockUser } from '@/lib/mock-data'

export const metadata: Metadata = {
  description: 'View your bookings, spending, and profile at GameZone Arena.',
}

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <DashboardHeader user={mockUser} />
        <DashboardTabs />
      </main>
      <Footer />
    </>
  )
}