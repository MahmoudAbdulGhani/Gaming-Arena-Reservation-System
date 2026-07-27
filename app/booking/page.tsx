'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import BookingStepRoom from '@/components/booking/step-room'
import BookingStepDevices from '@/components/booking/step-devices'
import BookingStepDateTime from '@/components/booking/step-datetime'
import BookingStepConfirm from '@/components/booking/step-confirm'
import BookingConfirmation from '@/components/booking/confirmation'
import StripeProvider from '@/components/stripe-provider'
import { CheckCircle2 } from 'lucide-react'
import type { Room, Device } from '@/lib/types'

const steps = [
  { number: 1, label: 'Choose Room' },
  { number: 2, label: 'Date & Time' },
  { number: 3, label: 'Select Devices' },
  { number: 4, label: 'Confirm & Pay' },
]

export interface BookingData {
  room: Room | null
  devices: Device[]
  date: string
  startTime: string
  durationHours: number
  totalPrice: number
  paymentMethod: 'card' | 'cash'
}

function BookingContent() {
  const searchParams = useSearchParams()
  const preselectedRoom = searchParams.get('room')

  const [rooms, setRooms] = useState<Room[]>([])
  useEffect(() => { fetch('/api/rooms').then(r => r.json()).then(setRooms) }, [])

  const matchedRoom = useMemo(() => preselectedRoom ? rooms.find(r => r._id === preselectedRoom) ?? null : null, [preselectedRoom, rooms])

  const [currentStep, setCurrentStep] = useState(matchedRoom ? 2 : 1)
  const [isCompleted, setIsCompleted] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData>({
    room: matchedRoom,
    devices: [],
    date: '',
    startTime: '',
    durationHours: 1,
    totalPrice: 0,
    paymentMethod: 'card',
  })

  const handleStepComplete = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
    setCurrentStep((prev) => prev + 1)
  }

  const handleBookingComplete = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
    setIsCompleted(true)
  }

  if (isCompleted) {
    return <BookingConfirmation bookingData={bookingData} />
  }

  return (
    <>
      {/* Stepper */}
      <div className="bg-[#131824] border-b border-[#262D3D] py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Booking progress">
            <ol className="flex items-center justify-between relative">
              {/* Background line */}
              <div
                className="absolute left-0 right-0 top-5 h-px bg-[#262D3D] mx-6 sm:mx-10"
                aria-hidden="true"
              />
              {/* Progress line */}
              <div
                className="absolute left-0 top-5 h-px bg-[#7C5CFF] mx-6 sm:mx-10 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * (100 - 8)}%` }}
                aria-hidden="true"
              />

              {steps.map(({ number, label }) => {
                const isActive = number === currentStep
                const isDone = number < currentStep

                return (
                  <li key={number} className="flex flex-col items-center gap-2 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isDone
                          ? 'bg-[#7C5CFF] text-white'
                          : isActive
                          ? 'bg-[#7C5CFF] text-white glow-violet-sm'
                          : 'bg-[#1B2130] text-[#9BA3B7] border-2 border-[#262D3D]'
                      }`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        number
                      )}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-[#F5F6FA]' : 'text-[#9BA3B7]'}`}>
                      {label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {currentStep === 1 && (
          <BookingStepRoom
            preselectedId={preselectedRoom}
            onComplete={(room) => handleStepComplete({ room, devices: [] })}
          />
        )}
        {currentStep === 2 && (
          <BookingStepDateTime
            bookingData={bookingData}
            onComplete={(data) => handleStepComplete(data)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <BookingStepDevices
            bookingData={bookingData}
            onComplete={(data) => handleStepComplete(data)}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <StripeProvider>
            <BookingStepConfirm
              bookingData={bookingData}
              onComplete={handleBookingComplete}
              onBack={() => setCurrentStep(3)}
            />
          </StripeProvider>
        )}
        
      </div>
    </>
  )
}

export default function BookingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0B0E14] pt-16">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-40">
              <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
            </div>
          }
        >
          <BookingContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
