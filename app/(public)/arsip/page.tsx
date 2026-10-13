import { Suspense } from 'react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import ArchiveView from '@/components/archive/ArchiveList'

// Sub-komponen khusus untuk mengambil data dinamis di server
async function ArchiveData() {
  await connection()
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*, categories(*), documents(*)')
    .order('start_date', { ascending: false })

  return <ArchiveView events={events || []} />
}

export default function ArchivePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#022c22]">Arsip Digital & LPJ</h1>
        <p className="text-xs text-slate-500 mt-1">
          Pusat pencarian dan pengunduhan dokumen resmi HIMA Kedokteran per kegiatan.
        </p>
      </div>

      {/* Pembungkus Suspense agar Next.js 16 dapat melakukan prerender UI instan & streaming data */}
      <Suspense
        fallback={
          <div className="text-center py-12 bg-[#FFFDF9] border border-dashed border-[#E0D2C0] rounded-2xl animate-pulse">
            <p className="text-sm font-bold text-[#022c22]">Memuat dokumen arsip...</p>
          </div>
        }
      >
        <ArchiveData />
      </Suspense>
    </div>
  )
}