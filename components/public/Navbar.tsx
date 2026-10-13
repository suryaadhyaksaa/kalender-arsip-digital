'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LogIn, Calendar, FileText } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#022c22] border-b border-emerald-900/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo & Identity */}
        <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
          <div className="w-9 h-9 bg-white/10 rounded-xl p-1 flex items-center justify-center border border-white/10 shadow-2xs group-active:scale-95 transition-transform">
            <Image
              src="/icon.png"
              alt="Logo HIMA"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm sm:text-base text-white tracking-wide leading-tight">
                HIMA KEDOKTERAN
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-700/60 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-600/40">
                FK
              </span>
            </div>
            <span className="text-[10px] text-emerald-200/70 font-medium hidden sm:block">
              Portal Agenda & LPJ Digital Resmi
            </span>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            href="/kalender"
            prefetch={true}
            className="px-3.5 py-2 text-xs font-bold text-emerald-100 hover:text-white hover:bg-emerald-800/40 rounded-xl transition active:scale-95"
          >
            Kalender Agenda
          </Link>
          <Link
            href="/arsip"
            prefetch={true}
            className="px-3.5 py-2 text-xs font-bold text-emerald-100 hover:text-white hover:bg-emerald-800/40 rounded-xl transition active:scale-95"
          >
            Arsip & LPJ
          </Link>
        </nav>

        {/* Login Button (Ringkas di Mobile) */}
        <Link
          href="/login"
          prefetch={true}
          className="px-3 sm:px-4 py-2 bg-[#FAF5EC] hover:bg-[#F3EBE0] text-[#022c22] rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs active:scale-95 transition-all shrink-0"
        >
          <LogIn className="w-4 h-4 text-emerald-800" />
          <span className="hidden sm:inline">Login Pengurus</span>
          <span className="inline sm:hidden">Login</span>
        </Link>
      </div>
    </header>
  )
}