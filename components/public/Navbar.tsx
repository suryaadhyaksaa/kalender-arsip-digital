'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LogIn } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#022c22] border-b border-emerald-900/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-4 h-13 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo & Identitas */}
        <Link href="/" className="flex items-center space-x-2 shrink-0 group">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-lg sm:rounded-xl p-1 flex items-center justify-center border border-white/10 shadow-2xs group-active:scale-95 transition-transform">
            <Image
              src="/icon.png"
              alt="Logo HIMA"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-xs sm:text-sm text-white tracking-wide leading-none">
                HIMA KEDOKTERAN
              </span>
              <span className="text-[9px] font-extrabold bg-emerald-700/60 text-emerald-200 px-1 py-0.5 rounded border border-emerald-600/40 shrink-0">
                FK
              </span>
            </div>
            <span className="text-[10px] text-emerald-200/70 font-medium hidden md:block">
              Portal Agenda & LPJ Digital Resmi
            </span>
          </div>
        </Link>

        {/* Navigasi Desktop */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            href="/kalender"
            prefetch={true}
            className="px-3 py-1.5 text-xs font-bold text-emerald-100 hover:text-white hover:bg-emerald-800/40 rounded-lg transition active:scale-95"
          >
            Kalender Agenda
          </Link>
          <Link
            href="/arsip"
            prefetch={true}
            className="px-3 py-1.5 text-xs font-bold text-emerald-100 hover:text-white hover:bg-emerald-800/40 rounded-lg transition active:scale-95"
          >
            Arsip & LPJ
          </Link>
        </nav>

        {/* Tombol Login Pengurus (Ukuran Ringkas & Pas di HP) */}
        <Link
          href="/login"
          prefetch={true}
          className="inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#FAF5EC] hover:bg-[#F3EBE0] text-[#022c22] rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-extrabold whitespace-nowrap shadow-2xs active:scale-95 transition-all shrink-0"
        >
          <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-800 shrink-0" />
          <span>Login Pengurus</span>
        </Link>
      </div>
    </header>
  )
}