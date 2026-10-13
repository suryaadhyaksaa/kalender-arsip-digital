import Link from 'next/link'
import { Calendar, Search, ArrowRight, Activity, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  // Ambil total agenda
  const { count: eventCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  // Ambil total dokumen
  const { count: docCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Hero Container */}
      <section className="bg-gradient-to-b from-[#022c22] via-[#033b2e] to-[#044d3c] text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-emerald-900/40 space-y-6 text-center relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Badge Banner */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 text-[11px] font-semibold backdrop-blur-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Portal Resmi Himpunan Mahasiswa Kedokteran</span>
        </div>

        {/* Title & Description */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug sm:leading-tight text-white">
            Kalender Agenda &<br className="hidden sm:inline" /> Portal Arsip LPJ Digital
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal max-w-lg mx-auto">
            Pusat informasi kegiatan akademik, kepanitiaan, pengabdian masyarakat, serta arsip pertanggungjawaban (LPJ) Mahasiswa Kedokteran secara transparan.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
          <Link
            href="/kalender"
            prefetch={true}
            className="w-full sm:w-auto px-5 py-3 bg-[#FAF5EC] hover:bg-[#F0E6D8] text-[#022c22] font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md active:scale-95 transition-all"
          >
            <Calendar className="w-4 h-4 text-emerald-800" />
            <span>Buka Kalender Agenda</span>
          </Link>

          <Link
            href="/arsip"
            prefetch={true}
            className="w-full sm:w-auto px-5 py-3 bg-emerald-900/60 hover:bg-emerald-900/80 text-emerald-100 border border-emerald-700/50 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-xs active:scale-95 transition-all"
          >
            <Search className="w-4 h-4 text-emerald-300" />
            <span>Cari Arsip Dokumen</span>
          </Link>
        </div>
      </section>

      {/* Ringkasan Statistik Cards */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-[#FFFDF9] border border-[#EFE8DC] p-4 sm:p-5 rounded-2xl shadow-xs flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100/70 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-800" />
          </div>
          <div>
            <p className="text-xl sm:text-3xl font-black text-[#022c22]">
              {eventCount || 0}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Agenda Kegiatan
            </p>
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#EFE8DC] p-4 sm:p-5 rounded-2xl shadow-xs flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100/70 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" />
          </div>
          <div>
            <p className="text-xl sm:text-3xl font-black text-[#022c22]">
              {docCount || 0}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dokumen Arsip
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}