import Image from "next/image";
import { Calendar, Clock, DollarSign, Monitor, Gamepad2, Glasses, Users } from "lucide-react";
import type { Booking, BookingStatus, RoomType } from "@/lib/types";
import { checkBookingPolicy } from '@/lib/booking-policy'



// Room type -> small icon + label shown under the room name.
const typeLabels: Record<RoomType, string> = {
  pc: "PC",
  console: "Console",
  vr: "VR",
  private: "Private Room",
};

const typeIcons: Record<RoomType, React.ReactNode> = {
  pc: <Monitor className="w-3.5 h-3.5" />,
  console: <Gamepad2 className="w-3.5 h-3.5" />,
  vr: <Glasses className="w-3.5 h-3.5" />,
  private: <Users className="w-3.5 h-3.5" />,
};

// Booking status -> pill color + dot color, shown top-right of the card.
const statusConfig: Record<BookingStatus, { label: string; dot: string; pill: string }> = {
  pending: {
    label: "Pending",
    dot: "bg-[#FF9F5C]",
    pill: "text-[#FF9F5C] bg-[#FF9F5C]/10 border-[#FF9F5C]/20",
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-[#33E6A0]",
    pill: "text-[#33E6A0] bg-[#33E6A0]/10 border-[#33E6A0]/20",
  },
  completed: {
    label: "Completed",
    dot: "bg-[#9BA3B7]",
    pill: "text-[#9BA3B7] bg-[#9BA3B7]/10 border-[#9BA3B7]/20",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-[#FF5C7A]",
    pill: "text-[#FF5C7A] bg-[#FF5C7A]/10 border-[#FF5C7A]/20",
  },
};

interface BookingCardProps {
  booking: Booking;
   onModify?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
}

export default function BookingCard({ booking, onModify, onCancel }: BookingCardProps) {
  const room = booking.room;
  const status = statusConfig[booking.status] ?? statusConfig.pending;

  // Modify/Cancel only make sense while a booking hasn't happened yet.
  const canManage = booking.status === "pending" || booking.status === "confirmed";
  const modifyPolicy = checkBookingPolicy(booking, 'modify')
  const cancelPolicy = checkBookingPolicy(booking, 'cancel')

  // bookingDate is a plain "YYYY-MM-DD" string. Appending a time keeps
  // Date() parsing it in local time instead of UTC, which avoids the
  // date shifting back a day in negative-UTC timezones.
  const formattedDate = new Date(`${booking.bookingDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative bg-[#131824] border border-[#262D3D] rounded-2xl p-5 card-hover">
      {/* Status badge, top-right */}
      <span
        className={`absolute top-5 right-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.pill}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
        {status.label}
      </span>

      <div className="flex gap-4 pr-28">
        {/* Room thumbnail */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-[#1B2130]">
          <Image
            src={room?.images[0] || "/images/room-pc.png"}
            alt={room?.name ?? "Room"}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>

        <div>
          <p className="font-semibold text-lg text-[#F5F6FA]">{room?.name ?? "Room"}</p>

          {room && (
            <span className="inline-flex items-center gap-1.5 text-sm text-[#7C5CFF] mt-1">
              {typeIcons[room.type]}
              {typeLabels[room.type]}
            </span>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-[#9BA3B7]">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {booking.startTime} · {booking.durationHours}h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" aria-hidden="true" />${booking.totalPrice}
            </span>
          </div>

          {/* Modify / Cancel — indented under the info column (not the
              thumbnail), and only shown for bookings still ahead of us */}
          {canManage && (
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                disabled={!modifyPolicy.allowed}
                title={modifyPolicy.allowed ? undefined : modifyPolicy.reason}
                onClick={() => onModify?.(booking)}
                className="px-5 py-2 rounded-lg text-sm font-medium text-[#F5F6FA] border border-[#262D3D] hover:bg-[#1B2130] transition-colors duration-200"
              >
                Modify
              </button>
              <button
                type="button"
                disabled={!cancelPolicy.allowed}
                title={cancelPolicy.allowed ? undefined : cancelPolicy.reason}
                onClick={() => onCancel?.(booking)}    
                className="px-5 py-2 rounded-lg text-sm font-medium text-[#FF5C7A] border border-[#FF5C7A]/40 hover:bg-[#FF5C7A]/10 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
