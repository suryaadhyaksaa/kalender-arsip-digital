'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Search, X, Calendar, MapPin, User, CheckCircle } from 'lucide-react'
import { createEvent, updateEvent, deleteEvent } from '@/app/actions/events'
import { formatDateWIB } from '@/lib/utils'

interface EventItem {
  id: string
  title: string
  start_date: string
  location: string
  pic_name: string
  description?: string
  status: string
  category_id?: string
  categories?: { name: string; color_code: string }
}

interface Category {
  id: string
  name: string
}

export default function EventManager({
  events,
  categories,
}: {
  events: EventItem[]
  categories: Category[]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(false)

  // Filter pencarian
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.pic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (event: EventItem) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus agenda "${title}"?`)) {
      setLoading(true)
      try {
        await deleteEvent(id)
      } catch (err: any) {
        alert('Gagal menghapus: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData)
      } else {
        await createEvent(formData)
      }
      setIsModalOpen(false)
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari agenda atau PIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Agenda Baru</span>
        </button>
      </div>

      {/* Tabel Agenda */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Judul Agenda</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Lokasi & PIC</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: item.categories?.color_code || '#0d9488' }}
                      >
                        {item.categories?.name || 'Umum'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {formatDateWIB(item.start_date)}
                    </td>
                    <td className="py-3.5 px-4 text-xs space-y-0.5">
                      <div className="flex items-center space-x-1 text-slate-700">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[150px]">{item.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{item.pic_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          item.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                        title="Edit Agenda"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Agenda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    Belum ada data agenda yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingEvent ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Judul Agenda *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingEvent?.title || ''}
                  placeholder="Contoh: Rapat Koordinasi Tahunan"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kategori
                  </label>
                  <select
                    name="category_id"
                    defaultValue={editingEvent?.category_id || ''}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Kategori --</option>
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
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Waktu Pelaksanaan (WIB) *
                </label>
                <input
                  type="datetime-local"
                  name="start_date"
                  required
                  defaultValue={
                    editingEvent?.start_date
                      ? new Date(editingEvent.start_date).toISOString().slice(0, 16)
                      : ''
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Lokasi *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    defaultValue={editingEvent?.location || ''}
                    placeholder="Ruang Rapat A / Online"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Penanggung Jawab (PIC) *
                  </label>
                  <input
                    type="text"
                    name="pic_name"
                    required
                    defaultValue={editingEvent?.pic_name || ''}
                    placeholder="Nama PIC"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Deskripsi / Catatan
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingEvent?.description || ''}
                  placeholder="Rincian singkat acara..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition flex items-center space-x-2"
                >
                  {loading ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{editingEvent ? 'Simpan Perubahan' : 'Tambah Agenda'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}