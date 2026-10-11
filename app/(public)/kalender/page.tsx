import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import CalendarView from '@/components/calendar/CalendarView'

export const instant = false

export default async function KalenderPage() {
  // Menandai halaman agar dirender secara dinamis saat diakses (request-time)
  await connection()

  const supabase = await createClient()

  // Ambil data agenda dan divisi dari Supabase
  const [{ data: rawEvents }, { data: categories }] = await Promise.all([
    supabase
      .from('events')
      .select('*, categories(*)')
      .order('start_date', { ascending: true }),
    supabase.from('categories').select('*').order('name', { ascending: true }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-[#EFE8DC] pb-4">
        <h1 className="text-2xl font-black text-[#022c22]">Kalender Kegiatan Resmi</h1>
        <p className="text-slate-500 text-sm mt-1">
          Navigasi interaktif untuk melihat, mencari, serta mengelola agenda acara HIMA Kedokteran.
        </p>
      </div>

      {/* Komponen Kalender Interaktif */}
      <CalendarView events={rawEvents || []} categories={categories || []} />
    </div>
  )
}