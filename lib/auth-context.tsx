'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ requiresOtp?: boolean; verifyToken?: string; role?: string }>
  register: (name: string, email: string, password: string) => Promise<{ email: string }>
  verifyOtp: (token: string, otp: string) => Promise<string>
  resendOtp: (token: string) => Promise<string>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('gz_token')
}

function storeToken(token: string) {
  localStorage.setItem('gz_token', token)
}

function clearToken() {
  localStorage.removeItem('gz_token')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        clearToken()
      }
    } catch {
      clearToken()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    if (data.requiresOtp) return { requiresOtp: true, verifyToken: data.verifyToken }
    storeToken(data.token)
    setUser(data.user)
    return { role: data.user.role }
  }

  async function register(name: string, email: string, password: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return { email: data.email }
  }

  async function verifyOtp(token: string, otp: string) {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, otp }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    storeToken(data.token)
    setUser(data.user)
    return data.user.role
  }

  async function resendOtp(token: string) {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.verifyToken
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
