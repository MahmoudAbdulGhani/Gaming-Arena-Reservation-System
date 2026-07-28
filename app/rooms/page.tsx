'use client'

import { useState, useMemo, useEffect } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import RoomCard from '@/components/room-card'
import type { Room, Device, RoomType, RoomAvailability } from '@/lib/types'
import { Search, SlidersHorizontal, Monitor, Gamepad2, Glasses, Users, LayoutGrid, List } from 'lucide-react'

const roomTypes: { label: string; value: RoomType | 'All'; icon: React.ReactNode }[] = [
  { label: 'All', value: 'All', icon: <LayoutGrid className="w-4 h-4" /> },
  { label: 'PC', value: 'pc', icon: <Monitor className="w-4 h-4" /> },
  { label: 'Console', value: 'console', icon: <Gamepad2 className="w-4 h-4" /> },
  { label: 'VR', value: 'vr', icon: <Glasses className="w-4 h-4" /> },
  { label: 'Private Room', value: 'private', icon: <Users className="w-4 h-4" /> },
]

function getRoomAvailabilityFromDevices(room: Room, devices: Device[]): RoomAvailability {
  if (room.status === 'inactive') return 'inactive'
  if (room.status === 'maintenance') return 'maintenance'
  if (devices.length === 1) {
    if (devices[0].status === 'maintenance') return 'maintenance'
    return devices[0].status === 'available' ? 'available' : 'booked'
  }
  return devices.filter((d) => d.status === 'available').length > 0 ? 'available' : 'booked'
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [devicesMap, setDevicesMap] = useState<Record<string, Device[]>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<RoomType | 'All'>('All')
  const [selectedStatus, setSelectedStatus] = useState<RoomAvailability | 'All'>('All')
  const [maxPrice, setMaxPrice] = useState(100)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name')

  useEffect(() => {
    fetch('/api/rooms')
      .then((r) => r.json())
      .then(async (roomsData: Room[]) => {
        setRooms(roomsData)
        const map: Record<string, Device[]> = {}
        await Promise.all(
          roomsData.map(async (room) => {
            const res = await fetch(`/api/rooms/${room._id}/devices`)
            map[room._id] = await res.json()
          })
        )
        setDevicesMap(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const totalAvailableDevices = useMemo(
    () => Object.values(devicesMap).flat().filter((d) => d.status === 'available').length,
    [devicesMap]
  )

  const filtered = useMemo(() => {
    let result = [...rooms]

    if (searchQuery)
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    if (selectedType !== 'All') result = result.filter((r) => r.type === selectedType)
    if (selectedStatus !== 'All') {
      result = result.filter((r) => {
        const roomDevices = devicesMap[r._id] ?? []
        return getRoomAvailabilityFromDevices(r, roomDevices) === selectedStatus
      })
    }
    result = result.filter((r) => r.pricePerHour <= maxPrice)

    if (sortBy === 'price-asc') result.sort((a, b) => a.pricePerHour - b.pricePerHour)
    else if (sortBy === 'price-desc') result.sort((a, b) => b.pricePerHour - a.pricePerHour)
    else result.sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [searchQuery, selectedType, selectedStatus, maxPrice, sortBy, rooms, devicesMap])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0B0E14] pt-20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0B0E14] pt-20">
        <div className="bg-[#131824] border-b border-[#262D3D] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#7C5CFF] bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 mb-3 uppercase tracking-wider">
              Browse
            </span>
            <h1
              className="text-3xl sm:text-4xl font-bold text-[#F5F6FA] mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Gaming Rooms
            </h1>
            <p className="text-[#9BA3B7]">
              {filtered.length} room{filtered.length !== 1 ? 's' : ''} &mdash;{' '}
              <span className="text-[#33E6A0] font-medium">{totalAvailableDevices} devices available</span>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA3B7]" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131824] border border-[#262D3D] text-[#F5F6FA] placeholder-[#9BA3B7] focus:outline-none focus:border-[#7C5CFF]/60 text-sm transition-colors min-h-[44px]"
                  aria-label="Search gaming rooms"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <SlidersHorizontal className="w-4 h-4 text-[#9BA3B7]" aria-hidden="true" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2.5 rounded-xl bg-[#131824] border border-[#262D3D] text-[#F5F6FA] text-sm focus:outline-none focus:border-[#7C5CFF]/60 transition-colors min-h-[44px] cursor-pointer"
                  aria-label="Sort rooms"
                >
                  <option value="name">Sort: Name</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
                  className="px-3 py-2.5 rounded-xl bg-[#131824] border border-[#262D3D] text-[#F5F6FA] text-sm focus:outline-none focus:border-[#7C5CFF]/60 transition-colors min-h-[44px] cursor-pointer"
                  aria-label="Filter by status"
                >
                  <option value="All">All Status</option>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                </select>

                <div className="flex rounded-xl border border-[#262D3D] overflow-hidden" role="group" aria-label="View mode">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors duration-200 ${viewMode === 'grid' ? 'bg-[#7C5CFF] text-white' : 'bg-[#131824] text-[#9BA3B7] hover:text-[#F5F6FA]'
                      }`}
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors duration-200 ${viewMode === 'list' ? 'bg-[#7C5CFF] text-white' : 'bg-[#131824] text-[#9BA3B7] hover:text-[#F5F6FA]'
                      }`}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by room type">
              {roomTypes.map(({ label, value, icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedType(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${selectedType === value
                      ? 'bg-[#7C5CFF] text-white'
                      : 'bg-[#131824] text-[#9BA3B7] border border-[#262D3D] hover:border-[#7C5CFF]/40 hover:text-[#F5F6FA]'
                    }`}
                  aria-pressed={selectedType === value}
                >
                  {icon}
                  {label}
                </button>
              ))}

              <div className="flex items-center gap-3 ml-auto">
                <label className="text-sm text-[#9BA3B7] whitespace-nowrap">
                  Max:&nbsp;
                  <span className="text-[#F5F6FA] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                    ${maxPrice}/hr
                  </span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-32 accent-[#7C5CFF]"
                  aria-label="Maximum price per hour"
                />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl font-bold text-[#F5F6FA] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                No rooms found
              </p>
              <p className="text-[#9BA3B7]">Try adjusting your filters.</p>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {filtered.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  compact={viewMode === 'list'}
                  availableCount={devicesMap[room._id]?.filter((d) => d.status === 'available').length}
                  totalCount={devicesMap[room._id]?.length}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
