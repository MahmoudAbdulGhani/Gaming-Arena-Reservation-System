export interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  rating: number
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Alex Chen',
    role: 'Pro Gamer',
    content: 'Best gaming cafe in town! The RTX 4090 rigs are insane — smooth 240fps on every title. Booking online is super convenient, never had to wait for a station.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    role: 'Casual Gamer',
    content: 'I love the private rooms for co-op sessions with friends. Great atmosphere, clean setup, and the staff are really helpful. The console lounge is a bonus!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Marcus Rivera',
    role: 'VR Enthusiast',
    content: 'The VR room is next level. Half-Life: Alyx on a wireless headset with a 10×10 play area? Yes, please. Already planning my next session with friends.',
    rating: 5,
  },
]

export const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
]
