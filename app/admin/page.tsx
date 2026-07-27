'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, ExternalLink, Pencil, Eye, Trash2, X, Loader2 } from 'lucide-react'
import Navbar from '@/components/navbar'
import type { Room, Device, Booking, User, RoomType } from '@/lib/types'

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

function getDisplayId(id: string) {
  return 'GZ-' + id.slice(-6).toUpperCase()
}

function getRoomStat(roomId: string, devices: Device[]) {
  const devs = devices.filter((d) => d.roomId === roomId)
  return { available: devs.filter((d) => d.status === 'available').length, total: devs.length }
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

interface RoomFormData {
  name: string
  type: string
  pricePerHour: number
  totalDevices: number
  status: string
  description: string
}

function AddRoomModal({ onSave, onClose }: { onSave: (data: RoomFormData) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('pc')
  const [price, setPrice] = useState('')
  const [totalDevices, setTotalDevices] = useState('')
  const [status, setStatus] = useState('active')
  const [description, setDescription] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#12121a] border border-[#23232f] rounded-[16px] w-full max-w-sm mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>Add Room</h3>
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
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Price per Hour ($)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Total Devices</label>
              <input
                type="number"
                value={totalDevices}
                onChange={(e) => setTotalDevices(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b6b7b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '20px' }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#9a9aab] border border-[#23232f] bg-transparent hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer">
              Cancel
            </button>
            <button
              onClick={() => onSave({ name, type, pricePerHour: parseInt(price) || 0, totalDevices: parseInt(totalDevices) || 0, status, description })}
              className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-white border-none cursor-pointer btn-primary-gradient glow-violet transition-all duration-200"
            >
              Add Room
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface EditRoomData {
  name: string
  type: string
  pricePerHour: number
  images: string
  status: string
}

function RoomEditModal({ room, onSave, onClose }: { room: { id: string; name: string; pricePerHour: number; type: string; images: string; status: string }; onSave: (id: string, data: EditRoomData) => void; onClose: () => void }) {
  const [name, setName] = useState(room.name)
  const [price, setPrice] = useState(String(room.pricePerHour))
  const [type, setType] = useState(room.type)
  const [images, setImages] = useState(room.images)
  const [status, setStatus] = useState(room.status)
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
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Images (comma-separated URLs)</label>
            <input
              type="text"
              value={images}
              onChange={(e) => setImages(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b6b7b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '20px' }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#9a9aab] border border-[#23232f] bg-transparent hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer">
              Cancel
            </button>
            <button
              onClick={() => onSave(room.id, { name, type, pricePerHour: parseInt(price) || 0, images, status })}
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

interface AdminUser extends User {
  bookings: number
  totalSpent: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [roomSearch, setRoomSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [detailModal, setDetailModal] = useState<{ open: boolean; title: string; details: DetailItem[] }>({ open: false, title: '', details: [] })
  const [editingRoom, setEditingRoom] = useState<{ id: string; name: string; pricePerHour: number; type: string; images: string; status: string } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [showAddRoom, setShowAddRoom] = useState(false)

  const [rooms, setRooms] = useState<Room[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4000)
      return () => clearTimeout(t)
    }
  }, [feedback])

  async function apiFetch(url: string, options?: RequestInit) {
    const token = localStorage.getItem('gz_token')
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(err.error || `Request failed (${res.status})`)
    }
    return res.json()
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [roomsData, bookingsData, usersData, devicesData] = await Promise.all([
        apiFetch('/api/admin/rooms'),
        apiFetch('/api/admin/bookings'),
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/devices'),
      ])
      setRooms(roomsData)
      setBookings(bookingsData)
      setUsers(usersData.map((u: User) => ({ ...u, bookings: 0, totalSpent: 0 })))
      setDevices(devicesData)
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load data' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddRoom = useCallback(async (data: RoomFormData) => {
    try {
      await apiFetch('/api/admin/rooms', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setFeedback({ type: 'success', message: 'Room created successfully' })
      setShowAddRoom(false)
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create room' })
    }
  }, [fetchData])

  const handleEditRoom = useCallback(async (id: string, data: EditRoomData) => {
    try {
      const body: Record<string, unknown> = {
        name: data.name,
        type: data.type,
        pricePerHour: data.pricePerHour,
        status: data.status,
      }
      if (data.images) {
        body.images = data.images.split(',').map((s) => s.trim()).filter(Boolean)
      }
      await apiFetch(`/api/admin/rooms/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      setFeedback({ type: 'success', message: 'Room updated successfully' })
      setEditingRoom(null)
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update room' })
    }
  }, [fetchData])

  const handleDeleteRoom = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })
      setFeedback({ type: 'success', message: 'Room deleted successfully' })
      setConfirmModal(null)
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete room' })
    }
  }, [fetchData])

  const handleApproveCash = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/admin/bookings/${id}/approve-cash`, { method: 'PATCH' })
      setFeedback({ type: 'success', message: 'Cash payment approved' })
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to approve payment' })
    }
  }, [fetchData])

  const handleDeleteBooking = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      setFeedback({ type: 'success', message: 'Booking deleted successfully' })
      setConfirmModal(null)
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete booking' })
    }
  }, [fetchData])

  const handleDeleteUser = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      setFeedback({ type: 'success', message: 'User deleted successfully' })
      setConfirmModal(null)
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete user' })
    }
  }, [fetchData])

  const availableDevices = devices.filter((d) => d.status === 'available').length
  const totalDeviceCount = devices.length
  const activeBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed')
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const totalRevenue = bookings
    .filter((b) => b.status === 'completed' || b.paymentStatus === 'paid')
    .reduce((s, b) => s + b.totalPrice, 0)

  const revenueByType = (['pc', 'console', 'vr', 'private'] as RoomType[]).map((type) => {
    const roomIds = rooms.filter((r) => r.type === type).map((r) => r._id)
    const rev = bookings
      .filter((b) => roomIds.includes(b.roomId) && (b.status === 'completed' || b.paymentStatus === 'paid'))
      .reduce((s, b) => s + b.totalPrice, 0)
    return { label: typeLabels[type], value: rev, color: typeColors[type] }
  })
  const maxRev = Math.max(...revenueByType.map((r) => r.value), 1)

  const filteredBookings = bookings.filter((b) => {
    if (!search) return true
    const q = search.toLowerCase()
    const room = b.room?.name || ''
    return room.toLowerCase().includes(q) || b.status.includes(q) || getDisplayId(b._id).toLowerCase().includes(q)
  })

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true
    const q = userSearch.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const filteredRooms = rooms.filter((r) => {
    if (!roomSearch) return true
    const q = roomSearch.toLowerCase()
    return r.name.toLowerCase().includes(q) || typeLabels[r.type].toLowerCase().includes(q)
  })

  const tabs = [
    { id: 'overview', label: 'Overview', badge: null },
    { id: 'bookings', label: 'Bookings', badge: bookings.length },
    { id: 'rooms', label: 'Rooms', badge: null },
    { id: 'devices', label: 'Devices', badge: null },
    { id: 'users', label: 'Users', badge: users.length },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 text-[#7c6cf2] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-10 py-8 pt-24" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {feedback && (
          <div className={`mb-4 px-4 py-3 rounded-[10px] text-[14px] font-medium flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-[#2fd18f]/15 text-[#2fd18f] border border-[#2fd18f]/30' : 'bg-[#f25c78]/15 text-[#f25c78] border border-[#f25c78]/30'
          }`}>
            <span className="flex-1">{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="p-0.5 text-current/60 hover:text-current bg-transparent border-none cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
                { icon: '◈', bg: 'rgba(242,161,60,0.15)', color: '#f2a13c', value: `${availableDevices}/${totalDeviceCount}`, label: 'Devices Available', sub: `${totalDeviceCount} total` },
                { icon: '☺', bg: 'rgba(124,108,242,0.15)', color: '#7c6cf2', value: users.length.toString(), label: 'Registered Users', sub: `${users.filter((u) => u.role === 'admin').length} admin` },
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
                {rooms.map((room) => {
                  const stat = getRoomStat(room._id, devices)
                  const isAvail = stat.available > 0 && room.status === 'active'
                  return (
                    <div key={room._id} className="flex items-center py-3 border-b border-[#23232f] last:border-b-0 gap-2">
                      <img src={room.images?.[0] || '/images/room-pc.png'} alt="" className="w-11 h-11 rounded-[10px] object-cover shrink-0" />
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
                {bookings.slice(0, 5).map((b) => (
                  <div key={b._id} className="flex items-center py-3 border-b border-[#23232f] last:border-b-0">
                    <img src={(b.room as any)?.images?.[0] || '/images/room-pc.png'} alt="" className="w-11 h-11 rounded-[10px] object-cover mr-3.5 shrink-0" />
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
                  {filteredBookings.map((b) => {
                    const room = rooms.find((r) => r._id === b.roomId)
                    return (
                      <tr key={b._id} className="border-b border-[#23232f] last:border-b-0 hover:bg-[#0a0a0f]/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-[13px] font-mono font-semibold text-[#f5f5f7]">{getDisplayId(b._id)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={(room as any)?.images?.[0] || '/images/room-pc.png'} alt="" className="w-9 h-9 rounded-[8px] object-cover shrink-0" />
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
                            {b.paymentStatus === 'unpaid' && b.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    message: `Approve cash payment for booking ${getDisplayId(b._id)}? This will mark the payment as paid and confirm the booking.`,
                                    onConfirm: () => handleApproveCash(b._id),
                                  })
                                }}
                                className="px-2 py-1 rounded-[6px] text-[11px] font-semibold text-[#2fd18f] bg-[#2fd18f]/10 hover:bg-[#2fd18f]/20 transition-all cursor-pointer border-none"
                              >
                                Approve Cash
                              </button>
                            )}
                            <button
                              onClick={() => setDetailModal({
                                open: true,
                                title: `Booking Code ${getDisplayId(b._id)}`,
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
                              onClick={() => setConfirmModal({ message: `Are you sure you want to delete booking ${getDisplayId(b._id)}? This action cannot be undone.`, onConfirm: () => handleDeleteBooking(b._id) })}
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
              {filteredBookings.map((b) => {
                const room = rooms.find((r) => r._id === b.roomId)
                const payColor = b.paymentStatus === 'paid' ? '#2fd18f' : b.paymentStatus === 'refunded' ? '#f25c78' : '#6c8cf5'
                return (
                  <div key={b._id} className="px-4 py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-mono font-semibold text-[#f5f5f7]">{getDisplayId(b._id)}</span>
                      <div className="flex items-center gap-1">
                        {b.paymentStatus === 'unpaid' && b.status === 'pending' && (
                          <button
                            onClick={() => {
                              setConfirmModal({
                                message: `Approve cash payment for booking ${getDisplayId(b._id)}?`,
                                onConfirm: () => handleApproveCash(b._id),
                              })
                            }}
                            className="px-2 py-1 rounded-[6px] text-[11px] font-semibold text-[#2fd18f] bg-[#2fd18f]/10 hover:bg-[#2fd18f]/20 transition-all cursor-pointer border-none"
                          >
                            Approve Cash
                          </button>
                        )}
                        <button
                          onClick={() => setDetailModal({
                            open: true,
                            title: `Booking Code ${getDisplayId(b._id)}`,
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
                          onClick={() => setConfirmModal({ message: `Are you sure you want to delete booking ${getDisplayId(b._id)}? This action cannot be undone.`, onConfirm: () => handleDeleteBooking(b._id) })}
                          className="p-1.5 rounded-[6px] text-[#f25c78]/60 hover:text-[#f25c78] hover:bg-[#f25c78]/10 transition-all cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <img src={(room as any)?.images?.[0] || '/images/room-pc.png'} alt="" className="w-8 h-8 rounded-[6px] object-cover shrink-0" />
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
                <button onClick={() => setShowAddRoom(true)} className="hidden sm:inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[10px] text-[13px] font-semibold text-white border-none cursor-pointer btn-primary-gradient glow-violet transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  Add Room
                </button>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room) => {
                const stat = getRoomStat(room._id, devices)
                const isAvail = stat.available > 0 && room.status === 'active'
                return (
                  <div key={room._id} className="bg-[#0a0a0f] border border-[#23232f] rounded-[14px] overflow-hidden">
                    <div className="relative">
                      <img src={room.images?.[0] || '/images/room-pc.png'} alt="" className="w-full h-32 object-cover" />
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
                          onClick={() => setEditingRoom({ id: room._id, name: room.name, pricePerHour: room.pricePerHour, type: room.type, images: room.images?.join(', ') || '', status: room.status })}
                          className="flex-1 px-3 py-[7px] rounded-[8px] text-[13px] font-semibold text-[#f5f5f7] border border-[#23232f] bg-transparent hover:bg-[#23232f] transition-all cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                          Edit
                        </button>
                        <Link href={`/rooms/${room._id}`} className="px-3 py-[7px] rounded-[8px] text-[13px] font-semibold text-[#7c6cf2] border border-[#7c6cf2]/30 hover:border-[#7c6cf2] no-underline transition-all whitespace-nowrap">
                          Open
                        </Link>
                        <button
                          onClick={() => setConfirmModal({ message: `Are you sure you want to delete "${room.name}"? This action cannot be undone.`, onConfirm: () => handleDeleteRoom(room._id) })}
                          className="p-2 rounded-[8px] text-[#f25c78]/60 hover:text-[#f25c78] hover:bg-[#f25c78]/10 transition-all cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Devices */}
        {activeTab === 'devices' && (
          <div className="bg-[#12121a] border border-[#23232f] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#23232f]">
              <h2 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>Device Management</h2>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#23232f]">
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Device</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Room</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Specs</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => {
                    const room = rooms.find((r) => r._id === d.roomId)
                    return (
                      <tr key={d._id} className="border-b border-[#23232f] last:border-b-0 hover:bg-[#0a0a0f]/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ background: '#23232f', color: '#9a9aab' }}>
                              {d.deviceLabel.slice(0, 2)}
                            </div>
                            <span className="text-[14px] font-medium text-[#f5f5f7]">{d.deviceLabel}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[14px] text-[#f5f5f7]">{room?.name || 'Unknown Room'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[13px] text-[#9a9aab]">{d.specs || '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[12px] px-2.5 py-1 rounded-full font-semibold ${
                            d.status === 'available' ? 'bg-[#2fd18f]/15 text-[#2fd18f]' :
                            d.status === 'booked' ? 'bg-[#6c8cf5]/15 text-[#6c8cf5]' :
                            'bg-[#f2a13c]/15 text-[#f2a13c]'
                          }`}>
                            {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[13px] text-[#6b6b7b]">{new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden divide-y divide-[#23232f]">
              {devices.map((d) => {
                const room = rooms.find((r) => r._id === d.roomId)
                return (
                  <div key={d._id} className="px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ background: '#23232f', color: '#9a9aab' }}>
                          {d.deviceLabel.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-[#f5f5f7]">{d.deviceLabel}</div>
                          <div className="text-[12px] text-[#6b6b7b]">{room?.name || 'Unknown Room'}</div>
                        </div>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        d.status === 'available' ? 'bg-[#2fd18f]/15 text-[#2fd18f]' :
                        d.status === 'booked' ? 'bg-[#6c8cf5]/15 text-[#6c8cf5]' :
                        'bg-[#f2a13c]/15 text-[#f2a13c]'
                      }`}>
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                    </div>
                    {d.specs && <div className="text-[12px] text-[#9a9aab]">{d.specs}</div>}
                    <div className="text-[12px] text-[#6b6b7b]">Added {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                )
              })}
            </div>

            <div className="px-5 py-4 border-t border-[#23232f] flex items-center gap-5">
              <span className="text-[13px] text-[#9a9aab]">Showing {devices.length} of {devices.length} devices</span>
              <span className="text-[13px] text-[#6b6b7b]">{devices.filter((d) => d.status === 'available').length} available</span>
              <span className="text-[13px] text-[#6b6b7b]">{devices.filter((d) => d.status === 'booked').length} booked</span>
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
                                onClick={() => setConfirmModal({ message: `Are you sure you want to delete user "${u.name}"? This action cannot be undone.`, onConfirm: () => handleDeleteUser(u._id) })}
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
                          onClick={() => setConfirmModal({ message: `Are you sure you want to delete user "${u.name}"? This action cannot be undone.`, onConfirm: () => handleDeleteUser(u._id) })}
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
      {showAddRoom && <AddRoomModal onSave={handleAddRoom} onClose={() => setShowAddRoom(false)} />}
      {confirmModal && <ConfirmModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
      {editingRoom && <RoomEditModal room={editingRoom} onSave={handleEditRoom} onClose={() => setEditingRoom(null)} />}
      <DetailModal open={detailModal.open} onClose={() => setDetailModal({ open: false, title: '', details: [] })} title={detailModal.title} details={detailModal.details} />
    </div>
  )
}
