import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileUrl = searchParams.get('url')
  const fileName = searchParams.get('name') || 'dokumen'

  if (!fileUrl) {
    return new NextResponse('URL berkas tidak ditemukan', { status: 400 })
  }

  try {
    // Sanitasi URL jika terdapat penumpukan skema http/https
    let targetUrl = fileUrl
    if (targetUrl.includes('http')) {
      const lastHttpIndex = targetUrl.lastIndexOf('http')
      if (lastHttpIndex > 0) {
        targetUrl = targetUrl.substring(lastHttpIndex)
      }
    }

    // Ambil berkas dari Supabase Storage
    const response = await fetch(targetUrl)
    if (!response.ok) {
      return new NextResponse('Gagal mengambil berkas dari server', { status: response.status })
    }

    const blob = await response.blob()
    const headers = new Headers()
    
    headers.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream')
    // Header wajib untuk memaksa browser langsung mengunduh berkas
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
    )

    return new NextResponse(blob, {
      status: 200,
      headers,
    })
  } catch (error) {
    return new NextResponse('Terjadi kesalahan saat mengunduh berkas', { status: 500 })
  }
}