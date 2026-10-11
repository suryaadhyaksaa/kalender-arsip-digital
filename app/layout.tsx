import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'HIMA KEDOKTERAN - Portal Kalender & Digital Archive',
  description: 'Portal Kalender Agenda & Arsip LPJ Digital Resmi HIMA Kedokteran',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

// Konfigurasi viewport khusus sensitivitas layar seluler & iOS notch
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-[#FAF7F2] text-slate-800 antialiased min-h-screen flex flex-col selection:bg-amber-200 selection:text-slate-900">
        {children}
      </body>
    </html>
  )
}