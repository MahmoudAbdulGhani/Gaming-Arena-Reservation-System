'use client'


import Link from "next/link";
import { Plus } from "lucide-react";
// import type {User} from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

// interface DashboardHeaderProps {
//   user: User
// }

// export default function DashboardHeader({ user }: DashboardHeaderProps) {
//   const initial = user.name.charAt(0).toUpperCase()
//    return (
//     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
//       <div className="flex items-center gap-4">
//         <div className="w-14 h-14 rounded-full bg-[#7C5CFF] flex items-center justify-center text-white text-xl font-bold shrink-0">
//           {initial}
//         </div>
//         <div>
//           <h1 className="text-2xl font-bold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
//             Welcome back, {user.name.split(' ')[0]}
//           </h1>
//           <p className="text-sm text-[#9BA3B7]">{user.email}</p>
//         </div>
//       </div>

//       <Link
//         href="/booking"
//         className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white btn-primary-gradient transition-all duration-200 w-fit"
//       >
//         <Plus className="w-4 h-4" aria-hidden="true" />
//         New Booking
//       </Link>
//     </div>
//   )
// }

export default function DashboardHeader() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="h-14 mb-8 rounded-xl bg-[#1B2130] animate-pulse" />
  }

  if (!user) return null

  const initial = user.name.charAt(0).toUpperCase()
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#7C5CFF] flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initial}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#F5F6FA]" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-[#9BA3B7]">{user.email}</p>
        </div>
      </div>

      <Link
        href="/booking"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white btn-primary-gradient transition-all duration-200 w-fit"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        New Booking
      </Link>
    </div>
  )
}
