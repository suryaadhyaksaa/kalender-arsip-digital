'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Sanitasi nama file agar aman dari karakter khusus/spasi
function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_')
}

export async function createEvent(formData: FormData) {
  try {
    const supabase = await createClient()

    // 1. Ambil data formulir utama
    const title = formData.get('title') as string
    const category_id = (formData.get('category_id') as string) || null
    const status = (formData.get('status') as string) || 'published'
    const start_date = formData.get('start_date') as string
    const location = formData.get('location') as string
    const pic_name = formData.get('pic_name') as string
    const meeting_link = (formData.get('meeting_link') as string) || null
    const description = (formData.get('description') as string) || null

    if (!title || !start_date || !location || !pic_name) {
      return { success: false, error: 'Harap isi semua kolom wajib (*)' }
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now().toString().slice(-4)

    // 2. Simpan data acara ke tabel events
    const { data: event, error: eventError } = await (supabase.from('events') as any)
      .insert([
        {
          title,
          slug,
          category_id,
          status,
          start_date,
          location,
          pic_name,
          meeting_link,
          description,
        },
      ])
      .select()
      .single()

    if (eventError || !event) {
      return { success: false, error: `Gagal membuat acara: ${eventError?.message}` }
    }

    // 3. Proses upload multiple files
    const files = formData.getAll('files') as File[]
    const docTypes = formData.getAll('doc_types') as string[]

    if (files && files.length > 0) {
      let totalSize = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const docType = docTypes[i] || 'lpj_kegiatan'

        // Lewati input file kosong
        if (!file || !(file instanceof File) || file.size === 0 || !file.name) {
          continue
        }

        totalSize += file.size

        if (totalSize > 4 * 1024 * 1024) {
          return {
            success: false,
            error: 'Total ukuran berkas melebihi batas 4 MB. Harap unggah berkas satu per satu.',
          }
        }

        const fileExt = file.name.split('.').pop() || ''
        const rawName = file.name.substring(0, file.name.lastIndexOf('.'))
        const cleanName = sanitizeFilename(rawName)
        const fileName = `${Date.now()}_${cleanName}.${fileExt}`
        const filePath = `documents/${(event as any).id}/${fileName}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true,
          })

        if (uploadError) {
          return {
            success: false,
            error: `Gagal upload file "${file.name}": ${uploadError.message}`,
          }
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        const { error: docError } = await (supabase.from('documents') as any).insert([
          {
            event_id: (event as any).id,
            title: file.name,
            file_path: publicUrlData.publicUrl,
            doc_type: docType,
            file_size: file.size,
            file_type: file.type || fileExt || 'application/octet-stream',
          },
        ])

        if (docError) {
          console.error('Doc DB Error:', docError)
        }
      }
    }

    revalidatePath('/kalender')
    revalidatePath('/arsip')
    return { success: true, eventId: (event as any).id }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Terjadi kesalahan sistem.' }
  }
}

export async function updateEvent(id: string, formData: FormData) {
  try {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const category_id = (formData.get('category_id') as string) || null
    const status = (formData.get('status') as string) || 'published'
    const start_date = formData.get('start_date') as string
    const location = formData.get('location') as string
    const pic_name = formData.get('pic_name') as string
    const meeting_link = (formData.get('meeting_link') as string) || null
    const description = (formData.get('description') as string) || null

    const { error: eventError } = await (supabase.from('events') as any)
      .update({
        title,
        category_id,
        status,
        start_date,
        location,
        pic_name,
        meeting_link,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (eventError) {
      return { success: false, error: `Gagal memperbarui acara: ${eventError.message}` }
    }

    const files = formData.getAll('files') as File[]
    const docTypes = formData.getAll('doc_types') as string[]

    if (files && files.length > 0) {
      let totalSize = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const docType = docTypes[i] || 'lpj_kegiatan'

        if (!file || !(file instanceof File) || file.size === 0 || !file.name) {
          continue
        }

        totalSize += file.size
        if (totalSize > 4 * 1024 * 1024) {
          return {
            success: false,
            error: 'Total ukuran berkas melebihi batas 4 MB. Harap unggah berkas satu per satu.',
          }
        }

        const fileExt = file.name.split('.').pop() || ''
        const rawName = file.name.substring(0, file.name.lastIndexOf('.'))
        const cleanName = sanitizeFilename(rawName)
        const fileName = `${Date.now()}_${cleanName}.${fileExt}`
        const filePath = `documents/${id}/${fileName}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true,
          })

        if (uploadError) {
          return {
            success: false,
            error: `Gagal upload file "${file.name}": ${uploadError.message}`,
          }
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        await (supabase.from('documents') as any).insert([
          {
            event_id: id,
            title: file.name,
            file_path: publicUrlData.publicUrl,
            doc_type: docType,
            file_size: file.size,
            file_type: file.type || fileExt || 'application/octet-stream',
          },
        ])
      }
    }

    revalidatePath('/kalender')
    revalidatePath('/arsip')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal memperbarui acara.' }
  }
}

export async function deleteEvent(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await (supabase.from('events') as any).delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    revalidatePath('/kalender')
    revalidatePath('/arsip')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal menghapus acara.' }
  }
}

export async function quickUploadDocument(formData: FormData) {
  try {
    const supabase = await createClient()
    const event_id = formData.get('event_id') as string
    const doc_type = (formData.get('doc_types') as string) || 'lpj_kegiatan'
    const file = formData.get('files') as File

    if (!event_id || !file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: 'Berkas tidak valid atau kosong.' }
    }

    if (file.size > 4.5 * 1024 * 1024) {
      return { success: false, error: `Ukuran berkas "${file.name}" melebihi batas 4.5 MB.` }
    }

    const fileExt = file.name.split('.').pop() || ''
    const rawName = file.name.substring(0, file.name.lastIndexOf('.'))
    const cleanName = sanitizeFilename(rawName)
    const fileName = `${Date.now()}_${cleanName}.${fileExt}`
    const filePath = `documents/${event_id}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      })

    if (uploadError) {
      return { success: false, error: `Gagal upload berkas: ${uploadError.message}` }
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    const { error: docError } = await (supabase.from('documents') as any).insert([
      {
        event_id,
        title: file.name,
        file_path: publicUrlData.publicUrl,
        doc_type,
        file_size: file.size,
        file_type: file.type || fileExt || 'application/octet-stream',
      },
    ])

    if (docError) return { success: false, error: docError.message }

    revalidatePath('/kalender')
    revalidatePath('/arsip')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal mengunggah berkas.' }
  }
}