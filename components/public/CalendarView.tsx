'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react'
import { formatDateWIB } from '@/lib/utils'

interface CalendarProps {
  events: any[]
}

export default function CalendarView({ events }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const resetToday = () => setCurrentDate(new Date())

  // Filter agenda untuk bulan aktif
  const filteredEvents = events.filter((e) => {
    const d = new Date(e.start_date)
    return d.getFullYear() === year && d.getMonth() === month
  })

  // Grouping event per hari untuk tampilan kalender grid
  const eventsByDay: { [key: number]: any[] } = {}
  filteredEvents.forEach((e) => {
    const day = new Date(e.start_date).getDate()
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push(e)
  })

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900 text-white">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-6 h-6 text-teal-400" />
          <h2 className="text-xl font-bold">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={resetToday}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-md border border-slate-700 transition"
          >
            Hari Ini
          </button>
          <div className="flex border border-slate-700 rounded-md overflow-hidden bg-slate-800">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-700 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-700 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex bg-slate-800 rounded-md p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Daftar
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === 'month' ? (
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden text-center text-xs font-semibold text-slate-600 mb-1">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="bg-slate-100 py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {/* Empty Offset Days */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[90px] sm:min-h-[110px]" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1
              const dayEvents = eventsByDay[dayNum] || []
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year

              return (
                <div
                  key={dayNum}
                  className={`bg-white min-h-[90px] sm:min-h-[110px] p-1.5 flex flex-col justify-between hover:bg-slate-50 transition ${
                    isToday ? 'ring-2 ring-teal-500 ring-inset bg-teal-50/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-teal-500 text-slate-950' : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] bg-slate-100 font-semibold text-slate-600 px-1.5 py-0.5 rounded">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1 overflow-y-auto max-h-[70px]">
                    {dayEvents.map((ev) => (
                      <Link
                        key={ev.id}
                        href={`/agenda/${ev.slug}`}
                        className="block text-[11px] p-1 rounded font-medium text-white truncate hover:opacity-90 transition"
                        style={{ backgroundColor: ev.categories?.color_code || '#0d9488' }}
                        title={ev.title}
                      >
                        {ev.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* List Mode */
        <div className="divide-y divide-slate-200">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((ev) => (
              <div key={ev.id} className="p-4 sm:p-6 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: ev.categories?.color_code || '#0d9488' }}
                    >
                      {ev.categories?.name || 'Umum'}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateWIB(ev.start_date)}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    <Link href={`/agenda/${ev.slug}`} className="hover:text-teal-600">
                      {ev.title}
                    </Link>
                  </h3>
                  <div className="flex items-center text-xs text-slate-500 gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{ev.location}</span>
                  </div>
                </div>

                <Link
                  href={`/agenda/${ev.slug}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 hover:border-slate-400 text-xs font-semibold rounded-lg text-slate-700 bg-white transition shrink-0"
                >
                  Lihat Detail Agenda
                </Link>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              Tidak ada agenda kegiatan pada bulan ini.
            </div>
          )}
        </div>
      )}
    </div>
  )
}