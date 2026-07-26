'use client'

import { useState } from 'react'
import OverviewTab from './overview-tab'
import UpcomingTab from './upcoming-tab'
import HistoryTab from './history-tab'
import ProfileTab from './profile-tab'
import { mockBookings } from '@/lib/mock-data'
import type { Booking } from '@/lib/types'

type TabId = 'overview' | 'upcoming' | 'history' | 'profile'

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)

  function updateBooking(bookingId: string, changes: Partial<Booking>) {
  setBookings((prevBookings) =>
    prevBookings.map((booking) =>
      booking._id === bookingId ? { ...booking, ...changes } : booking
    )
  )
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

    {/* {actiOverviewTabveTab === 'overview' && (
      < onViewAllUpcoming={() => setActiveTab('upcoming')} />
    )} */}
    {activeTab === 'overview' && (
        <OverviewTab bookings={bookings} onUpdateBooking={updateBooking} onViewAllUpcoming={() => setActiveTab('upcoming')} />
    )}
    {activeTab === 'upcoming' && <UpcomingTab bookings={bookings} onUpdateBooking={updateBooking}/>}
    {activeTab === 'history' && <HistoryTab bookings={bookings} onUpdateBooking={updateBooking} />}
    {activeTab === 'profile' && <ProfileTab />}
  </div>
)
}