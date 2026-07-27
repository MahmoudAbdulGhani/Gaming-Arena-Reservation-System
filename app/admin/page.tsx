'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Plus, ExternalLink, Pencil, Eye, Trash2, X, Download } from 'lucide-react'
import Navbar from '@/components/navbar'
import { mockRooms, mockDevices, mockBookings, mockUsers } from '@/lib/mock-data'
import type { RoomType } from '@/lib/types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const typeColors: Record<RoomType, string> = {
  pc: '#7c6cf2',
  console: '#2fd18f',
  vr: '#6c8cf5',
  private: '#f2a13c',
}

const typeLabels: Record<RoomType, string> = {
  pc: 'PC',
  console: 'Console',
  vr: 'VR',
  private: 'Private Room',
}

const roomThumbs: Record<string, string> = {
  r1: '/images/room-pc.png',
  r2: '/images/room-pc.png',
  r3: '/images/room-console.png',
  r4: '/images/room-vr.png',
  r5: '/images/room-private.png',
  r6: '/images/room-private.png',
}

const bookingIds = ['GZ-BEBQBE', 'GZ-XQLT77', 'GZ-MN3KP9', 'GZ-PP2WRJ', 'GZ-CANC01', 'GZ-PDN991']

function getRoomStat(roomId: string) {
  const devs = mockDevices.filter((d) => d.roomId === roomId)
  return { available: devs.filter((d) => d.status === 'available').length, total: devs.length }
}

function statusClass(status: string) {
  switch (status) {
    case 'confirmed': return 'bg-[#2fd18f]/15 text-[#2fd18f]'
    case 'completed': return 'bg-[#23232f] text-[#9a9aab]'
    case 'cancelled': return 'bg-[#f25c78]/15 text-[#f25c78]'
    case 'pending': return 'bg-[#6c8cf5]/15 text-[#6c8cf5]'
    default: return 'bg-[#23232f] text-[#9a9aab]'
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

interface DetailItem { label: string; value: string; color?: string }

function DetailModal({ open, onClose, title, details }: { open: boolean; onClose: () => void; title: string; details: DetailItem[] }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#12121a] border border-[#23232f] rounded-[16px] w-full max-w-sm mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-[8px] text-[#6b6b7b] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>
          {details.map((d) => (
            <div key={d.label} className="flex items-center justify-between py-2.5 border-b border-[#23232f] last:border-b-0">
              <span className="text-[13px] text-[#6b6b7b]">{d.label}</span>
              <span className="text-[14px] font-medium text-right" style={{ color: d.color || '#f5f5f7' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RoomEditModal({ room, onSave, onClose }: { room: { id: string; name: string; pricePerHour: number; type: string }; onSave: (id: string, name: string, price: number, type: string) => void; onClose: () => void }) {
  const [name, setName] = useState(room.name)
  const [price, setPrice] = useState(String(room.pricePerHour))
  const [type, setType] = useState(room.type)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#12121a] border border-[#23232f] rounded-[16px] w-full max-w-sm mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>Edit Room</h3>
          <button onClick={onClose} className="p-1.5 rounded-[8px] text-[#6b6b7b] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Room Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Room Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b6b7b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '20px' }}
            >
              <option value="pc">PC</option>
              <option value="console">Console</option>
              <option value="vr">VR</option>
              <option value="private">Private Room</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Price per Hour ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#9a9aab] border border-[#23232f] bg-transparent hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer">
              Cancel
            </button>
            <button
              onClick={() => onSave(room.id, name, parseInt(price) || 0, type)}
              className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-white border-none cursor-pointer btn-primary-gradient glow-violet transition-all duration-200"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-[#12121a] border border-[#23232f] rounded-[16px] w-full max-w-sm mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>Confirm Delete</h3>
          <button onClick={onCancel} className="p-1.5 rounded-[8px] text-[#6b6b7b] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[14px] text-[#9a9aab] mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#9a9aab] border border-[#23232f] bg-transparent hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-white border-none cursor-pointer bg-[#f25c78] hover:bg-[#d94e6a] transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [roomSearch, setRoomSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [deletedBookingIds, setDeletedBookingIds] = useState<string[]>([])
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([])
  const [detailModal, setDetailModal] = useState<{ open: boolean; title: string; details: DetailItem[] }>({ open: false, title: '', details: [] })
  const [roomsData, setRoomsData] = useState(mockRooms)
  const [editingRoom, setEditingRoom] = useState<{ id: string; name: string; pricePerHour: number; type: string } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null)

  const handleSaveRoom = useCallback((id: string, name: string, price: number, type: string) => {
    setRoomsData((prev) => prev.map((r) => r._id === id ? { ...r, name, pricePerHour: price, type: type as RoomType } : r))
    setEditingRoom(null)
  }, [])

  const availableDevices = mockDevices.filter((d) => d.status === 'available').length
  const totalDevices = mockDevices.length
  const activeBookings = mockBookings.filter((b) => b.status === 'pending' || b.status === 'confirmed')
  const pendingCount = mockBookings.filter((b) => b.status === 'pending').length
  const totalRevenue = mockBookings
    .filter((b) => b.status === 'completed' || b.paymentStatus === 'paid')
    .reduce((s, b) => s + b.totalPrice, 0)

  const revenueByType = (['pc', 'console', 'vr', 'private'] as RoomType[]).map((type) => {
    const roomIds = mockRooms.filter((r) => r.type === type).map((r) => r._id)
    const rev = mockBookings
      .filter((b) => roomIds.includes(b.roomId) && (b.status === 'completed' || b.paymentStatus === 'paid'))
      .reduce((s, b) => s + b.totalPrice, 0)
    return { label: typeLabels[type], value: rev, color: typeColors[type] }
  })
  const maxRev = Math.max(...revenueByType.map((r) => r.value), 1)

  const filteredBookings = mockBookings.filter((b, i) => {
    if (deletedBookingIds.includes(b._id)) return false
    if (!search) return true
    const q = search.toLowerCase()
    const room = b.room?.name || ''
    return room.toLowerCase().includes(q) || b.status.includes(q) || bookingIds[i].toLowerCase().includes(q)
  })

  const filteredUsers = mockUsers.filter((u) => {
    if (deletedUserIds.includes(u._id)) return false
    if (!userSearch) return true
    const q = userSearch.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const tabs = [
    { id: 'overview', label: 'Overview', badge: null },
    { id: 'bookings', label: 'Bookings', badge: mockBookings.length },
    { id: 'rooms', label: 'Rooms', badge: null },
    { id: 'users', label: 'Users', badge: 5 },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-10 py-8 pt-24" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div className="text-[13px] text-[#6b6b7b] mb-1.5">
          <Link href="/" className="text-[#7c6cf2] no-underline">GameZone</Link> › Admin Panel
        </div>

        {/* Top row */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-7">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>Admin Panel</h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-[18px] py-[11px] rounded-[10px] text-[14px] font-semibold border border-[#23232f] bg-[#12121a] text-[#f5f5f7] hover:bg-[#1a1a26] transition-all no-underline">
              <ExternalLink className="w-4 h-4" />
              View Site
            </Link>
            <Link href="/booking" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-[18px] py-[11px] rounded-[10px] text-[14px] font-semibold text-white no-underline cursor-pointer btn-primary-gradient glow-violet transition-all duration-200">
              <Plus className="w-4 h-4" />
              Add Reservation
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-7 border-b border-[#23232f] mb-7 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-[12px] sm:pb-[14px] text-[13px] sm:text-[15px] whitespace-nowrap flex items-center gap-1.5 sm:gap-2 cursor-pointer border-b-2 bg-transparent ${
                activeTab === tab.id
                  ? 'text-[#f5f5f7] font-semibold border-[#7c6cf2]'
                  : 'text-[#9a9aab] border-transparent hover:text-[#f5f5f7]'
              }`}
            >
              {tab.label}
              {tab.badge !== null && (
                <span className="bg-[#26263a] text-[#9a9aab] text-[11px] sm:text-[12px] px-1.5 sm:px-2 py-0.5 rounded-full">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mb-6">
              {[
                { icon: '$', bg: 'rgba(124,108,242,0.15)', color: '#7c6cf2', value: `$${totalRevenue}`, label: 'Total Revenue', sub: 'This month' },
                { icon: '▦', bg: 'rgba(47,209,143,0.15)', color: '#2fd18f', value: activeBookings.length.toString(), label: 'Active Bookings', sub: `${pendingCount} pending` },
                { icon: '◈', bg: 'rgba(242,161,60,0.15)', color: '#f2a13c', value: `${availableDevices}/${totalDevices}`, label: 'Devices Available', sub: `${totalDevices} total` },
                { icon: '☺', bg: 'rgba(124,108,242,0.15)', color: '#7c6cf2', value: '5', label: 'Registered Users', sub: '1 admin' },
              ].map((s) => (
                <div key={s.label} className="bg-[#12121a] border border-[#23232f] rounded-[14px] p-[22px] flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[18px] shrink-0" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                  <div>
                    <div className="text-[26px] font-bold text-[#f5f5f7]" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
                    <div className="text-[14px] text-[#9a9aab] mt-0.5">{s.label}</div>
                    <div className="text-[12.5px] text-[#6b6b7b] mt-0.5">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
              <div className="bg-[#12121a] border border-[#23232f] rounded-[14px] p-[22px]">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[16px] font-bold text-[#f5f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Room & Device Status</div>
                </div>
                {mockRooms.map((room) => {
                  const stat = getRoomStat(room._id)
                  const isAvail = stat.available > 0 && room.status === 'active'
                  return (
                    <div key={room._id} className="flex items-center py-3 border-b border-[#23232f] last:border-b-0 gap-2">
                      <img src={roomThumbs[room._id]} alt="" className="w-11 h-11 rounded-[10px] object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[14.5px] font-semibold text-[#f5f5f7] truncate">{room.name}</div>
                        <div className="text-[12.5px] text-[#6b6b7b] mt-0.5">{typeLabels[room.type]}</div>
                      </div>
                      <div className="ml-auto flex items-center gap-2 sm:gap-3.5 shrink-0">
                        <span className="text-[13px] text-[#9a9aab] min-w-[38px] text-right">{stat.available}/{stat.total}</span>
                        <span className={`text-[12px] px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 ${isAvail ? 'bg-[#2fd18f]/15 text-[#2fd18f]' : 'bg-[#f25c78]/15 text-[#f25c78]'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {isAvail ? 'Available' : 'Reserved'}
                        </span>
                        <button onClick={() => setActiveTab('rooms')} className="text-[13px] text-[#7c6cf2] cursor-pointer hover:underline bg-transparent border-none">Manage</button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-[#12121a] border border-[#23232f] rounded-[14px] p-[22px]">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[16px] font-bold text-[#f5f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Recent Bookings</div>
                  <button onClick={() => setActiveTab('bookings')} className="text-[13px] text-[#7c6cf2] no-underline hover:underline bg-transparent border-none cursor-pointer">View all</button>
                </div>
                {mockBookings.slice(0, 5).map((b) => (
                  <div key={b._id} className="flex items-center py-3 border-b border-[#23232f] last:border-b-0">
                    <img src={roomThumbs[b.roomId] || '/images/room-pc.png'} alt="" className="w-11 h-11 rounded-[10px] object-cover mr-3.5 shrink-0" />
                    <div>
                      <div className="text-[14.5px] font-semibold text-[#f5f5f7]">{b.room?.name || 'Room'}</div>
                      <div className="text-[12.5px] text-[#6b6b7b] mt-0.5">{formatDate(b.bookingDate)} · {b.deviceCount} device{b.deviceCount > 1 ? 's' : ''}</div>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-1.5">
                      <div className="text-[15px] font-bold text-[#f5f5f7]">${b.totalPrice}</div>
                      <span className={`text-[12px] px-2.5 py-1 rounded-full font-semibold ${statusClass(b.status)}`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#12121a] border border-[#23232f] rounded-[14px] p-[22px]">
              <div className="flex justify-between items-center mb-4">
                <div className="text-[16px] font-bold text-[#f5f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Revenue by Room Type</div>
              </div>
              {revenueByType.map((r) => (
                <div key={r.label} className="flex items-center gap-4 mb-5 last:mb-0">
                  <div className="text-[14px] text-[#9a9aab] text-right min-w-[110px]">{r.label}</div>
                  <div className="h-[26px] rounded-[6px] flex items-center px-3" style={{ width: `${(r.value / maxRev) * 100}%`, background: r.color, minWidth: r.value > 0 ? 40 : 0 }} />
                  <div className="text-[14px] font-semibold text-[#f5f5f7] min-w-[70px]">${r.value}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-[#12121a] border border-[#23232f] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#23232f]">
              <h2 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>All Bookings</h2>
              <button
                  onClick={handleDownloadBookingsReport}
                  className="inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[10px] text-[13px] font-semibold text-[#f5f5f7] border border-[#23232f] bg-[#0a0a0f] hover:bg-[#1a1a26] transition-all"
               >
                 <Download className="w-4 h-4" />
                    Download Report
              </button>
              <Link href="/booking" className="inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[10px] text-[13px] font-semibold text-white no-underline cursor-pointer btn-primary-gradient glow-violet transition-all duration-200">
                <Plus className="w-4 h-4" />
                Add Reservation
              </Link>
            </div>

            <div className="px-5 py-4 border-b border-[#23232f]">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b7b]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bookings..."
                  className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] pl-9 pr-4 py-2 text-[14px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-colors"
                />
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#23232f]">
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Booking ID</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Room</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Devices</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Duration</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Amount</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Payment</th>
                    <th className="text-right px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b, i) => {
                    const room = mockRooms.find((r) => r._id === b.roomId)
                    return (
                      <tr key={b._id} className="border-b border-[#23232f] last:border-b-0 hover:bg-[#0a0a0f]/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-[13px] font-mono font-semibold text-[#f5f5f7]">{bookingIds[i]}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={roomThumbs[b.roomId] || '/images/room-pc.png'} alt="" className="w-9 h-9 rounded-[8px] object-cover shrink-0" />
                            <div>
                              <div className="text-[14px] font-medium text-[#f5f5f7]">{room?.name || 'Room'}</div>
                              {room && <div className="text-[12px] text-[#6b6b7b]">{typeLabels[room.type]}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[14px] text-[#f5f5f7] font-medium">{b.deviceCount}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[14px] text-[#f5f5f7]">{formatDate(b.bookingDate)}</div>
                          <div className="text-[12px] text-[#6b6b7b]">{b.startTime}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[14px] text-[#f5f5f7]">{b.durationHours}h</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[15px] font-bold text-[#f5f5f7]">${b.totalPrice}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[12px] px-2.5 py-1 rounded-full font-semibold ${statusClass(b.status)}`}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[12px] px-2.5 py-1 rounded-full font-semibold ${
                            b.paymentStatus === 'paid' ? 'bg-[#2fd18f]/15 text-[#2fd18f]' :
                            b.paymentStatus === 'refunded' ? 'bg-[#f25c78]/15 text-[#f25c78]' :
                            'bg-[#6c8cf5]/15 text-[#6c8cf5]'
                          }`}>
                            {b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setDetailModal({
                                open: true,
                                title: `Booking Code ${bookingIds[i]}`,
                                details: [
                                  { label: 'Room', value: room?.name || 'N/A' },
                                  { label: 'Devices', value: `${b.deviceCount}` },
                                  { label: 'Date', value: formatDate(b.bookingDate) },
                                  { label: 'Time', value: b.startTime },
                                  { label: 'Duration', value: `${b.durationHours}h` },
                                  { label: 'Amount', value: `$${b.totalPrice}` },
                                  {
                                    label: 'Status',
                                    value: b.status.charAt(0).toUpperCase() + b.status.slice(1),
                                    color:
                                      b.status === 'confirmed' ? '#2fd18f' :
                                      b.status === 'pending' ? '#6c8cf5' :
                                      b.status === 'cancelled' ? '#f25c78' :
                                      '#9a9aab',
                                  },
                                  {
                                    label: 'Payment',
                                    value: b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1),
                                    color:
                                      b.paymentStatus === 'paid' ? '#2fd18f' :
                                      b.paymentStatus === 'refunded' ? '#f25c78' :
                                      '#6c8cf5',
                                  },
                                ],
                              })}
                              className="p-1.5 rounded-[6px] text-[#9a9aab] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmModal({ message: `Are you sure you want to delete booking ${bookingIds[i]}? This action cannot be undone.`, onConfirm: () => { setDeletedBookingIds((prev) => [...prev, b._id]); setConfirmModal(null) } })}
                              className="p-1.5 rounded-[6px] text-[#f25c78]/60 hover:text-[#f25c78] hover:bg-[#f25c78]/10 transition-all cursor-pointer border-none bg-transparent"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden divide-y divide-[#23232f]">
              {filteredBookings.map((b, i) => {
                const room = mockRooms.find((r) => r._id === b.roomId)
                const payColor = b.paymentStatus === 'paid' ? '#2fd18f' : b.paymentStatus === 'refunded' ? '#f25c78' : '#6c8cf5'
                return (
                  <div key={b._id} className="px-4 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-mono font-semibold text-[#f5f5f7]">{bookingIds[i]}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailModal({
                            open: true,
                            title: `Booking Code ${bookingIds[i]}`,
                            details: [
                              { label: 'Room', value: room?.name || 'N/A' },
                              { label: 'Devices', value: `${b.deviceCount}` },
                              { label: 'Date', value: formatDate(b.bookingDate) },
                              { label: 'Time', value: b.startTime },
                              { label: 'Duration', value: `${b.durationHours}h` },
                              { label: 'Amount', value: `$${b.totalPrice}` },
                              { label: 'Status', value: b.status.charAt(0).toUpperCase() + b.status.slice(1), color: b.status === 'confirmed' ? '#2fd18f' : b.status === 'pending' ? '#6c8cf5' : b.status === 'cancelled' ? '#f25c78' : '#9a9aab' },
                              { label: 'Payment', value: b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1), color: payColor },
                            ],
                          })}
                          className="p-1.5 rounded-[6px] text-[#9a9aab] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ message: `Are you sure you want to delete booking ${bookingIds[i]}? This action cannot be undone.`, onConfirm: () => { setDeletedBookingIds((prev) => [...prev, b._id]); setConfirmModal(null) } })}
                          className="p-1.5 rounded-[6px] text-[#f25c78]/60 hover:text-[#f25c78] hover:bg-[#f25c78]/10 transition-all cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <img src={roomThumbs[b.roomId] || '/images/room-pc.png'} alt="" className="w-8 h-8 rounded-[6px] object-cover shrink-0" />
                      <div>
                        <div className="text-[14px] font-medium text-[#f5f5f7]">{room?.name || 'Room'}</div>
                        {room && <div className="text-[12px] text-[#6b6b7b]">{typeLabels[room.type]}</div>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#6b6b7b]">{formatDate(b.bookingDate)} · {b.startTime} · {b.durationHours}h</span>
                      <span className="font-bold text-[#f5f5f7]">${b.totalPrice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusClass(b.status)}`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        b.paymentStatus === 'paid' ? 'bg-[#2fd18f]/15 text-[#2fd18f]' :
                        b.paymentStatus === 'refunded' ? 'bg-[#f25c78]/15 text-[#f25c78]' :
                        'bg-[#6c8cf5]/15 text-[#6c8cf5]'
                      }`}>
                        {b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1)}
                      </span>
                      <span className="text-[#6b6b7b] text-[12px]">{b.deviceCount} device{b.deviceCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Rooms */}
        {activeTab === 'rooms' && (
          <div className="bg-[#12121a] border border-[#23232f] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#23232f]">
              <h2 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>Room Management</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b7b]" />
                  <input
                    type="text"
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    placeholder="Search rooms..."
                    className="w-full sm:w-52 bg-[#0a0a0f] border border-[#23232f] rounded-[8px] pl-9 pr-4 py-[7px] text-[14px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-colors"
                  />
                </div>
                <button className="hidden sm:inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[10px] text-[13px] font-semibold text-white border-none cursor-pointer btn-primary-gradient glow-violet transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  Add Room
                </button>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {roomsData
                .filter((r) => !roomSearch || r.name.toLowerCase().includes(roomSearch.toLowerCase()) || typeLabels[r.type].toLowerCase().includes(roomSearch.toLowerCase()))
                .map((room) => {
                  const stat = getRoomStat(room._id)
                  const isAvail = stat.available > 0 && room.status === 'active'
                  const showDelete = room._id === 'r2' || room._id === 'r6'
                  return (
                    <div key={room._id} className="bg-[#0a0a0f] border border-[#23232f] rounded-[14px] overflow-hidden">
                      <div className="relative">
                        <img src={roomThumbs[room._id]} alt="" className="w-full h-32 object-cover" />
                        <span className={`absolute top-3 left-3 text-[11px] px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 ${isAvail ? 'bg-[#2fd18f]/80 text-white' : 'bg-[#f25c78]/80 text-white'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {isAvail ? 'Available' : 'Reserved'}
                        </span>
                        <span className="absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-full font-semibold bg-black/60 text-[#f5f5f7]">
                          {stat.available}/{stat.total}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="text-[16px] font-bold text-[#f5f5f7]" style={{ fontFamily: 'var(--font-display)' }}>{room.name}</div>
                        <div className="mt-2.5">
                          <span className="text-[14px] font-semibold text-[#2fd18f]">${room.pricePerHour}/hr</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-[12px] px-2.5 py-0.5 rounded-full font-semibold" style={{ background: `${typeColors[room.type]}20`, color: typeColors[room.type] }}>
                            {typeLabels[room.type]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#23232f]">
                          <button
                            onClick={() => setEditingRoom({ id: room._id, name: room.name, pricePerHour: room.pricePerHour, type: room.type })}
                            className="flex-1 px-3 py-[7px] rounded-[8px] text-[13px] font-semibold text-[#f5f5f7] border border-[#23232f] bg-transparent hover:bg-[#23232f] transition-all cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                            Edit
                          </button>
                          <Link href={`/rooms/${room._id}`} className="px-3 py-[7px] rounded-[8px] text-[13px] font-semibold text-[#7c6cf2] border border-[#7c6cf2]/30 hover:border-[#7c6cf2] no-underline transition-all whitespace-nowrap">
                            Open
                          </Link>
                          {showDelete && (
                            <button className="p-2 rounded-[8px] text-[#f25c78]/60 hover:text-[#f25c78] hover:bg-[#f25c78]/10 transition-all cursor-pointer border-none bg-transparent">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="bg-[#12121a] border border-[#23232f] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#23232f]">
              <h2 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>User Management</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b7b]" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full sm:w-52 bg-[#0a0a0f] border border-[#23232f] rounded-[8px] pl-9 pr-4 py-[7px] text-[14px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#23232f]">
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Bookings</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Total Spent</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Joined</th>
                    <th className="text-right px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                      const initial = u.name.charAt(0).toUpperCase()
                      return (
                        <tr key={u._id} className="border-b border-[#23232f] last:border-b-0 hover:bg-[#0a0a0f]/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[15px] font-bold shrink-0" style={{ background: '#23232f', color: '#9a9aab' }}>
                                {initial}
                              </div>
                              <div>
                                <div className="text-[14px] font-medium text-[#f5f5f7]">{u.name}</div>
                                <div className="text-[12px] text-[#6b6b7b]">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[12px] px-2.5 py-1 rounded-full font-semibold ${
                              u.role === 'admin'
                                ? 'bg-[#7c6cf2]/15 text-[#7c6cf2]'
                                : 'bg-[#6b6b7b]/15 text-[#9a9aab]'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[14px] text-[#f5f5f7] font-medium">{u.bookings}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[14px] font-semibold text-[#f5f5f7]">${u.totalSpent}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[12px] px-2.5 py-1 rounded-full font-semibold ${
                              u.isVerified
                                ? 'bg-[#2fd18f]/15 text-[#2fd18f]'
                                : 'bg-[#f2a13c]/15 text-[#f2a13c]'
                            }`}>
                              {u.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-[14px] text-[#f5f5f7]">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setDetailModal({
                                  open: true,
                                  title: u.name,
                                  details: [
                                    { label: 'Email', value: u.email },
                                    {
                                      label: 'Role',
                                      value: u.role === 'admin' ? 'Admin' : 'User',
                                      color: u.role === 'admin' ? '#7c6cf2' : '#9a9aab',
                                    },
                                    { label: 'Bookings', value: `${u.bookings}` },
                                    { label: 'Total Spent', value: `$${u.totalSpent}` },
                                    {
                                      label: 'Status',
                                      value: u.isVerified ? 'Verified' : 'Unverified',
                                      color: u.isVerified ? '#2fd18f' : '#f2a13c',
                                    },
                                    { label: 'Joined', value: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                                  ],
                                })}
                                className="p-1.5 rounded-[6px] text-[#9a9aab] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setConfirmModal({ message: `Are you sure you want to delete user "${u.name}"? This action cannot be undone.`, onConfirm: () => { setDeletedUserIds((prev) => [...prev, u._id]); setConfirmModal(null) } })}
                                className="p-1.5 rounded-[6px] text-[#f25c78]/60 hover:text-[#f25c78] hover:bg-[#f25c78]/10 transition-all cursor-pointer border-none bg-transparent"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden divide-y divide-[#23232f]">
              {filteredUsers.map((u) => {
                const initial = u.name.charAt(0).toUpperCase()
                return (
                  <div key={u._id} className="px-4 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[15px] font-bold shrink-0" style={{ background: '#23232f', color: '#9a9aab' }}>
                          {initial}
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-[#f5f5f7]">{u.name}</div>
                          <div className="text-[12px] text-[#6b6b7b]">{u.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailModal({
                            open: true,
                            title: u.name,
                            details: [
                              { label: 'Email', value: u.email },
                              { label: 'Role', value: u.role === 'admin' ? 'Admin' : 'User', color: u.role === 'admin' ? '#7c6cf2' : '#9a9aab' },
                              { label: 'Bookings', value: `${u.bookings}` },
                              { label: 'Total Spent', value: `$${u.totalSpent}` },
                              { label: 'Status', value: u.isVerified ? 'Verified' : 'Unverified', color: u.isVerified ? '#2fd18f' : '#f2a13c' },
                              { label: 'Joined', value: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                            ],
                          })}
                          className="p-1.5 rounded-[6px] text-[#9a9aab] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ message: `Are you sure you want to delete user "${u.name}"? This action cannot be undone.`, onConfirm: () => { setDeletedUserIds((prev) => [...prev, u._id]); setConfirmModal(null) } })}
                          className="p-1.5 rounded-[6px] text-[#f25c78]/60 hover:text-[#f25c78] hover:bg-[#f25c78]/10 transition-all cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[13px] flex-wrap">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        u.role === 'admin' ? 'bg-[#7c6cf2]/15 text-[#7c6cf2]' : 'bg-[#6b6b7b]/15 text-[#9a9aab]'
                      }`}>{u.role === 'admin' ? 'Admin' : 'User'}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        u.isVerified ? 'bg-[#2fd18f]/15 text-[#2fd18f]' : 'bg-[#f2a13c]/15 text-[#f2a13c]'
                      }`}>{u.isVerified ? 'Verified' : 'Unverified'}</span>
                      <span className="text-[#6b6b7b]">{u.bookings} bookings</span>
                      <span className="text-[#f5f5f7] font-semibold">${u.totalSpent}</span>
                    </div>
                    <div className="text-[12px] text-[#6b6b7b]">
                      Joined {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-5 py-4 border-t border-[#23232f] flex items-center gap-5">
              <span className="text-[13px] text-[#9a9aab]">Showing {filteredUsers.length} of {filteredUsers.length} users</span>
              <span className="text-[13px] text-[#6b6b7b]">{filteredUsers.filter((u) => u.role === 'admin').length} admin</span>
              <span className="text-[13px] text-[#6b6b7b]">{filteredUsers.filter((u) => u.isVerified).length} verified</span>
            </div>
          </div>
        )}
      </div>
      {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
      {editingRoom && <RoomEditModal room={editingRoom} onSave={handleSaveRoom} onClose={() => setEditingRoom(null)} />}
      <DetailModal open={detailModal.open} onClose={() => setDetailModal({ open: false, title: '', details: [] })} title={detailModal.title} details={detailModal.details} />
    </div>
  )
}

// function handleDownloadBookingsReport() {
//   const doc = new jsPDF()

//   // Header
//   doc.setFont('helvetica', 'bold')
//   doc.setFontSize(18)
//   doc.setTextColor(124, 92, 255)
//   doc.text('GameZone Arena', 14, 18)

//   doc.setFontSize(12)
//   doc.setTextColor(80, 80, 80)
//   doc.text('Bookings Report', 14, 25)

//   doc.setFontSize(9)
//   doc.setTextColor(140, 140, 140)
//   doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 14, 31)
//   doc.text(`Total records: ${mockBookings.length}`, 14, 36)

//   // Table
//   autoTable(doc, {
//     startY: 42,
//     head: [['Booking ID', 'Room', 'Devices', 'Date', 'Time', 'Duration', 'Amount', 'Status', 'Payment']],
//     body: mockBookings.map((b) => {
//       const room = mockRooms.find((r) => r._id === b.roomId)
//       const originalIndex = mockBookings.indexOf(b)
//       return [
//         bookingIds[originalIndex],
//         room?.name || 'Room',
//         String(b.deviceCount),
//         formatDate(b.bookingDate),
//         b.startTime,
//         `${b.durationHours}h`,
//         `$${b.totalPrice}`,
//         b.status.charAt(0).toUpperCase() + b.status.slice(1),
//         b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1),
//       ]
//     }),
//     styles: { fontSize: 9, cellPadding: 4 },
//     headStyles: { fillColor: [124, 92, 255], textColor: [255, 255, 255], fontStyle: 'bold' },
//     alternateRowStyles: { fillColor: [245, 245, 250] },
//   })

//   doc.save(`gamezone-bookings-report-${Date.now()}.pdf`)
// }
function handleDownloadBookingsReport() {
  const doc = new jsPDF()
  const pageWidth = 210

  // ---- Header band ----
  doc.setFillColor(60, 52, 137)
  doc.rect(0, 0, pageWidth, 30, 'F')

  const logoSize = 8
  doc.setFillColor(127, 119, 221)
  doc.roundedRect(14, 8, logoSize, logoSize, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('G', 14 + logoSize / 2, 8 + logoSize / 2 + 1, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  doc.text('GameZone Arena', 26, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(206, 203, 246)
  doc.text(
    `Bookings Report  \u00b7  Generated ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    26,
    20
  )

  // ---- Summary stat cards ----
  const totalCount = mockBookings.length
  const revenue = mockBookings
    .filter((b) => b.status === 'completed' || b.paymentStatus === 'paid')
    .reduce((s, b) => s + b.totalPrice, 0)
  const pendingCountReport = mockBookings.filter((b) => b.status === 'pending').length
  const completedCountReport = mockBookings.filter((b) => b.status === 'completed').length

  const stats: [string, string][] = [
    ['Total Bookings', String(totalCount)],
    ['Revenue', `$${revenue}`],
    ['Pending', String(pendingCountReport)],
    ['Completed', String(completedCountReport)],
  ]

  const statBoxWidth = 42
  const statGap = 4
  const statsStartX = 14
  const statsY = 38

  stats.forEach(([label, value], i) => {
    const x = statsStartX + i * (statBoxWidth + statGap)
    doc.setFillColor(241, 239, 232)
    doc.roundedRect(x, statsY, statBoxWidth, 18, 3, 3, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(95, 94, 90)
    doc.text(label, x + 5, statsY + 7)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(44, 44, 42)
    doc.text(value, x + 5, statsY + 14)
  })

  // ---- Table ----
  autoTable(doc, {
    startY: 64,
    head: [['Booking ID', 'Room', 'Devices', 'Date', 'Time', 'Duration', 'Amount', 'Status', 'Payment']],
    body: mockBookings.map((b) => {
      const room = mockRooms.find((r) => r._id === b.roomId)
      const originalIndex = mockBookings.indexOf(b)
      return [
        bookingIds[originalIndex],
        room?.name || 'Room',
        String(b.deviceCount),
        formatDate(b.bookingDate),
        b.startTime,
        `${b.durationHours}h`,
        `$${b.totalPrice}`,
        b.status.charAt(0).toUpperCase() + b.status.slice(1),
        b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1),
      ]
    }),
    styles: { fontSize: 9, cellPadding: 4, textColor: [44, 44, 42] },
    headStyles: { fillColor: [60, 52, 137], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 247, 243] },
    columnStyles: {
      6: { halign: 'right' },
    },
  })

  // ---- Page numbers (added after the table is fully laid out) ----
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(180, 178, 169)
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, doc.internal.pageSize.height - 10, { align: 'right' })
  }

  doc.save(`gamezone-bookings-report-${Date.now()}.pdf`)
}
