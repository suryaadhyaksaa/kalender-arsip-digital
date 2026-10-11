'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Calendar,
  MapPin,
  FolderCheck,
  Search,
  Filter,
  ExternalLink,
} from 'lucide-react'
import { formatBytes, formatDateWIB } from '@/lib/utils'

interface DocumentItem {
  id: string
  title: string
  doc_type?: string
  file_path: string
  file_size?: number
  is_public: boolean
  created_at: string
}

interface EventGroup {
  eventId: string
  eventTitle: string
  startDate: string
  location?: string
  categoryName?: string
  categoryColor?: string
  docs: DocumentItem[]
}

export default function ArchiveList({
  groupedEvents,
}: {
  groupedEvents: EventGroup[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  // Mengontrol ID acara yang sedang terbuka (dropdown)
  const [openEventIds, setOpenEventIds] = useState<string[]>(
    groupedEvents.length > 0 ? [groupedEvents[0].eventId] : []
  )

  const toggleAccordion = (id: string) => {
    setOpenEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Filter pencarian & tipe dokumen
  const filteredGroups = groupedEvents
    .map((group) => {
      const filteredDocs = group.docs.filter((doc) => {
        const matchTitle =
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())
        const matchType = selectedType === 'all' || doc.doc_type === selectedType
        return matchTitle && matchType
      })

      return { ...group, docs: filteredDocs }
    })
    .filter((group) => group.docs.length > 0)

  return (
    <div className="space-y-6">
      {/* FILTER BAR */}
      <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#EFE8DC] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kegiatan atau dokumen..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-[#022c22]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto py-2.5 px-3 text-sm bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40 text-[#022c22] font-semibold"
          >
            <option value="all">Semua Tipe Dokumen</option>
            <option value="kerangka">Kerangka</option>
            <option value="proposal">Proposal</option>
            <option value="surat_menyurat">Surat Menyurat (SK, SI, SU)</option>
            <option value="lpj_kegiatan">LPJ Kegiatan</option>
            <option value="lpj_keuangan">LPJ Keuangan</option>
            <option value="evaluasi">Evaluasi</option>
            <option value="dokumentasi">Dokumentasi</option>
          </select>
        </div>
      </div>

      {/* DAFTAR CARD ACCORDION */}
      <div className="space-y-4">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const isOpen = openEventIds.includes(group.eventId)

            return (
              <div
                key={group.eventId}
                className="bg-[#FFFDF9] rounded-2xl border border-[#EFE8DC] shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* HEADER CARD ACCORDION */}
                <div
                  onClick={() => toggleAccordion(group.eventId)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#FAF7F2] transition select-none"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      {group.categoryName && (
                        <span
                          className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md text-white shadow-2xs"
                          style={{
                            backgroundColor: group.categoryColor || '#047857',
                          }}
                        >
                          {group.categoryName}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                        <span>{formatDateWIB(group.startDate)}</span>
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-black text-[#022c22]">
                      {group.eventTitle}
                    </h2>

                    {group.location && (
                      <p className="text-xs text-slate-500 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{group.location}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 border-t sm:border-t-0 border-[#EFE8DC] pt-2 sm:pt-0">
                    <span className="text-xs font-extrabold bg-[#FAF5EC] text-emerald-900 border border-[#E0D2C0] px-3 py-1.5 rounded-xl">
                      {group.docs.length} Berkas Arsip
                    </span>

                    <button className="p-1.5 text-slate-500 hover:text-emerald-900 rounded-lg hover:bg-emerald-50 transition">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ISI DROPDOWN DOKUMEN (EXPANDED CONTENT) */}
                {isOpen && (
                  <div className="border-t border-[#EFE8DC] bg-[#FAF7F2] p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-[#EFE8DC] pb-2">
                          <tr>
                            <th className="pb-2">Nama Berkas Dokumen</th>
                            <th className="pb-2">Kategori</th>
                            <th className="pb-2">Ukuran</th>
                            <th className="pb-2 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE8DC]/60">
                          {group.docs.map((doc) => {
                            const downloadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.file_path}`

                            return (
                              <tr key={doc.id} className="hover:bg-white/80 transition">
                                <td className="py-3 font-bold text-[#022c22] pr-2">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-emerald-800 shrink-0" />
                                    <span>{doc.title}</span>
                                  </div>
                                </td>

                                <td className="py-3 pr-2">
                                  <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded bg-[#FAF5EC] border border-[#E0D2C0] text-[#022c22]">
                                    {doc.doc_type ? doc.doc_type.replace(/_/g, ' ') : 'DOKUMEN'}
                                  </span>
                                </td>

                                <td className="py-3 text-xs text-slate-500 pr-2">
                                  {doc.file_size ? formatBytes(doc.file_size) : '-'}
                                </td>

                                <td className="py-3 text-right">
                                  <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#FAF5EC] hover:bg-[#F0E6D8] text-[#022c22] border border-[#E0D2C0] rounded-xl text-xs font-extrabold transition shadow-2xs"
                                  >
                                    <Download className="w-3.5 h-3.5 text-emerald-800" />
                                    <span>Unduh</span>
                                  </a>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="bg-[#FFFDF9] p-12 rounded-2xl border border-[#EFE8DC] text-center text-slate-400 text-sm space-y-2">
            <FolderCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p>Tidak ada arsip dokumen yang sesuai dengan pencarian Anda.</p>
          </div>
        )}
      </div>
    </div>
  )
}