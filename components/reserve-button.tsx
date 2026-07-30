'use client'

import { Zap } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface Props {
  roomId: string
  canBook: boolean
}

export default function ReserveButton({ roomId, canBook }: Props) {
  const router = useRouter()
  const { user, loading } = useAuth()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    if (loading) return
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/booking?room=${roomId}`)}`)
    } else {
      router.push(`/booking?room=${roomId}`)
    }
  }

  if (canBook) {
    return (
      <a
        href={`/booking?room=${roomId}`}
        onClick={handleClick}
        className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl text-base font-bold text-white btn-primary-gradient glow-violet transition-all duration-200 min-h-[52px]"
      >
        <Zap className="w-5 h-5" aria-hidden="true" />
        Reserve Devices in This Room
      </a>
    )
  }

  return (
    <button
      disabled
      className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl text-base font-semibold text-[#9BA3B7] bg-[#1B2130] border border-[#262D3D] cursor-not-allowed opacity-60 min-h-[52px]"
      aria-disabled="true"
    >
      No Devices Available
    </button>
  )
}
