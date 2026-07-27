import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import StationCard from '@/components/room-card'
import { getDb } from '@/lib/mongodb'

export default async function FeaturedRooms() {
  const db = await getDb()
  const docs = await db.collection('rooms').find().sort({ createdAt: -1 }).limit(4).toArray()
  const featured = docs.map((r) => ({
    _id: r._id.toString(),
    name: r.name,
    type: r.type,
    description: r.description ?? '',
    images: r.images ?? [],
    pricePerHour: r.pricePerHour,
    totalDevices: r.totalDevices,
    status: r.status,
    createdAt: r.createdAt?.toISOString() ?? '',
    updatedAt: r.updatedAt?.toISOString() ?? '',
  }))

  return (
    <section className="py-24 bg-[#0B0E14]" aria-labelledby="featured-rooms-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#7C5CFF] bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 mb-4 uppercase tracking-wider">
              Featured
            </span>
            <h2
              id="featured-rooms-heading"
              className="text-3xl sm:text-4xl font-bold text-[#F5F6FA] text-balance"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Top Gaming Rooms
            </h2>
          </div>
          <Link
            href="/rooms"
            className="flex items-center gap-2 text-sm font-medium text-[#7C5CFF] hover:text-[#9B7FFF] transition-colors duration-200 shrink-0"
          >
            View all rooms
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((room) => (
            <StationCard key={room._id} room={room} />
          ))}
        </div>
      </div>
    </section>
  )
}
