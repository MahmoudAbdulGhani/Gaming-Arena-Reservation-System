'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Pencil, Eye, Trash2, X, Download, Lock, AlertCircle, CreditCard, Banknote, CheckCircle2 } from 'lucide-react'
import Navbar from '@/components/navbar'
import type { Device, RoomType, User, Room, Booking } from '@/lib/types'
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

let stripePromise: ReturnType<typeof loadStripe> | null = null
function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (key) stripePromise = loadStripe(key)
  }
  return stripePromise
}

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

const roomTypeFallback: Record<string, string> = {
  pc: '/images/room-pc.png',
  console: '/images/room-console.png',
  vr: '/images/room-vr.png',
  private: '/images/room-private.png',
}

function getRoomThumb(room?: Room): string {
  if (room?.images?.length) return room.images[0]
  if (room?.type) return roomTypeFallback[room.type] || '/images/room-pc.png'
  return '/images/room-pc.png'
}

function getDisplayId(id: string) {
  return `GZ-${id.slice(-6).toUpperCase()}`
}

function getRoomStat(roomId: string, devices: Device[]) {
  const devs = devices.filter((d) => d.roomId === roomId)
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
              onClick={() => onSave(room.id, { name, type, pricePerHour: parseInt(price) || 0, images: room.images, status: room.status })}
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

interface DeviceFormData {
  roomId: string
  deviceLabel: string
  specs: string
  status: string
}

function AddDeviceModal({ rooms, onSave, onClose }: { rooms: Room[]; onSave: (data: DeviceFormData) => void; onClose: () => void }) {
  const [roomId, setRoomId] = useState(rooms[0]?._id || '')
  const [deviceLabel, setDeviceLabel] = useState('')
  const [specs, setSpecs] = useState('')
  const [status, setStatus] = useState('available')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#12121a] border border-[#23232f] rounded-[16px] w-full max-w-sm mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>Add Device</h3>
          <button onClick={onClose} className="p-1.5 rounded-[8px] text-[#6b6b7b] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer"
            >
              {rooms.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Device Label</label>
            <input
              type="text"
              value={deviceLabel}
              onChange={(e) => setDeviceLabel(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Specs</label>
            <input
              type="text"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'available' | 'booked' | 'maintenance')}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer"
            >
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#9a9aab] border border-[#23232f] bg-transparent hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer">
              Cancel
            </button>
            <button
              onClick={() => onSave({ roomId, deviceLabel, specs, status })}
              className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-white border-none cursor-pointer btn-primary-gradient glow-violet transition-all duration-200"
            >
              Add Device
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditDeviceModal({ device, rooms, onSave, onClose }: { device: Device; rooms: Room[]; onSave: (id: string, data: DeviceFormData) => void; onClose: () => void }) {
  const [deviceLabel, setDeviceLabel] = useState(device.deviceLabel)
  const [specs, setSpecs] = useState(device.specs)
  const [status, setStatus] = useState(device.status)
  const room = rooms.find((r) => r._id === device.roomId)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#12121a] border border-[#23232f] rounded-[16px] w-full max-w-sm mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>Edit Device</h3>
          <button onClick={onClose} className="p-1.5 rounded-[8px] text-[#6b6b7b] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Room</label>
            <div className="bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#6b6b7b]">{room?.name || 'Unknown'}</div>
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Device Label</label>
            <input
              type="text"
              value={deviceLabel}
              onChange={(e) => setDeviceLabel(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Specs</label>
            <input
              type="text"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'available' | 'booked' | 'maintenance')}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer"
            >
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#9a9aab] border border-[#23232f] bg-transparent hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer">
              Cancel
            </button>
            <button
              onClick={() => onSave(device._id, { roomId: device.roomId, deviceLabel, specs, status })}
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

function CardPaymentForm({ clientSecret, totalPrice, onComplete, onError }: { clientSecret: string; totalPrice: number; onComplete: () => void | Promise<void>; onError: (msg: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)

  async function handlePay() {
    if (!stripe || !elements) return
    setProcessing(true)
    const card = elements.getElement(CardElement)
    if (!card) { setProcessing(false); return }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card, billing_details: { name: 'Admin' } },
    })

    if (stripeError) {
      onError(stripeError.message ?? 'Payment failed')
      setProcessing(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        await onComplete()
      } catch {
        // onComplete has its own error handling
      }
      setProcessing(false)
    } else {
      onError(paymentIntent ? `Payment ${paymentIntent.status}` : 'Payment failed')
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Lock className="w-4 h-4 text-[#7c6cf2]" />
        <span className="text-[14px] font-semibold text-[#f5f5f7]">Card Payment</span>
      </div>
      <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#23232f]">
        <label className="block text-[12px] text-[#6b6b7b] mb-3">Card Details</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#f5f5f7',
                fontFamily: 'monospace',
                '::placeholder': { color: '#6b6b7b' },
              },
              invalid: { color: '#f25c78' },
            },
            hidePostalCode: true,
          }}
          onChange={(e) => setCardComplete(e.complete)}
        />
      </div>
      <div className="p-3 rounded-xl bg-[#7c6cf2]/10 border border-[#7c6cf2]/20">
        <p className="text-[11px] text-[#9a9aab] leading-relaxed">
          Test mode &mdash; use card <span className="font-mono">4242 4242 4242 4242</span>, any future date, any CVC.
        </p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#23232f]">
        <span className="text-[14px] text-[#6b6b7b]">Total</span>
        <span className="text-[20px] font-bold text-[#f5f5f7]">${totalPrice}</span>
      </div>
      <button
        onClick={handlePay}
        disabled={processing || !stripe || !cardComplete}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[10px] text-[14px] font-semibold text-white border-none cursor-pointer btn-primary-gradient glow-violet transition-all duration-200 disabled:opacity-60"
      >
        {processing ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay ${totalPrice}
          </>
        )}
      </button>
    </div>
  )
}

function AddReservationModal({ rooms, devices, users, onSave, onSuccess, onClose }: { rooms: Room[]; devices: Device[]; users: { _id: string; name: string; email: string; role: string }[]; onSave: (data: { userId: string; roomId: string; deviceIds: string[]; bookingDate: string; startTime: string; durationHours: number; totalPrice: number; paymentMethod: string }) => void; onSuccess?: () => void; onClose: () => void }) {
  const customers = users.filter((u) => u.role === 'customer')
  const [userId, setUserId] = useState(customers[0]?._id || '')
  const [roomId, setRoomId] = useState(rooms[0]?._id || '')
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('10:00')
  const [durationHours, setDurationHours] = useState(2)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [step, setStep] = useState<'form' | 'payment'>('form')
  const [clientSecret, setClientSecret] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const selectedRoom = rooms.find((r) => r._id === roomId)
  const roomDevices = devices.filter((d) => d.roomId === roomId && d.status === 'available')
  const totalPrice = (selectedRoom?.pricePerHour || 0) * durationHours

  function toggleDevice(id: string) {
    setSelectedDeviceIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function handleCreateReservation() {
    if (paymentMethod === 'cash') {
      onSave({ userId, roomId, deviceIds: selectedDeviceIds, bookingDate, startTime, durationHours, totalPrice, paymentMethod })
      return
    }

    setIsProcessing(true)
    setPaymentError('')
    try {
      const piRes = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(totalPrice * 100), currency: 'usd' }),
      })
      const pi = await piRes.json()
      if (!piRes.ok) throw new Error(pi.error || 'Failed to create payment')

      setClientSecret(pi.clientSecret)
      setStep('payment')
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to create reservation')
    } finally {
      setIsProcessing(false)
    }
  }

  if (step === 'payment') {
    const stripe = getStripe()
    if (!stripe) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <div className="bg-[#12121a] border border-[#23232f] rounded-[16px] w-full max-w-sm mx-4 p-6 shadow-2xl">
            <div className="text-center">
              <AlertCircle className="w-10 h-10 text-[#f2a13c] mx-auto mb-3" />
              <p className="text-[14px] text-[#9a9aab]">Stripe is not configured. Add your Stripe publishable key to .env.local</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 rounded-[8px] text-[13px] font-semibold text-white bg-[#7c6cf2] border-none cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-[#12121a] border border-[#23232f] rounded-[16px] w-full max-w-sm mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>Complete Payment</h3>
            <button onClick={onClose} className="p-1.5 rounded-[8px] text-[#6b6b7b] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent">
              <X className="w-4 h-4" />
            </button>
          </div>
          <Elements stripe={stripe}>
            <CardPaymentForm clientSecret={clientSecret} totalPrice={totalPrice} onComplete={async () => {
              try {
                const token = localStorage.getItem('gz_token')
                const res = await fetch('/api/admin/bookings', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({ userId, roomId, deviceIds: selectedDeviceIds, bookingDate, startTime, durationHours, totalPrice, paymentMethod: 'card' }),
                })
                const booking = await res.json()
                if (!res.ok) throw new Error(booking.error || 'Failed to create booking')
                await fetch(`/api/admin/bookings/${booking._id}/approve-cash`, {
                  method: 'PATCH',
                  headers: token ? { authorization: `Bearer ${token}` } : {},
                })
                onSuccess?.()
                onClose()
              } catch (err) {
                setPaymentError(err instanceof Error ? err.message : 'Payment succeeded but failed to create booking')
                setStep('form')
              }
            }} onError={(msg) => setPaymentError(msg)} />
          </Elements>
          {paymentError && (
            <div className="mt-3 p-3 rounded-xl bg-[#f25c78]/10 border border-[#f25c78]/20">
              <p className="text-[12px] text-[#f25c78] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {paymentError}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#12121a] border border-[#23232f] rounded-[16px] w-full max-w-sm mx-4 p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>Add Reservation</h3>
          <button onClick={onClose} className="p-1.5 rounded-[8px] text-[#6b6b7b] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">User</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer"
            >
              {customers.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Room</label>
            <select
              value={roomId}
              onChange={(e) => { setRoomId(e.target.value); setSelectedDeviceIds([]) }}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer"
            >
              {rooms.map((r) => <option key={r._id} value={r._id}>{r.name} (${r.pricePerHour}/hr)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Devices ({selectedDeviceIds.length} selected)</label>
            <div className="max-h-32 overflow-y-auto space-y-1.5 bg-[#0a0a0f] border border-[#23232f] rounded-[8px] p-2">
              {roomDevices.length === 0 ? (
                <div className="text-[12px] text-[#6b6b7b] py-2 text-center">No available devices for this room</div>
              ) : (
                roomDevices.map((d) => (
                  <label key={d._id} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-[6px] hover:bg-[#23232f] transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedDeviceIds.includes(d._id)}
                      onChange={() => toggleDevice(d._id)}
                      className="accent-[#7c6cf2]"
                    />
                    <span className="text-[13px] text-[#f5f5f7]">{d.deviceLabel}</span>
                    <span className="text-[11px] text-[#6b6b7b] ml-auto">{d.specs}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Duration (hours)</label>
            <input
              type="number"
              min={1}
              max={12}
              value={durationHours}
              onChange={(e) => setDurationHours(parseInt(e.target.value) || 1)}
              className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[8px] px-4 py-2 text-[14px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#6b6b7b] mb-1.5">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[10px] text-[13px] font-semibold transition-all border ${
                  paymentMethod === 'card'
                    ? 'bg-[#7c6cf2]/15 border-[#7c6cf2] text-[#7c6cf2]'
                    : 'bg-[#0a0a0f] border-[#23232f] text-[#6b6b7b] hover:border-[#7c6cf2]/40'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Card
              </button>
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[10px] text-[13px] font-semibold transition-all border ${
                  paymentMethod === 'cash'
                    ? 'bg-[#2fd18f]/15 border-[#2fd18f] text-[#2fd18f]'
                    : 'bg-[#0a0a0f] border-[#23232f] text-[#6b6b7b] hover:border-[#2fd18f]/40'
                }`}
              >
                <Banknote className="w-4 h-4" />
                Cash
              </button>
            </div>
          </div>
          <div className="pt-2 border-t border-[#23232f]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[14px] text-[#6b6b7b]">Total Price</span>
              <span className="text-[18px] font-bold text-[#f5f5f7]">${totalPrice}</span>
            </div>
            {paymentMethod === 'cash' && (
              <p className="text-[11px] text-[#f2a13c] mt-1">Booking will be pending until cash payment is confirmed at the venue.</p>
            )}
          </div>
          {paymentError && (
            <div className="p-3 rounded-xl bg-[#f25c78]/10 border border-[#f25c78]/20">
              <p className="text-[12px] text-[#f25c78] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {paymentError}
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#9a9aab] border border-[#23232f] bg-transparent hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleCreateReservation}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-white border-none cursor-pointer btn-primary-gradient glow-violet transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === 'card' ? (
                <>
                  <Lock className="w-4 h-4" />
                  Continue to Payment
                </>
              ) : (
                'Create Reservation'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({
  title,
  message,
  confirmText,
  confirmButtonClassName,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmText: string
  confirmButtonClassName?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-[#12121a] border border-[#23232f] rounded-[16px] w-full max-w-sm mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
          <button onClick={onCancel} className="p-1.5 rounded-[8px] text-[#6b6b7b] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[14px] text-[#9a9aab] mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#9a9aab] border border-[#23232f] bg-transparent hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold text-white border-none cursor-pointer transition-all ${confirmButtonClassName || 'bg-[#f25c78] hover:bg-[#d94e6a]'}`}>
            {confirmText}
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
  const [customerSearch, setCustomerSearch] = useState('')
  const [roomFilter, setRoomFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [devicesFilter, setDevicesFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [roomSearch, setRoomSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [userBookingsMin, setUserBookingsMin] = useState('')
  const [userBookingsMax, setUserBookingsMax] = useState('')
  const [userSpentMin, setUserSpentMin] = useState('')
  const [userSpentMax, setUserSpentMax] = useState('')
  const [deletedBookingIds, setDeletedBookingIds] = useState<string[]>([])
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([])
  const [detailModal, setDetailModal] = useState<{ open: boolean; title: string; details: DetailItem[] }>({ open: false, title: '', details: [] })
  const [roomsData, setRoomsData] = useState<Room[]>([])
  const [editingRoom, setEditingRoom] = useState<{ id: string; name: string; pricePerHour: number; type: string; images: string; status: string } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [showAddReservation, setShowAddReservation] = useState(false)
  const BOOKINGS_PER_PAGE = 10
  const USERS_PER_PAGE = 10
  const [bookingPage, setBookingPage] = useState(0)
  const [userPage, setUserPage] = useState(0)

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

  useEffect(() => { setBookingPage(0) }, [search, customerSearch, roomFilter, dateFrom, dateTo, amountMin, amountMax, devicesFilter, statusFilter, paymentFilter])
  useEffect(() => { setUserPage(0) }, [userSearch, roleFilter, verifiedFilter, userBookingsMin, userBookingsMax, userSpentMin, userSpentMax])

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
      const userStats = new Map<string, { bookings: number; totalSpent: number }>()
      for (const b of bookingsData) {
        const uid = b.userId?.toString?.() ?? b.userId
        if (!uid) continue
        const prev = userStats.get(uid) ?? { bookings: 0, totalSpent: 0 }
        prev.bookings++
        if (b.paymentStatus === 'paid' || b.status === 'completed') {
          prev.totalSpent += b.totalPrice ?? 0
        }
        userStats.set(uid, prev)
      }
      setUsers(usersData.map((u: User) => {
        const stats = userStats.get(u._id)
        return { ...u, bookings: stats?.bookings ?? 0, totalSpent: stats?.totalSpent ?? 0 }
      }))
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

  useEffect(() => {
    if (window.location.search.includes('payment_success=1')) {
      const bookingId = sessionStorage.getItem('pendingCardBookingId')
      sessionStorage.removeItem('pendingCardBookingId')
      if (bookingId) {
        apiFetch(`/api/admin/bookings/${bookingId}/approve-cash`, { method: 'PATCH' }).catch(() => {})
      }
      setFeedback({ type: 'success', message: 'Payment successful! Reservation confirmed.' })
      fetchData()
      window.history.replaceState({}, '', '/admin')
    }
    if (window.location.search.includes('payment_cancelled=1')) {
      setFeedback({ type: 'error', message: 'Payment was cancelled.' })
      window.history.replaceState({}, '', '/admin')
    }
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
    setConfirmModal(null)
    try {
      await apiFetch(`/api/admin/bookings/${id}/approve-cash`, { method: 'PATCH' })
      setFeedback({ type: 'success', message: 'Cash payment approved' })
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to approve payment' })
    }
  }, [fetchData])

  const handleRefund = useCallback(async (id: string) => {
    setConfirmModal(null)
    try {
      await apiFetch(`/api/admin/bookings/${id}/refund`, { method: 'PATCH' })
      setFeedback({ type: 'success', message: 'Booking refunded successfully' })
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to refund booking' })
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

  const handleAddDevice = useCallback(async (data: { roomId: string; deviceLabel: string; specs: string; status: string }) => {
    try {
      await apiFetch('/api/admin/devices', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setFeedback({ type: 'success', message: 'Device added successfully' })
      setShowAddDevice(false)
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to add device' })
    }
  }, [fetchData])

  const handleEditDevice = useCallback(async (id: string, data: { roomId: string; deviceLabel: string; specs: string; status: string }) => {
    try {
      await apiFetch(`/api/admin/devices/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      setFeedback({ type: 'success', message: 'Device updated successfully' })
      setEditingDevice(null)
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update device' })
    }
  }, [fetchData])

  const handleDeleteDevice = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/admin/devices/${id}`, { method: 'DELETE' })
      setFeedback({ type: 'success', message: 'Device deleted successfully' })
      setConfirmModal(null)
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete device' })
    }
  }, [fetchData])

  const handleAddReservation = useCallback(async (data: { userId: string; roomId: string; deviceIds: string[]; bookingDate: string; startTime: string; durationHours: number; totalPrice: number; paymentMethod: string }) => {
    try {
      await apiFetch('/api/admin/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setFeedback({ type: 'success', message: 'Reservation created successfully' })
      setShowAddReservation(false)
      await fetchData()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create reservation' })
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
    const paid = bookings.filter((b) => roomIds.includes(b.roomId) && (b.status === 'completed' || b.paymentStatus === 'paid'))
    const rev = paid.reduce((s, b) => s + b.totalPrice, 0)
    const count = paid.length
    const avg = count > 0 ? Math.round(rev / count) : 0
    const pct = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0
    return { label: typeLabels[type], value: rev, color: typeColors[type], count, avg, pct }
  })
  const maxRev = Math.max(...revenueByType.map((r) => r.value), 1)

  const filteredBookings = bookings.filter((b) => {
    if (deletedBookingIds.includes(b._id)) return false
    const q = search.toLowerCase()
    if (q && !getDisplayId(b._id).toLowerCase().includes(q) && !(b.room?.name || '').toLowerCase().includes(q) && !b.status.includes(q)) return false
    if (customerSearch && !((b as any).user?.name || '').toLowerCase().includes(customerSearch.toLowerCase())) return false
    if (roomFilter && (b.room?.name || '') !== roomFilter) return false
    if (dateFrom && new Date(b.bookingDate) < new Date(dateFrom)) return false
    if (dateTo && new Date(b.bookingDate) > new Date(dateTo + 'T23:59:59')) return false
    if (amountMin && b.totalPrice < parseFloat(amountMin)) return false
    if (amountMax && b.totalPrice > parseFloat(amountMax)) return false
    if (devicesFilter && !String(b.deviceCount).includes(devicesFilter)) return false
    if (statusFilter && b.status !== statusFilter) return false
    if (paymentFilter && b.paymentStatus !== paymentFilter) return false
    return true
  })
  const bookingTotalPages = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE)
  const pagedBookings = filteredBookings.slice(bookingPage * BOOKINGS_PER_PAGE, (bookingPage + 1) * BOOKINGS_PER_PAGE)

  const filteredUsers = users.filter((u) => {
    if (deletedUserIds.includes(u._id)) return false
    if (userSearch) {
      const q = userSearch.toLowerCase()
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
    }
    if (roleFilter && u.role !== roleFilter) return false
    if (verifiedFilter === 'verified' && !u.isVerified) return false
    if (verifiedFilter === 'unverified' && u.isVerified) return false
    if (userBookingsMin && (u.bookings ?? 0) < parseInt(userBookingsMin)) return false
    if (userBookingsMax && (u.bookings ?? 0) > parseInt(userBookingsMax)) return false
    if (userSpentMin && (u.totalSpent ?? 0) < parseFloat(userSpentMin)) return false
    if (userSpentMax && (u.totalSpent ?? 0) > parseFloat(userSpentMax)) return false
    return true
  })
  const userTotalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  const pagedUsers = filteredUsers.slice(userPage * USERS_PER_PAGE, (userPage + 1) * USERS_PER_PAGE)

  const filteredRooms = rooms.filter((r) => {
    if (!roomSearch) return true
    const q = roomSearch.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
  })

  const tabs = [
    { id: 'overview', label: 'Overview', badge: null },
    { id: 'bookings', label: 'Bookings', badge: null },
    { id: 'rooms', label: 'Rooms', badge: null },
    { id: 'users', label: 'Users', badge: null },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-10 py-8 pt-24" style={{ maxWidth: 1400, margin: '0 auto' }}>
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
                 { icon: '◈', bg: 'rgba(242,161,60,0.15)', color: '#f2a13c', value: `${availableDevices}/${devices.length}`, label: 'Devices Available', sub: `${devices.length} total` },
                { icon: '☺', bg: 'rgba(124,108,242,0.15)', color: '#7c6cf2', value: users.filter((u) => u.role === 'customer').length.toString(), label: 'Registered Users', sub: `${users.filter((u) => u.role === 'admin').length} admin` },
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
                  const statusColor = room.status === 'active' ? 'bg-[#2fd18f]/15 text-[#2fd18f]' : room.status === 'maintenance' ? 'bg-[#f2a13c]/15 text-[#f2a13c]' : 'bg-[#f25c78]/15 text-[#f25c78]'
                  return (
                    <div key={room._id} className="flex items-center py-3 border-b border-[#23232f] last:border-b-0 gap-2">
                      <img src={getRoomThumb(room)} alt="" className="w-11 h-11 rounded-[10px] object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[14.5px] font-semibold text-[#f5f5f7] truncate">{room.name}</div>
                        <div className="text-[12.5px] text-[#6b6b7b] mt-0.5">{typeLabels[room.type]}</div>
                      </div>
                      <div className="ml-auto flex items-center gap-2 sm:gap-3.5 shrink-0">
                        <span className="text-[13px] text-[#9a9aab] min-w-[38px] text-right">{stat.available}/{stat.total}</span>
                        <span className={`text-[12px] px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 ${statusColor}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
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
                    <img src={getRoomThumb(b.room)} alt="" className="w-11 h-11 rounded-[10px] object-cover mr-3.5 shrink-0" />
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
              <div className="flex justify-between items-center mb-5">
                <div className="text-[16px] font-bold text-[#f5f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Revenue by Room Type</div>
                <div className="text-[13px] text-[#6b6b7b]">Total: <span className="text-[#f5f5f7] font-semibold">${totalRevenue.toLocaleString()}</span></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {revenueByType.map((r) => (
                  <div key={r.label} className="bg-[#0a0a0f] border border-[#23232f] rounded-[10px] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                        <span className="text-[14px] font-semibold text-[#f5f5f7]">{r.label}</span>
                      </div>
                      <span className="text-[13px] font-bold" style={{ color: r.color }}>${r.value.toLocaleString()}</span>
                    </div>
                    <div className="h-[6px] rounded-full bg-[#23232f] overflow-hidden mb-3">
                      <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-[#6b6b7b]">
                      <span>{r.count} booking{r.count !== 1 ? 's' : ''}</span>
                      <span>{r.pct}% of total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-[#12121a] border border-[#23232f] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#23232f]">
              <h2 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>All Bookings</h2>
                <button onClick={() => setShowAddReservation(true)} className="inline-flex items-center gap-2 px-[16px] py-[9px] rounded-[10px] text-[13px] font-semibold text-white no-underline cursor-pointer btn-primary-gradient glow-violet transition-all duration-200 border-none">
                  <Plus className="w-4 h-4" />
                  Add Reservation
                </button>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-[#23232f]">
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">ID</div>
                      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-all" />
                    </th>
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Room</div>
                      <select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-all appearance-none cursor-pointer">
                        <option value="">All</option>
                        {rooms.map((r) => <option key={r._id} value={r.name}>{r.name}</option>)}
                      </select>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Customer</div>
                      <input type="text" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2 py-1 text-[11px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-all" />
                    </th>
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Devices</div>
                      <input type="text" inputMode="numeric" value={devicesFilter} onChange={(e) => setDevicesFilter(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Qty..." className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2 py-1 text-[11px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-all" />
                    </th>
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Date</div>
                      <div className="flex flex-col gap-1">
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2 py-1 text-[11px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-all" title="From" />
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2 py-1 text-[11px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-all" title="To" />
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Amount</div>
                      <div className="flex gap-1">
                        <input type="text" inputMode="numeric" value={amountMin} onChange={(e) => setAmountMin(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Min" className="w-1/2 min-w-0 bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2 py-1.5 text-[11px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-all" />
                        <input type="text" inputMode="numeric" value={amountMax} onChange={(e) => setAmountMax(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Max" className="w-1/2 min-w-0 bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2 py-1.5 text-[11px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-all" />
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Status</div>
                      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-all appearance-none cursor-pointer">
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Payment</div>
                      <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-all appearance-none cursor-pointer">
                        <option value="">All</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </th>
                    <th className="px-3 py-3 text-center">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Actions</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedBookings.map((b, i) => {
                    const room = rooms.find((r) => r._id === b.roomId)
                    return (
                      <tr key={b._id} className="border-b border-[#23232f] last:border-b-0 hover:bg-[#0a0a0f]/50 transition-colors">
                        <td className="px-3 py-3">
                          <span className="text-[12px] font-mono font-semibold text-[#f5f5f7]">{getDisplayId(b._id)}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <img src={getRoomThumb(room)} alt="" className="w-8 h-8 rounded-[6px] object-cover shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[13px] font-medium text-[#f5f5f7] truncate">{room?.name || 'Room'}</div>
                              {room && <div className="text-[11px] text-[#6b6b7b]">{typeLabels[room.type]}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-[13px] text-[#f5f5f7] truncate">{(b as any).user?.name || 'Unknown'}</div>
                          <div className="text-[11px] text-[#6b6b7b] truncate">{(b as any).user?.phone || (b as any).user?.email || '—'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-[13px] text-[#f5f5f7] font-medium text-center block">{b.deviceCount}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-[13px] text-[#f5f5f7]">{formatDate(b.bookingDate)}</div>
                          <div className="text-[11px] text-[#6b6b7b]">{b.startTime} · {b.durationHours}h</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-[13px] font-bold text-[#f5f5f7] text-center block">${b.totalPrice}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusClass(b.status)}`}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              b.paymentStatus === 'paid' ? 'bg-[#2fd18f]/15 text-[#2fd18f]' :
                              b.paymentStatus === 'refunded' ? 'bg-[#f25c78]/15 text-[#f25c78]' :
                              'bg-[#6c8cf5]/15 text-[#6c8cf5]'
                            }`}>
                              {b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1)}
                            </span>
                            {b.paymentMethod === 'cash' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-[#f2a13c]/15 text-[#f2a13c]">Cash</span>
                            )}
                            {b.paymentMethod === 'card' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-[#6c8cf5]/15 text-[#6c8cf5]">Card</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {b.paymentStatus === 'unpaid' && b.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    message: `Approve cash payment for booking ${getDisplayId(b._id)}? This will mark the payment as paid and confirm the booking.`,
                                    onConfirm: () => handleApproveCash(b._id),
                                  })
                                }}
                                className="px-2 py-1 rounded-[6px] text-[10px] font-semibold text-[#2fd18f] bg-[#2fd18f]/10 hover:bg-[#2fd18f]/20 transition-all cursor-pointer border-none whitespace-nowrap"
                              >
                                Approve
                              </button>
                            )}
                            {b.paymentStatus === 'paid' && b.paymentMethod === 'card' && (
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    message: `Refund booking ${getDisplayId(b._id)}? This will cancel the booking and refund the card payment.`,
                                    onConfirm: () => handleRefund(b._id),
                                  })
                                }}
                                className="px-2 py-1 rounded-[6px] text-[11px] font-semibold text-[#f25c78] bg-[#f25c78]/10 hover:bg-[#f25c78]/20 transition-all cursor-pointer border-none"
                              >
                                Refund
                              </button>
                            )}
                            <button
                              onClick={() => setDetailModal({
                                open: true,
                                title: `Booking Code ${getDisplayId(b._id)}`,
                                details: [
                                  { label: 'Room', value: room?.name || 'N/A' },
                                  { label: 'Customer', value: (b as any).user?.name || 'Unknown' },
                                  { label: 'Email', value: (b as any).user?.email || '—' },
                                  { label: 'Phone', value: (b as any).user?.phone || '—' },
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
                                    value: b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1) + (b.paymentMethod === 'cash' ? ' (Cash)' : ''),
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

            {/* Desktop pagination */}
            <div className="hidden md:flex items-center justify-between px-5 py-3 border-t border-[#23232f]">
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-[#6b6b7b]">Showing {filteredBookings.length > 0 ? bookingPage * BOOKINGS_PER_PAGE + 1 : 0}–{Math.min((bookingPage + 1) * BOOKINGS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length}</span>
                <button
                  onClick={() => handleDownloadBookingsReport(bookings, rooms)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-semibold text-[#9a9aab] border border-[#23232f] bg-[#0a0a0f] hover:text-[#f5f5f7] hover:border-[#7c6cf2]/40 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Report
                </button>
              </div>
              {bookingTotalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setBookingPage((p) => Math.max(0, p - 1))} disabled={bookingPage === 0} className="px-3 py-1.5 rounded-[6px] text-[13px] font-medium text-[#9a9aab] bg-[#0a0a0f] border border-[#23232f] hover:text-[#f5f5f7] hover:border-[#7c6cf2]/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Prev</button>
                  {Array.from({ length: bookingTotalPages }, (_, i) => (
                    <button key={i} onClick={() => setBookingPage(i)} className={`w-8 h-8 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer border ${bookingPage === i ? 'bg-[#7c6cf2] text-white border-[#7c6cf2]' : 'text-[#9a9aab] bg-[#0a0a0f] border-[#23232f] hover:text-[#f5f5f7] hover:border-[#7c6cf2]/40'}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setBookingPage((p) => Math.min(bookingTotalPages - 1, p + 1))} disabled={bookingPage >= bookingTotalPages - 1} className="px-3 py-1.5 rounded-[6px] text-[13px] font-medium text-[#9a9aab] bg-[#0a0a0f] border border-[#23232f] hover:text-[#f5f5f7] hover:border-[#7c6cf2]/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Next</button>
                </div>
              )}
            </div>

            {/* Mobile filters */}
            <div className="block md:hidden px-4 py-3 border-b border-[#23232f] space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ID or code..." className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-colors" />
                <input type="text" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Customer..." className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-colors" />
              </div>
              <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
                <div className="flex gap-2 min-w-max">
                  <select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} className="bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer">
                    <option value="">All rooms</option>
                    {rooms.map((r) => <option key={r._id} value={r.name}>{r.name}</option>)}
                  </select>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer">
                    <option value="">Status</option>
                    {['confirmed','pending','cancelled','completed'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}

                  </select>
                  <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer">
                    <option value="">Payment</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors [color-scheme:dark]" />
                <span className="text-[#6b6b7b] text-[13px] self-center">to</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors [color-scheme:dark]" />
              </div>
              <div className="flex gap-2">
                <input type="text" inputMode="numeric" value={amountMin} onChange={(e) => setAmountMin(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Min amount..." className="flex-1 bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-colors" />
                <input type="text" inputMode="numeric" value={amountMax} onChange={(e) => setAmountMax(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Max amount..." className="flex-1 bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-colors" />
              </div>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden divide-y divide-[#23232f]">
              {pagedBookings.map((b, i) => {
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
                        {b.paymentStatus === 'paid' && b.paymentMethod === 'card' && (
                          <button
                            onClick={() => {
                              setConfirmModal({
                                message: `Refund booking ${getDisplayId(b._id)}? This will cancel the booking and refund the card payment.`,
                                onConfirm: () => handleRefund(b._id),
                              })
                            }}
                            className="px-2 py-1 rounded-[6px] text-[11px] font-semibold text-[#f25c78] bg-[#f25c78]/10 hover:bg-[#f25c78]/20 transition-all cursor-pointer border-none"
                          >
                            Refund
                          </button>
                        )}
                        <button
                          onClick={() => setDetailModal({
                            open: true,
                            title: `Booking Code ${getDisplayId(b._id)}`,
                            details: [
                              { label: 'Room', value: room?.name || 'N/A' },
                              { label: 'Customer', value: (b as any).user?.name || 'Unknown' },
                              { label: 'Email', value: (b as any).user?.email || '—' },
                              { label: 'Phone', value: (b as any).user?.phone || '—' },
                              { label: 'Devices', value: `${b.deviceCount}` },
                              { label: 'Date', value: formatDate(b.bookingDate) },
                              { label: 'Time', value: b.startTime },
                              { label: 'Duration', value: `${b.durationHours}h` },
                              { label: 'Amount', value: `$${b.totalPrice}` },
                              { label: 'Status', value: b.status.charAt(0).toUpperCase() + b.status.slice(1), color: b.status === 'confirmed' ? '#2fd18f' : b.status === 'pending' ? '#6c8cf5' : b.status === 'cancelled' ? '#f25c78' : '#9a9aab' },
                              { label: 'Payment', value: b.paymentStatus.charAt(0).toUpperCase() + b.paymentStatus.slice(1) + (b.paymentMethod === 'cash' ? ' (Cash)' : ''), color: payColor },
                            ],
                          })}
                          className="p-1.5 rounded-[6px] text-[#9a9aab] hover:text-[#f5f5f7] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ message: `Are you sure you want to delete booking ${getDisplayId(b._id)}? This action cannot be undone.`, onConfirm: () => { setDeletedBookingIds((prev) => [...prev, b._id]); setConfirmModal(null) } })}
                          className="p-1.5 rounded-[6px] text-[#f25c78]/60 hover:text-[#f25c78] hover:bg-[#f25c78]/10 transition-all cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <img src={getRoomThumb(room)} alt="" className="w-8 h-8 rounded-[6px] object-cover shrink-0" />
                      <div>
                        <div className="text-[14px] font-medium text-[#f5f5f7]">{room?.name || 'Room'}</div>
                        {room && <div className="text-[12px] text-[#6b6b7b]">{typeLabels[room.type]}</div>}
                      </div>
                    </div>
                    <div className="text-[13px] text-[#f5f5f7]">{(b as any).user?.name || 'Unknown'}</div>
                    {(b as any).user?.phone || (b as any).user?.email ? (
                      <div className="flex items-center gap-2 text-[12px] text-[#6b6b7b]">
                        {(b as any).user?.phone && <span className="font-mono">{(b as any).user?.phone}</span>}
                        {(b as any).user?.phone && (b as any).user?.email && <span className="text-[#23232f]">|</span>}
                        {(b as any).user?.email && <span>{(b as any).user?.email}</span>}
                      </div>
                    ) : null}
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
                      {b.paymentMethod === 'cash' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#f2a13c]/15 text-[#f2a13c]">Cash</span>
                      )}
                      {b.paymentMethod === 'card' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#6c8cf5]/15 text-[#6c8cf5]">Card</span>
                      )}
                      <span className="text-[#6b6b7b] text-[12px]">{b.deviceCount} device{b.deviceCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile pagination */}
            {bookingTotalPages > 1 && (
              <div className="block md:hidden px-4 py-3 border-t border-[#23232f]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[#6b6b7b]">{bookingPage * BOOKINGS_PER_PAGE + 1}–{Math.min((bookingPage + 1) * BOOKINGS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <button onClick={() => setBookingPage((p) => Math.max(0, p - 1))} disabled={bookingPage === 0} className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#9a9aab] bg-[#0a0a0f] border border-[#23232f] hover:text-[#f5f5f7] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Prev</button>
                  {Array.from({ length: bookingTotalPages }, (_, i) => (
                    <button key={i} onClick={() => setBookingPage(i)} className={`w-7 h-7 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer border ${bookingPage === i ? 'bg-[#7c6cf2] text-white border-[#7c6cf2]' : 'text-[#9a9aab] bg-[#0a0a0f] border-[#23232f] hover:text-[#f5f5f7]'}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setBookingPage((p) => Math.min(bookingTotalPages - 1, p + 1))} disabled={bookingPage >= bookingTotalPages - 1} className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#9a9aab] bg-[#0a0a0f] border border-[#23232f] hover:text-[#f5f5f7] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Next</button>
                </div>
              </div>
            )}
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
                      <span className={`absolute top-3 left-3 text-[11px] px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 ${room.status === 'active' ? 'bg-[#2fd18f]/80 text-white' : room.status === 'maintenance' ? 'bg-[#f2a13c]/80 text-white' : 'bg-[#f25c78]/80 text-white'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
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
              <button onClick={() => setShowAddDevice(true)} className="flex items-center gap-2 px-[16px] py-[9px] rounded-[10px] text-[13px] font-semibold text-white border-none cursor-pointer btn-primary-gradient glow-violet transition-all duration-200">
                <Plus className="w-4 h-4" />
                Add Device
              </button>
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
                    <th className="text-right px-5 py-4 text-[12px] font-semibold text-[#6b6b7b] uppercase tracking-wider">Actions</th>
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
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setEditingDevice(d)} className="p-1.5 rounded-[8px] text-[#6b6b7b] hover:text-[#7c6cf2] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmModal({ message: `Are you sure you want to delete device "${d.deviceLabel}"? This action cannot be undone.`, onConfirm: () => handleDeleteDevice(d._id) })} className="p-1.5 rounded-[8px] text-[#6b6b7b] hover:text-[#f25c78] hover:bg-[#23232f] transition-all cursor-pointer border-none bg-transparent">
                              <Trash2 className="w-4 h-4" />
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

            {showAddDevice && <AddDeviceModal rooms={rooms} onSave={handleAddDevice} onClose={() => setShowAddDevice(false)} />}
            {editingDevice && (
              <EditDeviceModal device={editingDevice} rooms={rooms} onSave={handleEditDevice} onClose={() => setEditingDevice(null)} />
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="bg-[#12121a] border border-[#23232f] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#23232f]">
              <h2 className="text-[18px] font-bold text-[#f5f5f7] m-0" style={{ fontFamily: 'var(--font-display)' }}>User Management</h2>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '24%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '8%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-[#23232f]">
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">User</div>
                      <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2 py-1 text-[11px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-all" />
                    </th>
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Role</div>
                      <select value={roleFilter || ''} onChange={(e) => setRoleFilter(e.target.value || '')} className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2 py-1 text-[11px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-all appearance-none cursor-pointer">
                        <option value="">All</option>
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                      </select>
                    </th>
                    <th className="px-3 py-3 text-center">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Bookings</div>
                    </th>
                    <th className="px-3 py-3 text-center">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Spent</div>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Status</div>
                      <select value={verifiedFilter || ''} onChange={(e) => setVerifiedFilter(e.target.value || '')} className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-2 py-1 text-[11px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-all appearance-none cursor-pointer">
                        <option value="">All</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                      </select>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Joined</div>
                    </th>
                    <th className="px-3 py-3 text-center">
                      <div className="text-[11px] font-semibold text-[#6b6b7b] uppercase tracking-wider mb-1.5">Actions</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((u) => {
                      const initial = u.name.charAt(0).toUpperCase()
                      return (
                        <tr key={u._id} className="border-b border-[#23232f] last:border-b-0 hover:bg-[#0a0a0f]/50 transition-colors">
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ background: '#23232f', color: '#9a9aab' }}>
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[13px] font-medium text-[#f5f5f7] truncate">{u.name}</div>
                                <div className="text-[11px] text-[#6b6b7b] truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              u.role === 'admin' ? 'bg-[#7c6cf2]/15 text-[#7c6cf2]' : 'bg-[#6b6b7b]/15 text-[#9a9aab]'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[13px] text-center block text-[#f5f5f7] font-medium">{u.bookings}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[13px] font-bold text-[#f5f5f7] text-center block">${u.totalSpent}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              u.isVerified ? 'bg-[#2fd18f]/15 text-[#2fd18f]' : 'bg-[#f2a13c]/15 text-[#f2a13c]'
                            }`}>
                              {u.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[12px] text-[#6b6b7b]">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setDetailModal({
                                  open: true,
                                  title: u.name,
                                  details: [
                                    { label: 'Email', value: u.email },
                                    { label: 'Phone', value: u.phone || '—' },
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
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>

            {/* Desktop pagination */}
            <div className="hidden md:flex items-center justify-between px-5 py-3 border-t border-[#23232f]">
              <span className="text-[13px] text-[#6b6b7b]">Showing {filteredUsers.length > 0 ? userPage * USERS_PER_PAGE + 1 : 0}–{Math.min((userPage + 1) * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users</span>
              {userTotalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setUserPage((p) => Math.max(0, p - 1))} disabled={userPage === 0} className="px-3 py-1.5 rounded-[6px] text-[13px] font-medium text-[#9a9aab] bg-[#0a0a0f] border border-[#23232f] hover:text-[#f5f5f7] hover:border-[#7c6cf2]/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Prev</button>
                  {Array.from({ length: userTotalPages }, (_, i) => (
                    <button key={i} onClick={() => setUserPage(i)} className={`w-8 h-8 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer border ${userPage === i ? 'bg-[#7c6cf2] text-white border-[#7c6cf2]' : 'text-[#9a9aab] bg-[#0a0a0f] border-[#23232f] hover:text-[#f5f5f7] hover:border-[#7c6cf2]/40'}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setUserPage((p) => Math.min(userTotalPages - 1, p + 1))} disabled={userPage >= userTotalPages - 1} className="px-3 py-1.5 rounded-[6px] text-[13px] font-medium text-[#9a9aab] bg-[#0a0a0f] border border-[#23232f] hover:text-[#f5f5f7] hover:border-[#7c6cf2]/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Next</button>
                </div>
              )}
            </div>

            {/* Mobile filters */}
            <div className="block md:hidden px-4 py-3 border-b border-[#23232f] space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b7b]" />
                <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Name or email..." className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] pl-9 pr-3 py-2 text-[13px] text-[#f5f5f7] placeholder:text-[#6b6b7b] focus:outline-none focus:border-[#7c6cf2] transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={roleFilter || ''} onChange={(e) => setRoleFilter(e.target.value || '')} className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer">
                  <option value="">All roles</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
                <select value={verifiedFilter || ''} onChange={(e) => setVerifiedFilter(e.target.value || '')} className="w-full bg-[#0a0a0f] border border-[#23232f] rounded-[6px] px-3 py-2 text-[13px] text-[#f5f5f7] focus:outline-none focus:border-[#7c6cf2] transition-colors appearance-none cursor-pointer">
                  <option value="">All status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden divide-y divide-[#23232f]">
              {pagedUsers.map((u) => {
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
                          {u.phone && <div className="text-[12px] text-[#6b6b7b] font-mono">{u.phone}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailModal({
                            open: true,
                            title: u.name,
                            details: [
                              { label: 'Email', value: u.email },
                              { label: 'Phone', value: u.phone || '—' },
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

            {/* Mobile pagination */}
            {userTotalPages > 1 && (
              <div className="block md:hidden px-4 py-3 border-t border-[#23232f]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[#6b6b7b]">{userPage * USERS_PER_PAGE + 1}–{Math.min((userPage + 1) * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <button onClick={() => setUserPage((p) => Math.max(0, p - 1))} disabled={userPage === 0} className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#9a9aab] bg-[#0a0a0f] border border-[#23232f] hover:text-[#f5f5f7] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Prev</button>
                  {Array.from({ length: userTotalPages }, (_, i) => (
                    <button key={i} onClick={() => setUserPage(i)} className={`w-7 h-7 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer border ${userPage === i ? 'bg-[#7c6cf2] text-white border-[#7c6cf2]' : 'text-[#9a9aab] bg-[#0a0a0f] border-[#23232f] hover:text-[#f5f5f7]'}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setUserPage((p) => Math.min(userTotalPages - 1, p + 1))} disabled={userPage >= userTotalPages - 1} className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#9a9aab] bg-[#0a0a0f] border border-[#23232f] hover:text-[#f5f5f7] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Next</button>
                </div>
              </div>
            )}

            <div className="px-5 py-3 border-t border-[#23232f] flex items-center gap-5">
              <span className="text-[13px] text-[#6b6b7b]">{filteredUsers.filter((u) => u.role === 'admin').length} admin</span>
              <span className="text-[13px] text-[#6b6b7b]">{filteredUsers.filter((u) => u.isVerified).length} verified</span>
            </div>
          </div>
        )}
      </div>
      {showAddRoom && <AddRoomModal onSave={handleAddRoom} onClose={() => setShowAddRoom(false)} />}
      {showAddReservation && <AddReservationModal rooms={rooms} devices={devices} users={users} onSave={handleAddReservation} onSuccess={() => { setFeedback({ type: 'success', message: 'Reservation created and payment successful' }); setShowAddReservation(false); fetchData() }} onClose={() => setShowAddReservation(false)} />}
      {confirmModal && <ConfirmModal title="Confirm" message={confirmModal.message} confirmText="Confirm" onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
      {editingRoom && <RoomEditModal room={editingRoom} onSave={handleEditRoom} onClose={() => setEditingRoom(null)} />}
      <DetailModal open={detailModal.open} onClose={() => setDetailModal({ open: false, title: '', details: [] })} title={detailModal.title} details={detailModal.details} />
    </div>
  )
}

function handleDownloadBookingsReport(bookings: Booking[], rooms: Room[]) {
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
  const totalCount = bookings.length
  const revenue = bookings
    .filter((b) => b.status === 'completed' || b.paymentStatus === 'paid')
    .reduce((s, b) => s + b.totalPrice, 0)
  const pendingCountReport = bookings.filter((b) => b.status === 'pending').length
  const completedCountReport = bookings.filter((b) => b.status === 'completed').length

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
    body: bookings.map((b) => {
      const room = rooms.find((r) => r._id === b.roomId)
      return [
        getDisplayId(b._id),
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
