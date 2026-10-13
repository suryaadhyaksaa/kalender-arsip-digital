'use client'

import { useState } from 'react'
import { FileText, Download, Search } from 'lucide-react'
import { formatDateWIB, formatBytes } from '@/lib/utils'

interface DocumentItem {
  id: string
  title: string
  file_path: string
  file_size?: number
  doc_type?: string
  created_at?: string
}

interface EventWithDocs {
  id: string
  title: string
  start_date: string
  location?: string
  pic_name?: string
  categories?: {
    name: string
    color_code: string
  }
  documents: DocumentItem[]
}

function getCleanDownloadUrl(filePath: string) {
  if (!filePath) return '#'
  
  if (filePath.includes('http')) {
    const lastHttpIndex = filePath.lastIndexOf('http')
    return filePath.substring(lastHttpIndex)
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mqskoxyssqogjxdzqgkk.supabase.co'
  const cleanPath = filePath.replace(/^\/+/, '')
  return `${baseUrl.replace(/\/$/, '')}/storage/v1/object/public/documents/${cleanPath}`
}

export default function ArchiveView({ events = [] }: { events?: EventWithDocs[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  // Proteksi array agar safe terhadap nilai undefined / null
  const safeEvents = Array.isArray(events) ? events : []

  const filteredEvents = safeEvents.filter((e) => {
    const docs = e.documents || []
    const matchSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docs.some((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchType =
      selectedType === 'all' ||
      docs.some((d) => d.doc_type === selectedType)

    return matchSearch && matchType
  })

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#EFE8DC] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kegiatan atau dokumen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-[#022c22]"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="py-2 px-3 text-sm bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl font-medium text-[#022c22]"
        >
          <option value="all">Semua Tipe Dokumen</option>
          <option value="kerangka">Kerangka</option>
          <option value="proposal">Proposal</option>
          <option value="surat_menyurat">Surat Menyurat</option>
          <option value="lpj_kegiatan">LPJ Kegiatan</option>
          <option value="lpj_keuangan">LPJ Keuangan</option>
          <option value="evaluasi">Evaluasi</option>
          <option value="dokumentasi">Dokumentasi</option>
        </select>
      </div>

      {/* Daftar Event & Berkas */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev) => (
            <div key={ev.id} className="bg-[#FFFDF9] border border-[#EFE8DC] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFE8DC] pb-3">
                <div>
                  <span
                    className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md text-white shadow-2xs mr-2"
                    style={{ backgroundColor: ev.categories?.color_code || '#047857' }}
                  >
                    {ev.categories?.name || 'Umum'}
                  </span>
                  <h3 className="font-extrabold text-[#022c22] text-lg inline-block mt-1 sm:mt-0">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDateWIB(ev.start_date)} • {ev.location || '-'}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-900 bg-[#FAF5EC] border border-[#E0D2C0] px-3 py-1 rounded-lg">
                  {(ev.documents || []).length} Berkas Arsip
                </span>
              </div>

              <div className="space-y-2">
                {(ev.documents || []).map((doc) => {
                  const cleanPublicUrl = getCleanDownloadUrl(doc.file_path)
                  const downloadProxyUrl = `/api/download?url=${encodeURIComponent(cleanPublicUrl)}&name=${encodeURIComponent(doc.title)}`

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-[#FAF7F2] hover:bg-[#F3EBE0] border border-[#EFE8DC] rounded-xl transition"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileText className="w-4 h-4 text-emerald-800 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-[#022c22] truncate">{doc.title}</p>
                          <p className="text-[10px] text-slate-500">
                            {doc.file_size ? formatBytes(doc.file_size) : 'File'}
                          </p>
                        </div>
                      </div>

                      <a
                        href={downloadProxyUrl}
                        className="px-3 py-1.5 bg-[#FAF5EC] hover:bg-[#F0E6D8] border border-[#E0D2C0] text-[#022c22] rounded-lg text-xs font-extrabold flex items-center space-x-1.5 transition shrink-0 ml-2 shadow-2xs active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Unduh</span>
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-[#FFFDF9] border border-dashed border-[#E0D2C0] rounded-2xl">
            <p className="text-sm font-bold text-[#022c22]">Tidak ada dokumen arsip</p>
            <p className="text-xs text-slate-500 mt-1">Belum ada berkas terdaftar yang sesuai dengan pencarian Anda.</p>
          </div>
        )}
      </div>
    </div>
  )
}