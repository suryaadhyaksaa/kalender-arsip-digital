'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Filter,
  X,
  CheckCircle,
  User,
  Edit,
  Trash2,
  ExternalLink,
  Upload,
  Video,
} from 'lucide-react'
import { formatDateWIB } from '@/lib/utils'
import { createEvent, updateEvent, deleteEvent, quickUploadDocument } from '@/app/actions/events'

interface EventItem {
  id: string
  title: string
  slug: string
  start_date: string
  end_date?: string
  location?: string
  pic_name?: string
  description?: string
  meeting_link?: string
  status: string
  category_id?: string
  categories?: {
    name: string
    color_code: string
  }
}

interface Category {
  id: string
  name: string
  color_code?: string
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const getLocalDateStr = (dateInput: string | Date) => {
  const d = new Date(dateInput)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getLocalTimeStr = (dateInput: string | Date) => {
  const d = new Date(dateInput)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export default function CalendarView({
  events,
  categories,
}: {
  events: EventItem[]
  categories: Category[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const [eventsList, setEventsList] = useState<EventItem[]>(events)
  const [isPengurus, setIsPengurus] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      const { data } = await supabase.auth.getUser()
      setIsPengurus(!!data.user)
    }
    checkRole()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsPengurus(!!session?.user)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    setEventsList(events)
  }, [events])

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null)
  const [selectedDateEvents, setSelectedDateEvents] = useState<EventItem[] | null>(null)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  const [prefilledDateOnly, setPrefilledDateOnly] = useState('')
  const [prefilledTimeOnly, setPrefilledTimeOnly] = useState('08:00')

  const [attachmentRows, setAttachmentRows] = useState<Array<{ id: string; docType: string }>>([
    { id: '1', docType: 'lpj_kegiatan' },
  ])

  const [quickUploadEventId, setQuickUploadEventId] = useState<string | null>(null)

  const handleAddAttachmentRow = () => {
    setAttachmentRows((prev) => [
      ...prev,
      { id: Date.now().toString(), docType: 'lpj_kegiatan' },
    ])
  }

  const handleRemoveAttachmentRow = (id: string) => {
    if (attachmentRows.length > 1) {
      setAttachmentRows((prev) => prev.filter((row) => row.id !== id))
    }
  }

  const filteredEvents = eventsList.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.pic_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = selectedCategory === 'all' || e.category_id === selectedCategory
    return matchSearch && matchCategory
  })

  const getEventCountForMonth = (monthIndex: number) => {
    return filteredEvents.filter((e) => {
      const d = new Date(e.start_date)
      return d.getFullYear() === selectedYear && d.getMonth() === monthIndex
    }).length
  }

  const getEventsForDay = (day: number) => {
    if (selectedMonth === null) return []
    const targetDateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return filteredEvents.filter((e) => {
      const eventDateStr = getLocalDateStr(e.start_date)
      return eventDateStr === targetDateStr
    })
  }

  const handleDateClick = (day: number, dayEvents: EventItem[]) => {
    if (selectedMonth === null) return
    setSelectedDayNumber(day)
    const formattedDate = `${day} ${MONTH_NAMES[selectedMonth]} ${selectedYear}`
    setSelectedDateStr(formattedDate)
    setSelectedDateEvents(dayEvents)

    const m = String(selectedMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    setPrefilledDateOnly(`${selectedYear}-${m}-${d}`)
    setPrefilledTimeOnly('08:00')
  }

  const handleOpenAddForm = () => {
    setEditingEvent(null)
    setAttachmentRows([{ id: '1', docType: 'lpj_kegiatan' }])
    if (selectedMonth !== null && selectedDayNumber !== null) {
      const m = String(selectedMonth + 1).padStart(2, '0')
      const d = String(selectedDayNumber).padStart(2, '0')
      setPrefilledDateOnly(`${selectedYear}-${m}-${d}`)
      setPrefilledTimeOnly('08:00')
    } else {
      const now = new Date()
      setPrefilledDateOnly(getLocalDateStr(now))
      setPrefilledTimeOnly(getLocalTimeStr(now))
    }
    setIsFormModalOpen(true)
  }

  const handleOpenEditForm = (event: EventItem) => {
    setEditingEvent(event)
    setAttachmentRows([{ id: '1', docType: 'lpj_kegiatan' }])
    if (event.start_date) {
      setPrefilledDateOnly(getLocalDateStr(event.start_date))
      setPrefilledTimeOnly(getLocalTimeStr(event.start_date))
    }
    setIsFormModalOpen(true)
  }

  const handleDeleteEvent = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus acara "${title}"?`)) {
      try {
        await deleteEvent(id)
        setEventsList((prev) => prev.filter((item) => item.id !== id))
        setSelectedDateEvents((prev) => prev?.filter((item) => item.id !== id) || null)
        router.refresh()
      } catch (err: any) {
        alert('Gagal menghapus acara: ' + err.message)
      }
    }
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)

    const dateVal = formData.get('event_date') as string
    const timeVal = formData.get('event_time') as string
    formData.set('start_date', `${dateVal}T${timeVal}`)

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData)
      } else {
        await createEvent(formData)
      }
      setIsFormModalOpen(false)
      setSelectedDateEvents(null)
      router.refresh()
    } catch (err: any) {
      alert('Gagal menyimpan acara: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleQuickUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      await quickUploadDocument(formData)
      alert('Dokumen berhasil diunggah!')
      setQuickUploadEventId(null)
      router.refresh()
    } catch (err: any) {
      alert('Gagal mengunggah dokumen: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* FILTER BAR */}
      <div className="bg-[#FFFDF9] p-3.5 sm:p-5 rounded-2xl border border-[#EFE8DC] shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari agenda atau PIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-sm bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto py-2.5 sm:py-2 px-3 text-base sm:text-sm bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/40 focus:bg-white transition text-[#022c22] font-medium"
              >
                <option value="all">Semua Divisi</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isPengurus && (
            <button
              onClick={() => handleOpenAddForm()}
              className="hidden sm:flex items-center justify-center space-x-2 w-full md:w-auto bg-[#FAF5EC] hover:bg-[#F0E6D8] text-[#022c22] text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-xs border border-[#E0D2C0] active:scale-[0.98] transition-all shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-800" />
              <span>Tambah Acara</span>
            </button>
          )}
        </div>
      </div>

      {selectedMonth === null ? (
        <div className="space-y-4">
          <div className="bg-[#FFFDF9] p-3.5 sm:p-5 rounded-2xl border border-[#EFE8DC] shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="p-2 bg-[#FAF5EC] border border-[#EFE8DC] text-emerald-900 rounded-xl">
                <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-extrabold text-[#022c22]">
                  Tahun {selectedYear}
                </h2>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Pilih bulan untuk melihat tanggal
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setSelectedYear((y) => y - 1)}
                className="p-2.5 sm:p-2 bg-[#FAF5EC] hover:bg-[#F0E6D8] border border-[#E0D2C0] rounded-xl active:scale-90 transition text-[#022c22]"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setSelectedYear(new Date().getFullYear())}
                className="px-3 py-2 sm:py-1.5 text-xs font-extrabold bg-[#FAF5EC] hover:bg-[#F0E6D8] border border-[#E0D2C0] rounded-xl text-[#022c22] transition"
              >
                Tahun Ini
              </button>
              <button
                onClick={() => setSelectedYear((y) => y + 1)}
                className="p-2.5 sm:p-2 bg-[#FAF5EC] hover:bg-[#F0E6D8] border border-[#E0D2C0] rounded-xl active:scale-90 transition text-[#022c22]"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {MONTH_NAMES.map((monthName, idx) => {
              const count = getEventCountForMonth(idx)
              const isCurrentMonth =
                new Date().getMonth() === idx && new Date().getFullYear() === selectedYear

              return (
                <button
                  key={monthName}
                  onClick={() => setSelectedMonth(idx)}
                  className={`p-3.5 sm:p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 sm:space-y-4 hover:shadow-md active:scale-95 ${
                    isCurrentMonth
                      ? 'bg-[#FAF5EC] border-emerald-700/80 ring-2 ring-emerald-700/20'
                      : 'bg-[#FFFDF9] border-[#EFE8DC] hover:border-emerald-600/60'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-extrabold text-[#022c22] text-sm sm:text-lg">{monthName}</span>
                    {isCurrentMonth && (
                      <span className="text-[8px] sm:text-[9px] font-extrabold bg-[#FAF5EC] text-[#022c22] border border-[#E0D2C0] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                        Bulan Ini
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                    <span>{count} Agenda</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-[#FFFDF9] p-3 sm:p-4 rounded-2xl border border-[#EFE8DC] shadow-xs flex items-center justify-between gap-2">
            <button
              onClick={() => setSelectedMonth(null)}
              className="flex items-center space-x-1 px-3 py-2 sm:py-1.5 text-xs font-extrabold text-[#022c22] bg-[#FAF5EC] hover:bg-[#F0E6D8] border border-[#E0D2C0] rounded-xl active:scale-95 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Daftar Bulan</span>
            </button>
            <h2 className="text-sm sm:text-xl font-black text-[#022c22]">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </h2>
            <div className="w-8 sm:w-20"></div>
          </div>

          <div className="bg-[#FFFDF9] border border-[#EFE8DC] rounded-2xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-7 bg-[#F7F3EB] text-[#022c22] text-center text-[10px] sm:text-xs font-bold py-2 border-b border-[#EFE8DC]">
              <div>Min</div>
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div>Sab</div>
            </div>

            <div className="grid grid-cols-7 auto-rows-fr gap-px bg-[#EFE8DC]">
              {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-[#FAF7F2]/50 min-h-[50px] sm:min-h-[100px] p-1"></div>
              ))}

              {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }).map((_, i) => {
                const day = i + 1
                const dayEvents = getEventsForDay(day)
                const hasEvents = dayEvents.length > 0

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(day, dayEvents)}
                    className={`bg-[#FFFDF9] min-h-[52px] sm:min-h-[100px] p-1 sm:p-2 transition-all cursor-pointer hover:bg-emerald-50 active:bg-emerald-100/60 flex flex-col justify-between group touch-manipulation ${
                      hasEvents ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full transition-colors ${
                          hasEvents
                            ? 'bg-[#FAF5EC] text-[#022c22] border border-[#E0D2C0] shadow-2xs font-black'
                            : 'text-slate-700 group-hover:bg-[#EFE8DC]'
                        }`}
                      >
                        {day}
                      </span>
                      {hasEvents && (
                        <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-900 bg-[#FAF5EC] border border-[#E0D2C0] px-1.5 py-0.5 rounded-md">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="hidden sm:block space-y-1 mt-1 flex-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-[10px] truncate px-1.5 py-0.5 rounded-md text-white font-medium shadow-2xs"
                          style={{ backgroundColor: event.categories?.color_code || '#047857' }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-[9px] text-slate-400 font-semibold pl-0.5">+{dayEvents.length - 2} lagi</p>
                      )}
                    </div>

                    {hasEvents && (
                      <div className="flex sm:hidden justify-center items-center gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((ev, idx) => (
                          <span
                            key={idx}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: ev.categories?.color_code || '#047857' }}
                          ></span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* FAB (FLOATING ACTION BUTTON) HP */}
      {isPengurus && (
        <button
          onClick={() => handleOpenAddForm()}
          className="sm:hidden fixed bottom-6 right-4 z-40 bg-[#022c22] text-amber-200 border border-emerald-800 p-4 rounded-full shadow-2xl active:scale-90 transition-all flex items-center justify-center mb-safe"
          aria-label="Tambah Acara"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* MODAL RINCIAN ACARA HARIAN (TAMPILAN RAPI & MODERN) */}
      {selectedDateEvents && (
        <div className="fixed inset-0 bg-[#022c22]/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FFFDF9] rounded-t-3xl sm:rounded-2xl border border-[#EFE8DC] max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[85dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* DRAG HANDLE UNTUK HP */}
            <div className="w-12 h-1.5 bg-[#EFE8DC] rounded-full mx-auto sm:hidden -mt-1 mb-2 shrink-0"></div>

            {/* HEADER MODAL DETAIL */}
            <div className="flex justify-between items-start border-b border-[#EFE8DC] pb-3.5 shrink-0">
              <div>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4.5 h-4.5 text-emerald-800" />
                  <h3 className="font-black text-[#022c22] text-base sm:text-lg">{selectedDateStr}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Rincian agenda kegiatan terdaftar</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDateEvents(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-[#FAF5EC] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ISI LIST / EMPTY STATE */}
            <div className="flex-1 overflow-y-auto py-3.5 pr-1 space-y-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((e) => (
                  <div
                    key={e.id}
                    className="p-3.5 border border-[#EFE8DC] rounded-2xl space-y-2.5 bg-[#FAF7F2] hover:bg-amber-50/60 transition relative"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className="inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md text-white shadow-2xs"
                        style={{ backgroundColor: e.categories?.color_code || '#047857' }}
                      >
                        {e.categories?.name || 'Umum'}
                      </span>

                      <div className="flex items-center space-x-1 shrink-0">
                        <Link
                          href={`/agenda/${e.slug}`}
                          className="p-1.5 text-[#022c22] hover:bg-[#FAF5EC] border border-transparent hover:border-[#E0D2C0] rounded-lg transition"
                          title="Detail & Lampiran LPJ"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {isPengurus && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setQuickUploadEventId(quickUploadEventId === e.id ? null : e.id)
                              }
                              className="p-1.5 text-emerald-800 hover:bg-[#FAF5EC] border border-transparent hover:border-[#E0D2C0] rounded-lg transition"
                              title="Unggah File Baru Langsung"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(e)}
                              className="p-1.5 text-[#022c22] hover:bg-[#FAF5EC] border border-transparent hover:border-[#E0D2C0] rounded-lg transition"
                              title="Edit Acara"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(e.id, e.title)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Hapus Acara"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/agenda/${e.slug}`}
                      className="font-bold text-[#022c22] hover:text-emerald-800 transition text-sm sm:text-base block pr-6"
                    >
                      {e.title}
                    </Link>

                    <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDateWIB(e.start_date)}</span>
                      </div>
                      {e.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{e.location}</span>
                        </div>
                      )}
                      {e.pic_name && (
                        <div className="flex items-center space-x-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>PIC: {e.pic_name}</span>
                        </div>
                      )}

                      {e.meeting_link && (
                        <div className="pt-1">
                          <a
                            href={e.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#022c22] hover:bg-emerald-900 text-amber-200 border border-emerald-800 rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
                          >
                            <Video className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                            <span>Gabung Google Meet</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {quickUploadEventId === e.id && isPengurus && (
                      <form
                        onSubmit={handleQuickUploadSubmit}
                        className="mt-3 p-3 bg-white border border-[#E0D2C0] rounded-xl space-y-2 animate-in fade-in duration-200"
                      >
                        <input type="hidden" name="event_id" value={e.id} />
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-extrabold text-[#022c22] uppercase">
                            Unggah Dokumen Baru
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuickUploadEventId(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <select
                          name="doc_types"
                          defaultValue="lpj_kegiatan"
                          className="w-full py-2 px-2.5 text-xs border border-[#EFE8DC] rounded-lg bg-[#FAF7F2] text-[#022c22] font-semibold"
                        >
                          <option value="kerangka">Kerangka</option>
                          <option value="proposal">Proposal</option>
                          <option value="surat_menyurat">Surat Menyurat (SK, SI, SU)</option>
                          <option value="lpj_kegiatan">LPJ Kegiatan</option>
                          <option value="lpj_keuangan">LPJ Keuangan</option>
                          <option value="evaluasi">Evaluasi</option>
                          <option value="dokumentasi">Dokumentasi</option>
                        </select>

                        <input
                          type="file"
                          name="files"
                          required
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                          className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#FAF5EC] file:text-[#022c22] border border-[#EFE8DC] rounded-lg p-1"
                        />

                        <button
                          type="submit"
                          disabled={formLoading}
                          className="w-full py-2.5 bg-[#FAF5EC] hover:bg-[#F0E6D8] border border-[#E0D2C0] text-[#022c22] font-extrabold text-xs rounded-lg transition shadow-2xs flex items-center justify-center space-x-1"
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-800" />
                          <span>{formLoading ? 'Mengunggah...' : 'Upload Dokumen Ini'}</span>
                        </button>
                      </form>
                    )}
                  </div>
                ))
              ) : (
                /* WADAH EMPTY STATE RAPI & TERSTRUKTUR */
                <div className="text-center py-8 px-4 my-1 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E0D2C0] space-y-3">
                  <div className="w-12 h-12 bg-[#FAF5EC] border border-[#E0D2C0] rounded-2xl flex items-center justify-center mx-auto text-emerald-800 shadow-2xs">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#022c22]">Belum ada agenda</p>
                    <p className="text-xs text-slate-500">Tidak ada kegiatan yang terdaftar pada tanggal ini.</p>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER ACTION BUTTONS RAPI SIMETRIS */}
            <div className="shrink-0 pt-3.5 border-t border-[#EFE8DC] flex flex-col-reverse sm:flex-row items-center justify-end gap-2 bg-[#FFFDF9] pb-safe">
              <button
                type="button"
                onClick={() => setSelectedDateEvents(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-[#022c22] bg-[#FAF7F2] hover:bg-[#F3EBE0] border border-[#EFE8DC] rounded-xl transition"
              >
                Tutup
              </button>

              {isPengurus && (
                <button
                  type="button"
                  onClick={() => handleOpenAddForm()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#022c22] hover:bg-emerald-900 text-amber-200 border border-emerald-800 active:scale-[0.98] rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition shadow-xs"
                >
                  <Plus className="w-4 h-4 text-amber-200" />
                  <span>Tambah Acara di Tanggal Ini</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT ACARA */}
      {isFormModalOpen && isPengurus && (
        <div className="fixed inset-0 bg-[#022c22]/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleFormSubmit}
            className="bg-[#FFFDF9] rounded-t-3xl sm:rounded-2xl border border-[#EFE8DC] max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            <div className="w-12 h-1.5 bg-[#EFE8DC] rounded-full mx-auto sm:hidden -mt-1 mb-2 shrink-0"></div>

            <div className="flex justify-between items-center border-b border-[#EFE8DC] pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-[#022c22] text-base sm:text-lg">
                  {editingEvent ? 'Edit Acara Kegiatan' : 'Tambah Acara Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingEvent ? 'Perbarui informasi kegiatan' : 'Lengkapi formulir kegiatan HIMA Kedokteran'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-[#FAF5EC] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Judul Acara *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingEvent?.title || ''}
                  placeholder="Contoh: SEMINAR KESEHATAN NASIONAL"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Divisi *
                  </label>
                  <select
                    name="category_id"
                    defaultValue={editingEvent?.category_id || ''}
                    className="w-full px-3 py-2.5 text-base sm:text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22] font-semibold"
                  >
                    <option value="">-- Pilih Divisi --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingEvent?.status || 'published'}
                    className="w-full px-3 py-2.5 text-base sm:text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22]"
                  >
                    <option value="published">Dipublikasikan</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    required
                    defaultValue={prefilledDateOnly}
                    className="w-full px-3 py-2.5 text-base sm:text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jam (WIB) *
                  </label>
                  <input
                    type="time"
                    name="event_time"
                    required
                    defaultValue={prefilledTimeOnly}
                    className="w-full px-3 py-2.5 text-base sm:text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22] font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Lokasi *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    defaultValue={editingEvent?.location || ''}
                    placeholder="Contoh: Auditorium / Google Meet"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    PIC *
                  </label>
                  <input
                    type="text"
                    name="pic_name"
                    required
                    defaultValue={editingEvent?.pic_name || ''}
                    placeholder="Contoh: Salma"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Link Google Meet / Rapat Online (Opsional)
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-800" />
                  <input
                    type="url"
                    name="meeting_link"
                    defaultValue={editingEvent?.meeting_link || ''}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingEvent?.description || ''}
                  placeholder="Catatan ringkas kegiatan..."
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm border border-[#EFE8DC] rounded-xl focus:ring-2 focus:ring-emerald-700/40 focus:outline-none bg-[#FAF7F2] text-[#022c22]"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#EFE8DC] space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-emerald-900 uppercase flex items-center space-x-1.5">
                    <Upload className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Lampirkan Dokumen LPJ & Berkas</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAttachmentRow}
                    className="text-xs font-extrabold text-emerald-800 bg-[#FAF5EC] hover:bg-[#F0E6D8] border border-[#E0D2C0] px-2.5 py-1.5 rounded-lg transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah File</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {attachmentRows.map((row, idx) => (
                    <div
                      key={row.id}
                      className="p-2.5 border border-[#EFE8DC] rounded-xl bg-[#FAF7F2] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          File #{idx + 1}
                        </span>
                        <div className="flex items-center space-x-2">
                          <select
                            name="doc_types"
                            defaultValue={row.docType}
                            className="py-1 px-2 text-xs border border-[#EFE8DC] rounded-lg bg-white focus:outline-none text-[#022c22] font-semibold"
                          >
                            <option value="kerangka">Kerangka</option>
                            <option value="proposal">Proposal</option>
                            <option value="surat_menyurat">Surat Menyurat (SK, SI, SU)</option>
                            <option value="lpj_kegiatan">LPJ Kegiatan</option>
                            <option value="lpj_keuangan">LPJ Keuangan</option>
                            <option value="evaluasi">Evaluasi</option>
                            <option value="dokumentasi">Dokumentasi</option>
                          </select>

                          {attachmentRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachmentRow(row.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-md transition"
                              title="Hapus baris file ini"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="file"
                        name="files"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FAF5EC] file:text-[#022c22] file:border file:border-[#E0D2C0] hover:file:bg-[#F0E6D8] border border-[#EFE8DC] rounded-lg p-1 bg-white cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 pt-3 border-t border-[#EFE8DC] flex justify-end space-x-2.5 bg-[#FFFDF9] pb-safe">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-[#022c22] bg-[#F3EBE0] hover:bg-[#E8DDD0] border border-[#DCD0C0] rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2.5 text-xs font-extrabold text-[#022c22] bg-[#FAF5EC] hover:bg-[#F0E6D8] border border-[#E0D2C0] active:scale-[0.98] rounded-xl transition flex items-center space-x-2 shadow-xs"
              >
                {formLoading ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-800" />
                    <span>{editingEvent ? 'Simpan Perubahan' : 'Simpan Acara'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}