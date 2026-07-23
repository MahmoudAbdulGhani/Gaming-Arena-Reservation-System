// A small, reusable "stat tile" — the 4 boxes at the top of the
// dashboard Overview tab (Total Bookings, Upcoming, Completed, Total Spent).
//
// It doesn't know anything about bookings itself — it just renders
// whatever icon/value/label it's given. That's what makes it reusable:
// the same component draws all 4 different tiles, just with different props.

import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode // a lucide-react icon element, e.g. <Cpu className="w-5 h-5" />
  iconColorClass: string // tailwind classes for the icon circle's bg + text color
  value: string | number // the big number, e.g. 6 or "$268"
  label: string // the small caption under the number, e.g. "Total Bookings"
}

export default function StatCard({ icon, iconColorClass, value, label }: StatCardProps) {
  return (
    <div className="bg-[#131824] border border-[#262D3D] rounded-2xl p-6 card-hover flex items-center gap-4">
      {/* Icon square */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorClass}`}
      >
        {icon}
      </div>

      {/* Number + caption, stacked beside the icon */}
      <div>
        <p
          className="text-3xl font-bold text-[#F5F6FA] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {value}
        </p>
        <p className="text-sm text-[#9BA3B7]">{label}</p>
      </div>
    </div>
  )
}
