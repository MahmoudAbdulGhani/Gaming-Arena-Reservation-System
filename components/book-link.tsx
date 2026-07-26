'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { ReactNode } from 'react'

interface BookLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export default function BookLink({ href, children, className }: BookLinkProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    if (loading) return
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(href)}`)
    } else {
      router.push(href)
    }
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
