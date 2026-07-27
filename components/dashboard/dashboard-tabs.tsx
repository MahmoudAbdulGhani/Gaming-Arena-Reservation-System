'use client'

import { useState, useEffect } from 'react'
import OverviewTab from './overview-tab'
import UpcomingTab from './upcoming-tab'
import HistoryTab from './history-tab'
import ProfileTab from './profile-tab'
import type { Booking, User } from '@/lib/types'

type TabId = 'overview' | 'upcoming' | 'history' | 'profile'

interface DashboardTabsProps {
  user: User | null
  initialTab?: TabId
}

export default function DashboardTabs({ user, initialTab }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab ?? 'overview')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('gz_token')
    if (!token) {
      setBookingsLoading(false)
      return
    }
    fetch('/api/bookings/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setBookings(Array.isArray(data) ? data : [])
      })
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false))
  }, [])

  async function updateBooking(bookingId: string, changes: Partial<Booking>) {
    const token = localStorage.getItem('gz_token')
    if (!token) return
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changes),
      })
      if (!res.ok) return
      const updated = await res.json()
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, ...updated } : b))
      )
    } catch {
      // silently fail — local state stays unchanged
    }
  }

  const upcomingCount = bookings.filter(
  (b) => b.status === 'pending' || b.status === 'confirmed'
).length

const historyCount = bookings.filter(
  (b) => b.status === 'completed' || b.status === 'cancelled'
).length

const tabs: { id: TabId; label: string; count?: number }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
  { id: 'history', label: 'History', count: historyCount },
  { id: 'profile', label: 'Profile' },
]

  return (
  <div>
    <div className="flex items-center gap-2 border-b border-[#262D3D] mb-8 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
            activeTab === tab.id
              ? 'text-[#F5F6FA] border-[#7C5CFF]'
              : 'text-[#9BA3B7] border-transparent hover:text-[#F5F6FA]'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#262D3D] text-xs text-[#9BA3B7]">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>

    {activeTab === 'overview' && (
        <OverviewTab bookings={bookings} onUpdateBooking={updateBooking} onViewAllUpcoming={() => setActiveTab('upcoming')} />
    )}
    {activeTab === 'upcoming' && <UpcomingTab bookings={bookings} onUpdateBooking={updateBooking}/>}
    {activeTab === 'history' && <HistoryTab bookings={bookings} onUpdateBooking={updateBooking} />}
    {activeTab === 'profile' && <ProfileTab user={user} />}
  </div>
)
}
