import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'GameZone Arena',
    template: '%s | GameZone Arena',
  },
  description:
    'Reserve premium gaming rooms — PCs, consoles, VR rigs, and private rooms — at GameZone Arena. Real-time availability, instant booking, and seamless online payment.',
  keywords: ['gaming arena', 'gaming room booking', 'esports venue', 'PC gaming', 'VR gaming', 'console gaming', 'gaming reservation'],
  authors: [{ name: 'GameZone Arena' }],
  openGraph: {
    title: 'GameZone Arena — Book Your Gaming Room',
    description: 'Premium gaming rooms. Real-time availability. Instant booking.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameZone Arena — Book Your Gaming Room',
    description: 'Premium gaming rooms. Real-time availability. Instant booking.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0B0E14',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-[#0B0E14]`}
      style={
        {
          '--font-sans': 'var(--font-inter)',
          '--font-display': 'var(--font-space-grotesk)',
          '--font-mono': 'var(--font-jetbrains-mono)',
        } as React.CSSProperties
      }
    >
      <body className="antialiased bg-[#0B0E14] text-[#F5F6FA]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
