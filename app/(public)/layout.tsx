'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  FileText,
  Home,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  X,
  Lock,
} from 'lucide-react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  // Mencegah error dynamic Date pada prerender Next.js
  const [currentYear, setCurrentYear] = useState<number>(2026)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())

    // Cek status login dari Supabase Auth
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg('Email atau password pengurus salah!')
    } else {
      setIsLoginModalOpen(false)
      setEmail('')
      setPassword('')
      router.refresh()
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  const navItems = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Kalender Agenda', href: '/kalender', icon: Calendar },
    { name: 'Arsip & LPJ', href: '/arsip', icon: FileText },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] font-sans text-slate-800 antialiased selection:bg-amber-200 selection:text-slate-900 pb-20 md:pb-0">
      {/* HEADER DEEP EMERALD */}
      <header className="sticky top-0 z-40 w-full bg-[#022c22] backdrop-blur-md border-b border-emerald-900/60 text-[#FAF5EC] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5EC] p-1 flex items-center justify-center shadow-md shadow-emerald-950/40 group-hover:scale-105 transition border border-[#E0D2C0]">
              <Image
                src="/logo-hima.png"
                alt="Logo HIMA Kedokteran"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-sm sm:text-lg tracking-tight text-[#FAF5EC] group-hover:text-amber-200 transition">
                  HIMA KEDOKTERAN
                </span>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100/10 text-amber-200 border border-amber-200/20">
                  FK
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/70 -mt-1 hidden sm:block">
                Portal Agenda & LPJ Digital Resmi
              </p>
            </div>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition ${
                    isActive
                      ? 'bg-[#FAF5EC] text-[#022c22] shadow-sm border border-[#E0D2C0]'
                      : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* STATUS AKSES & TOMBOL LOGIN PENGURUS */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center space-x-1 text-xs font-bold text-amber-200 bg-amber-900/40 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Mode Pengurus</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-[#FAF5EC] hover:bg-red-100 text-red-900 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition active:scale-95 flex items-center space-x-1 border border-[#E0D2C0]"
                  title="Keluar ke Mode Tamu"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-200/80 bg-emerald-900/30 px-2.5 py-1 rounded-lg">
                  Tamu (Lihat Saja)
                </span>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-[#FAF5EC] hover:bg-[#F0E6D8] text-[#022c22] font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition active:scale-95 flex items-center space-x-1.5 border border-[#E0D2C0]"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Login Pengurus</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1">{children}</main>

      {/* MOBILE BOTTOM NAV BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#022c22]/98 backdrop-blur-lg border-t border-emerald-900/80 px-3 py-2 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition active:scale-90 touch-manipulation ${
                isActive ? 'text-amber-200 font-bold' : 'text-emerald-200/60 hover:text-emerald-100'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#FAF5EC] text-[#022c22]' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* MODAL LOGIN PENGURUS */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-[#022c22]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE8DC] max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-[#FAF5EC] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-[#FAF5EC] border border-[#E0D2C0] rounded-2xl flex items-center justify-center mx-auto text-[#022c22] shadow-xs">
                <Lock className="w-6 h-6 text-emerald-800" />
              </div>
              <h3 className="font-extrabold text-[#022c22] text-lg pt-1">Login Pengurus HIMA</h3>
              <p className="text-xs text-slate-500">
                Masukkan kredensial akun untuk mengedit agenda & mengunggah LPJ.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Pengurus
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pengurus@himakedokteran.org"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#FAF5EC] hover:bg-[#F0E6D8] border border-[#E0D2C0] active:scale-[0.98] text-[#022c22] rounded-xl text-xs font-extrabold transition shadow-md flex items-center justify-center space-x-2 mt-2"
              >
                {loading ? 'Memverifikasi...' : 'Masuk sebagai Pengurus'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER DESKTOP */}
      <footer className="hidden md:block bg-[#022c22] border-t border-emerald-900/60 text-emerald-200/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Sekretariat Himpunan Mahasiswa Kedokteran &bull; Sistem Terintegrasi WIB</span>
          </div>
          <p className="text-emerald-300/50">
            &copy; {currentYear} HIMA KEDOKTERAN. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}