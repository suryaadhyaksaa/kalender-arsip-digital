'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const category_id = formData.get('category_id') as string
  const start_date = formData.get('start_date') as string
  const end_date = (formData.get('end_date') as string) || start_date
  const location = formData.get('location') as string
  const pic_name = formData.get('pic_name') as string
  const description = formData.get('description') as string
  const status = (formData.get('status') as string) || 'published'
  const file = formData.get('file') as File | null
  const rawDocType = (formData.get('doc_type') as string) || 'lpj'
  const doc_type = rawDocType.toLowerCase()

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
    status,
  }

  const { data: newEvent, error } = await (supabase.from('events') as any)
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error('Gagal membuat acara: ' + error.message)

  if (file && file.size > 0 && newEvent) {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${newEvent.id}/${Date.now()}_${sanitizedFileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: true })

    if (uploadError) {
      throw new Error('Gagal unggah file ke Storage: ' + uploadError.message)
    }

    const { error: docError } = await (supabase.from('documents') as any).insert({
      event_id: newEvent.id,
      title: `${title} - ${doc_type.toUpperCase()}`,
      doc_type: doc_type,
      file_type: fileExt,
      file_path: filePath,
      file_size: file.size,
      is_public: true,
    })

    if (docError) {
      throw new Error('Gagal menyimpan data arsip dokumen: ' + docError.message)
    }
  }

  revalidatePath('/kalender')
  revalidatePath('/')
  revalidatePath('/arsip')
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const category_id = formData.get('category_id') as string
  const start_date = formData.get('start_date') as string
  const end_date = (formData.get('end_date') as string) || start_date
  const location = formData.get('location') as string
  const pic_name = formData.get('pic_name') as string
  const description = formData.get('description') as string
  const status = (formData.get('status') as string) || 'published'
  const file = formData.get('file') as File | null
  const rawDocType = (formData.get('doc_type') as string) || 'lpj'
  const doc_type = rawDocType.toLowerCase()

  const payload = {
    title,
    category_id: category_id || null,
    start_date,
    end_date,
    location,
    pic_name,
    description,
    status,
    updated_at: new Date().toISOString(),
  }

  const { error } = await (supabase.from('events') as any)
    .update(payload)
    .eq('id', id)

  if (error) throw new Error('Gagal memperbarui acara: ' + error.message)

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${id}/${Date.now()}_${sanitizedFileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: true })

    if (uploadError) {
      throw new Error('Gagal unggah file ke Storage: ' + uploadError.message)
    }

    const { error: docError } = await (supabase.from('documents') as any).insert({
      event_id: id,
      title: `${title} - ${doc_type.toUpperCase()}`,
      doc_type: doc_type,
      file_type: fileExt,
      file_path: filePath,
      file_size: file.size,
      is_public: true,
    })

    if (docError) {
      throw new Error('Gagal menyimpan data arsip dokumen: ' + docError.message)
    }
  }

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