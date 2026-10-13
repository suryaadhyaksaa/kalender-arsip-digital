import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import Link from 'next/link'
import {
  Calendar,
  Search,
  ArrowRight,
  Clock,
  MapPin,
  FolderCheck,
  Sparkles,
  FileText,
  Activity,
} from 'lucide-react'
import { formatDateWIB } from '@/lib/utils'

// Menandai route agar Next.js 16 mengizinkan request-time rendering dinamis
export const instant = false

interface EventItem {
  id: string
  title: string
  slug: string
  start_date: string
  location?: string
  categories?: { name: string; color_code: string } | null
}

export default async function HomePage() {
  await connection()

  const supabase = await createClient()

  const [{ count: totalEvents }, { count: totalDocs }, { data: recentRaw }] =
    await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('is_public', true),
      supabase
        .from('events')
        .select('*, categories(*)')
        .eq('status', 'published')
        .order('start_date', { ascending: false })
        .limit(3),
    ])

  const recentEvents = (recentRaw as unknown as EventItem[]) || []

  return (
    <div className="space-y-10 pb-16">
      {/* HERO BANNER */}
      <section className="bg-gradient-to-b from-[#022c22] via-[#043d2f] to-[#022c22] text-[#FAF5EC] pt-12 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-emerald-900/50">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-100/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-amber-200 text-xs font-semibold shadow-inner">
            <Activity className="w-4 h-4 text-amber-200" />
            <span>Portal Resmi Himpunan Mahasiswa Kedokteran</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-[#FAF5EC]">
            Kalender Agenda & Portal Arsip LPJ Digital
          </h1>

          <p className="text-emerald-100/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Pusat informasi kegiatan akademik, kepanitiaan, pengabdian masyarakat, serta arsip pertanggungjawaban (LPJ) Mahasiswa Kedokteran secara transparan.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* TOMBOL KRIM UTAMA */}
            <Link
              href="/kalender"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#FAF5EC] hover:bg-[#F0E6D8] text-[#022c22] font-extrabold text-sm shadow-lg shadow-emerald-950/40 transition active:scale-95 flex items-center justify-center space-x-2 border border-[#E0D2C0]"
            >
              <Calendar className="w-4 h-4 text-emerald-800" />
              <span>Buka Kalender Agenda</span>
            </Link>

            {/* TOMBOL KRIM SEKUNDER */}
            <Link
              href="/arsip"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#F3EBE0] hover:bg-[#E8DDD0] text-[#022c22] font-extrabold text-sm border border-[#DCD0C0] transition flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4 text-emerald-800" />
              <span>Cari Arsip Dokumen</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KARTU STATISTIK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#EFE8DC] shadow-lg shadow-emerald-950/5 flex items-center space-x-4 hover:border-emerald-600/40 transition">
            <div className="p-3.5 bg-[#FAF5EC] text-emerald-900 border border-[#EFE8DC] rounded-2xl shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#022c22]">{totalEvents || 0}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Agenda Kegiatan Terdaftar
              </p>
            </div>
          </div>

          <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#EFE8DC] shadow-lg shadow-emerald-950/5 flex items-center space-x-4 hover:border-emerald-600/40 transition">
            <div className="p-3.5 bg-[#FAF5EC] text-emerald-900 border border-[#EFE8DC] rounded-2xl shrink-0">
              <FolderCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#022c22]">{totalDocs || 0}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Arsip LPJ & Dokumen Terbuka
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DAFTAR AGENDA KEGIATAN TERBARU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-2">
        <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#022c22] flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              <span>Agenda Kegiatan Terbaru</span>
            </h2>
            <p className="text-xs text-slate-500">Jadwal kegiatan akademik dan kemahasiswaan FK</p>
          </div>
          <Link
            href="/kalender"
            className="text-xs font-bold text-[#022c22] bg-[#FAF5EC] hover:bg-[#F0E6D8] px-3 py-1.5 rounded-lg border border-[#E0D2C0] flex items-center space-x-1 transition"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentEvents.length > 0 ? (
            recentEvents.map((item) => (
              <Link
                key={item.id}
                href={`/agenda/${item.slug}`}
                className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE8DC] shadow-xs hover:shadow-md hover:border-emerald-600/60 transition space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <span
                    className="inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md text-white shadow-2xs"
                    style={{ backgroundColor: item.categories?.color_code || '#047857' }}
                  >
                    {item.categories?.name || 'Umum'}
                  </span>
                  <h3 className="font-bold text-[#022c22] text-sm sm:text-base group-hover:text-emerald-700 transition line-clamp-2">
                    {item.title}
                  </h3>
                </div>

                <div className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-[#F5EFE6]">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{formatDateWIB(item.start_date)}</span>
                  </div>
                  {item.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full bg-[#FFFDF9] p-8 rounded-2xl border border-dashed border-[#EFE8DC] text-center text-slate-400 text-sm space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Belum ada agenda kegiatan yang terdaftar saat ini.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}