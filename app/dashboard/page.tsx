'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import DashboardHeader from '@/components/dashboard/dashboard-header'
import DashboardTabs from '@/components/dashboard/dashboard-tabs'

type DashTab = 'overview' | 'upcoming' | 'history' | 'profile'

function DashboardContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab = tabParam === 'overview' || tabParam === 'upcoming' || tabParam === 'history' || tabParam === 'profile' ? tabParam : undefined

  const { user, loading } = useAuth()

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="h-14 mb-8 rounded-xl bg-[#1B2130] animate-pulse" />
        </main>
        <Footer />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <p className="text-center text-[#9BA3B7] py-12">Please log in</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <DashboardHeader />
        <DashboardTabs user={user} initialTab={initialTab} />
      </main>
      <Footer />
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="h-14 mb-8 rounded-xl bg-[#1B2130] animate-pulse" />
      </main>
    }>
      <DashboardContent />
    </Suspense>
  )
}
