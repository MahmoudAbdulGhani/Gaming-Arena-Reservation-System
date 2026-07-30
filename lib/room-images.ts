import type { RoomType } from '@/lib/models'

export const roomTypeImages: Record<RoomType, string> = {
  pc: '/images/room-pc.png',
  console: '/images/room-console.png',
  vr: '/images/room-vr.png',
  private: '/images/room-private.png',
}

export function normalizePublicImagePath(rawPath?: string | null): string | undefined {
  if (!rawPath) return undefined

  const trimmed = rawPath.trim()
  if (!trimmed) return undefined
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed

  const normalized = trimmed.replace(/\\/g, '/')
  const lower = normalized.toLowerCase()

  const slashImagesIndex = lower.indexOf('/images/')
  if (slashImagesIndex >= 0) {
    return normalized.slice(slashImagesIndex)
  }

  const noLeadingSlash = normalized.replace(/^\/+/, '')
  const noLeadingSlashLower = noLeadingSlash.toLowerCase()

  if (noLeadingSlashLower.startsWith('public/')) {
    return `/${noLeadingSlash.slice('public/'.length)}`
  }

  if (noLeadingSlashLower.startsWith('images/')) {
    return `/${noLeadingSlash}`
  }

  if (noLeadingSlash.includes('/')) {
    return `/${noLeadingSlash}`
  }

  return `/images/${noLeadingSlash}`
}

export function getRoomPrimaryImage(room?: { images?: string[]; type?: string }): string {
  const fromImages = room?.images?.map(normalizePublicImagePath).find(Boolean)
  if (fromImages) return fromImages

  if (room?.type && room.type in roomTypeImages) {
    return roomTypeImages[room.type as RoomType]
  }

  return roomTypeImages.pc
}
