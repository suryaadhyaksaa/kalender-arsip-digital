'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function ensureWIBOffset(dateStr: string) {
  if (!dateStr) return dateStr
  if (!dateStr.includes('+') && !dateStr.endsWith('Z')) {
    const hasSeconds = dateStr.split('T')[1]?.split(':').length === 3
    return `${dateStr}${hasSeconds ? '' : ':00'}+07:00`
  }
  return dateStr
}

async function handleFileUploads(
  supabase: any,
  eventId: string,
  eventTitle: string,
  formData: FormData
) {
  let files = formData.getAll('files') as File[]
  let docTypes = formData.getAll('doc_types') as string[]

  const singleFile = formData.get('file') as File | null
  const singleDocType = formData.get('doc_type') as string | null

  if ((!files || files.length === 0 || (files.length === 1 && files[0].size === 0)) && singleFile && singleFile.size > 0) {
    files = [singleFile]
    docTypes = [singleDocType || 'lpj_kegiatan']
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const docType = docTypes[i] || docTypes[0] || 'lpj_kegiatan'

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${eventId}/${Date.now()}_${i}_${sanitizedFileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (uploadError) {
        throw new Error(`Gagal unggah file "${file.name}": ${uploadError.message}`)
      }

      const formattedDocTypeLabel = docType.replace(/_/g, ' ').toUpperCase()

      const { error: docError } = await (supabase.from('documents') as any).insert({
        event_id: eventId,
        title: `${eventTitle} - ${formattedDocTypeLabel}`,
        doc_type: docType,
        file_type: fileExt,
        file_path: filePath,
        file_size: file.size,
        is_public: true,
      })

      if (docError) {
        throw new Error(`Gagal menyimpan data arsip dokumen "${file.name}": ${docError.message}`)
      }
    }
  }
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const category_id = formData.get('category_id') as string
  
  const raw_start_date = formData.get('start_date') as string
  const start_date = ensureWIBOffset(raw_start_date)
  
  const raw_end_date = (formData.get('end_date') as string) || raw_start_date
  const end_date = ensureWIBOffset(raw_end_date)

  const location = formData.get('location') as string
  const pic_name = formData.get('pic_name') as string
  const description = formData.get('description') as string
  const meeting_link = (formData.get('meeting_link') as string) || null
  const status = (formData.get('status') as string) || 'published'

  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
    '-' +
    Date.now().toString().slice(-4)

  const payload = {
    title,
    slug,
    category_id: category_id || null,
    start_date,
    end_date,
    location,
    pic_name,
    description,
    meeting_link,
    status,
  }

  const { data: newEvent, error } = await (supabase.from('events') as any)
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error('Gagal membuat acara: ' + error.message)

  if (newEvent) {
    await handleFileUploads(supabase, newEvent.id, title, formData)
  }

  revalidatePath('/kalender')
  revalidatePath('/')
  revalidatePath('/arsip')
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const category_id = formData.get('category_id') as string
  
  const raw_start_date = formData.get('start_date') as string
  const start_date = ensureWIBOffset(raw_start_date)
  
  const raw_end_date = (formData.get('end_date') as string) || raw_start_date
  const end_date = ensureWIBOffset(raw_end_date)

  const location = formData.get('location') as string
  const pic_name = formData.get('pic_name') as string
  const description = formData.get('description') as string
  const meeting_link = (formData.get('meeting_link') as string) || null
  const status = (formData.get('status') as string) || 'published'

  const payload = {
    title,
    category_id: category_id || null,
    start_date,
    end_date,
    location,
    pic_name,
    description,
    meeting_link,
    status,
    updated_at: new Date().toISOString(),
  }

  const { error } = await (supabase.from('events') as any)
    .update(payload)
    .eq('id', id)

  if (error) throw new Error('Gagal memperbarui acara: ' + error.message)

  await handleFileUploads(supabase, id, title, formData)

  revalidatePath('/kalender')
  revalidatePath('/')
  revalidatePath('/arsip')
}

export async function quickUploadDocument(formData: FormData) {
  const supabase = await createClient()
  const event_id = formData.get('event_id') as string

  if (!event_id) throw new Error('ID Kegiatan tidak ditemukan.')

  const { data: eventData } = await (supabase.from('events') as any)
    .select('title')
    .eq('id', event_id)
    .single()

  const eventTitle = eventData?.title || 'Kegiatan'
  await handleFileUploads(supabase, event_id, eventTitle, formData)

  revalidatePath('/kalender')
  revalidatePath('/')
  revalidatePath('/arsip')
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()

  await (supabase.from('documents') as any).delete().eq('event_id', id)
  const { error } = await (supabase.from('events') as any).delete().eq('id', id)

  if (error) throw new Error('Gagal menghapus acara: ' + error.message)

  revalidatePath('/kalender')
  revalidatePath('/')
  revalidatePath('/arsip')
}