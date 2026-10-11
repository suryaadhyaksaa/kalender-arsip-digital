export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'superadmin'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'admin' | 'superadmin'
          created_at?: string
        }
        Update: {
          full_name?: string
          role?: 'admin' | 'superadmin'
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          color_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color_code?: string
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
          color_code?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          category_id: string | null
          start_date: string
          end_date: string
          location: string
          pic_name: string
          pic_contact: string | null
          status: 'draft' | 'published' | 'cancelled'
          poster_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          category_id?: string | null
          start_date: string
          end_date: string
          location: string
          pic_name: string
          pic_contact?: string | null
          status?: 'draft' | 'published' | 'cancelled'
          poster_url?: string | null
          created_by?: string | null
        }
        Update: {
          title?: string
          slug?: string
          description?: string | null
          category_id?: string | null
          start_date?: string
          end_date?: string
          location?: string
          pic_name?: string
          pic_contact?: string | null
          status?: 'draft' | 'published' | 'cancelled'
          poster_url?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          event_id: string
          title: string
          doc_type: 'surat_keputusan' | 'notulen' | 'panduan' | 'laporan' | 'materi' | 'lainnya'
          description: string | null
          file_path: string
          file_type: string
          file_size: number
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          doc_type?: 'surat_keputusan' | 'notulen' | 'panduan' | 'laporan' | 'materi' | 'lainnya'
          description?: string | null
          file_path: string
          file_type: string
          file_size: number
          is_public?: boolean
        }
        Update: {
          title?: string
          doc_type?: 'surat_keputusan' | 'notulen' | 'panduan' | 'laporan' | 'materi' | 'lainnya'
          description?: string | null
          file_path?: string
          is_public?: boolean
        }
      }
    }
  }
}

export type EventWithCategory = Database['public']['Tables']['events']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null
}

export type DocumentRow = Database['public']['Tables']['documents']['Row']