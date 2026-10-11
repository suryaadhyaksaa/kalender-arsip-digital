import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import { FolderCheck } from 'lucide-react'
import ArchiveList from '@/components/archive/ArchiveList'

export const instant = false

export default async function ArchivePage() {
  await connection()

  const supabase = await createClient()

  // Ambil dokumen publik beserta data kegiatannya
  const { data: rawDocs } = await supabase
    .from('documents')
    .select('*, events(*, categories(*))')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  const documents = rawDocs || []

  // Mengelompokkan dokumen berdasarkan ID Acara
  const eventMap = new Map<string, any>()

  documents.forEach((doc: any) => {
    const eventId = doc.events?.id || 'umum'
    const eventTitle = doc.events?.title || 'Dokumen Umum / Non-Kegiatan'
    const startDate = doc.events?.start_date || doc.created_at
    const location = doc.events?.location || ''
    const categoryName = doc.events?.categories?.name || 'Umum'
    const categoryColor = doc.events?.categories?.color_code || '#047857'

    if (!eventMap.has(eventId)) {
      eventMap.set(eventId, {
        eventId,
        eventTitle,
        startDate,
        location,
        categoryName,
        categoryColor,
        docs: [],
      })
    }

    eventMap.get(eventId).docs.push({
      id: doc.id,
      title: doc.title,
      doc_type: doc.doc_type,
      file_path: doc.file_path,
      file_size: doc.file_size,
      is_public: doc.is_public,
      created_at: doc.created_at,
    })
  })

  const groupedEvents = Array.from(eventMap.values())

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER PAGE */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-[#FAF5EC] text-emerald-900 border border-[#EFE8DC] rounded-2xl shrink-0 shadow-xs">
          <FolderCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022c22]">
            Arsip Digital & LPJ
          </h1>
          <p className="text-sm text-slate-500">
            Pusat pencarian dan pengunduhan dokumen resmi HIMA Kedokteran per kegiatan.
          </p>
        </div>
      </div>

      {/* KOMPONEN ACCORDION ARSIP */}
      <ArchiveList groupedEvents={groupedEvents} />
    </div>
  )
}