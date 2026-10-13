import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  FileText,
  Download,
} from 'lucide-react'
import { formatDateWIB, formatBytes } from '@/lib/utils'

export const instant = false

// Interface untuk Tipe Data Relasi Supabase
interface CategoryItem {
  id: string
  name: string
  color_code: string
}

interface DocumentItem {
  id: string
  title: string
  file_path: string
  file_size?: number
}

interface EventDetail {
  id: string
  title: string
  slug: string
  start_date: string
  location?: string
  pic_name?: string
  description?: string
  status: string
  categories?: CategoryItem | null
  documents?: DocumentItem[] | null
}

interface Props {
  params: Promise<{ slug: string }>
}

// Fungsi pembantu untuk membersihkan & mendapatkan URL publik berkas
function getCleanPublicUrl(filePath: string) {
  if (!filePath) return ''
  
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    const lastHttpIndex = filePath.lastIndexOf('http')
    if (lastHttpIndex > 0) {
      return filePath.substring(lastHttpIndex)
    }
    return filePath
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const cleanPath = filePath.replace(/^documents\//, '')
  return `${baseUrl}/storage/v1/object/public/documents/${cleanPath}`
}

export default async function AgendaDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Ambil detail agenda berdasarkan slug
  const { data: rawEvent } = await supabase
    .from('events')
    .select('*, categories(*), documents(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  // Casting type data agar TypeScript membaca struktur properti dengan benar
  const event = rawEvent as unknown as EventDetail | null

  if (!event) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Tombol Kembali */}
      <Link
        href="/kalender"
        className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-teal-600 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Kalender</span>
      </Link>

      {/* Kartu Utama Detail Agenda */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Kategori & Status */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-bold uppercase px-3 py-1 rounded-md text-white shadow-2xs"
            style={{ backgroundColor: event.categories?.color_code || '#0d9488' }}
          >
            {event.categories?.name || 'Umum'}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            ID: {event.id.slice(0, 8)}
          </span>
        </div>

        {/* Judul Utama */}
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {event.title}
        </h1>

        {/* Informasi Utama Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200/60 text-xs sm:text-sm text-slate-700">
          <div className="flex items-start space-x-3">
            <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Waktu Pelaksanaan</p>
              <p>{formatDateWIB(event.start_date)}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Lokasi</p>
              <p>{event.location || '-'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <User className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Penanggung Jawab (PIC)</p>
              <p>{event.pic_name || '-'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Zona Waktu</p>
              <p>Asia/Jakarta (WIB)</p>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        {event.description && (
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Deskripsi / Catatan Kegiatan
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {event.description}
            </p>
          </div>
        )}

        {/* Lampiran Dokumen Arsip */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Dokumen Arsip Lampiran ({event.documents?.length || 0})</span>
          </h3>

          {event.documents && event.documents.length > 0 ? (
            <div className="space-y-2">
              {event.documents.map((doc) => {
                const targetPublicUrl = getCleanPublicUrl(doc.file_path)
                const downloadProxyUrl = `/api/download?url=${encodeURIComponent(targetPublicUrl)}&name=${encodeURIComponent(doc.title)}`

                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 rounded-xl transition"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <FileText className="w-5 h-5 text-teal-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {doc.title}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {doc.file_size ? formatBytes(doc.file_size) : 'File'}
                        </p>
                      </div>
                    </div>

                    <a
                      href={downloadProxyUrl}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shrink-0 ml-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
              Belum ada dokumen lampiran yang diunggah untuk agenda ini.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}