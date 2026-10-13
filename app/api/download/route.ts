import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get('url')
  const fileName = searchParams.get('name') || 'dokumen'

  if (!rawUrl) {
    return new NextResponse('URL berkas tidak ditemukan', { status: 400 })
  }

  try {
    let targetUrl = rawUrl

    // Ambil URL valid jika terdapat duplikasi http
    if (targetUrl.includes('http')) {
      const lastHttpIndex = targetUrl.lastIndexOf('http')
      targetUrl = targetUrl.substring(lastHttpIndex)
    }

    const response = await fetch(targetUrl)
    if (!response.ok) {
      return new NextResponse('Gagal mengambil berkas dari storage', { status: response.status })
    }

    const blob = await response.blob()
    const headers = new Headers()

    headers.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream')
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