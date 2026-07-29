'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, Clock, X } from 'lucide-react'
import type { Notification } from '@/lib/types'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('gz_token') : null
  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!token) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchNotifications() {
    if (!token) return
    try {
      const res = await fetch('/api/notifications', {
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data : [])
      }
    } catch {}
  }

  async function markAsRead(id: string) {
    if (!token) return
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { authorization: `Bearer ${token}` },
      })
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
    } catch {}
  }

  async function markAllAsRead() {
    if (!token) return
    const unread = notifications.filter((n) => !n.read)
    await Promise.all(unread.map((n) => markAsRead(n._id)))
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="w-4 h-4 text-[#4C6FFF]" />
      case 'confirmation': return <CheckCheck className="w-4 h-4 text-[#2fd18f]" />
      default: return <Bell className="w-4 h-4 text-[#f2a13c]" />
    }
  }

  if (!token) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-[#9BA3B7] hover:text-[#F5F6FA] hover:bg-[#1B2130] transition-all duration-200 cursor-pointer border-none bg-transparent"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#FF5C7A] text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#12121a] border border-[#23232f] rounded-[14px] shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#23232f]">
            <h4 className="text-[14px] font-semibold text-[#f5f5f7] m-0">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-[#7c6cf2] hover:text-[#8b7aff] transition-all cursor-pointer border-none bg-transparent"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-[13px] text-[#6b6b7b] text-center py-8">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.read && markAsRead(n._id)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#23232f] last:border-b-0 transition-colors cursor-pointer ${
                    n.read ? 'opacity-60' : 'hover:bg-[#1B2130]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#f5f5f7] truncate">{n.title}</p>
                    <p className="text-[12px] text-[#6b6b7b] mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-[#4a4a5a] mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#7C5CFF] shrink-0 mt-1.5" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}