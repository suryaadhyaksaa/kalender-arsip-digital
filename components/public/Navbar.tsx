import Link from 'next/link'
import { Calendar, FileText, Home, Lock } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center text-slate-900 font-bold">
            K
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-100">
            Agenda<span className="text-teal-400">&</span>Arsip
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/" className="flex items-center space-x-1.5 hover:text-teal-400 transition">
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
          <Link href="/kalender" className="flex items-center space-x-1.5 hover:text-teal-400 transition">
            <Calendar className="w-4 h-4" />
            <span>Kalender</span>
          </Link>
          <Link href="/arsip" className="flex items-center space-x-1.5 hover:text-teal-400 transition">
            <FileText className="w-4 h-4" />
            <span>Arsip Digital</span>
          </Link>
        </nav>

        <Link
          href="/admin/login"
          className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-md transition border border-slate-700"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Portal Admin</span>
        </Link>
      </div>
    </header>
  )
}