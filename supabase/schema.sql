-- Enable Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PROFILES (Terkoneksi dengan Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'superadmin')) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. TABEL CATEGORIES
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color_code TEXT DEFAULT '#0d9488' NOT NULL, -- Hex code untuk warna badge
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. TABEL EVENTS
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  pic_contact TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'cancelled')) DEFAULT 'draft' NOT NULL,
  poster_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. TABEL DOCUMENTS
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  doc_type TEXT CHECK (doc_type IN ('surat_keputusan', 'notulen', 'panduan', 'laporan', 'materi', 'lainnya')) DEFAULT 'lainnya' NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, docx, xlsx, pptx, jpg, png
  file_size BIGINT NOT NULL, -- dalam bytes
  is_public BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEKS UNTUK PERFORMA KEUERIAN
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_documents_event_id ON public.documents(event_id);
CREATE INDEX idx_documents_is_public ON public.documents(is_public);

-- AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- AUTOMATIC PROFILE CREATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email), 'admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories insertable by admin" ON public.categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Categories updatable by admin" ON public.categories FOR UPDATE USING (is_admin());
CREATE POLICY "Categories deletable by admin" ON public.categories FOR DELETE USING (is_admin());

-- Events Policies
CREATE POLICY "Published events viewable by public" ON public.events 
  FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "Events insertable by admin" ON public.events FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Events updatable by admin" ON public.events FOR UPDATE USING (is_admin());
CREATE POLICY "Events deletable by admin" ON public.events FOR DELETE USING (is_admin());

-- Documents Policies
CREATE POLICY "Public documents viewable by public" ON public.documents 
  FOR SELECT USING (
    (is_public = true AND EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = documents.event_id AND events.status = 'published'
    )) OR is_admin()
  );
CREATE POLICY "Documents insertable by admin" ON public.documents FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Documents updatable by admin" ON public.documents FOR UPDATE USING (is_admin());
CREATE POLICY "Documents deletable by admin" ON public.documents FOR DELETE USING (is_admin());

-- =========================================================
-- STORAGE BUCKETS & POLICIES
-- =========================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('posters', 'posters', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;

-- Policies Posters Bucket
CREATE POLICY "Posters Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'posters');
CREATE POLICY "Posters Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posters' AND is_admin());
CREATE POLICY "Posters Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'posters' AND is_admin());

-- Policies Documents Bucket
CREATE POLICY "Documents Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Documents Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND is_admin());
CREATE POLICY "Documents Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND is_admin());

-- =========================================================
-- SEED DATA DEMO (Ditandai Jelas)
-- =========================================================

INSERT INTO public.categories (name, slug, color_code) VALUES
('Akademik & Dies Natalis', 'akademik-dies-natalis', '#0d9488'),
('Seminar & Workshop', 'seminar-workshop', '#2563eb'),
('Rapat & Koordinasi', 'rapat-koordinasi', '#d97706'),
('Kegiatan Mahasiswa', 'kegiatan-mahasiswa', '#7c3aed')
ON CONFLICT (slug) DO NOTHING;

-- Seed Agenda Utama: Dies Natalis 2 November 2026
DO $$
DECLARE
  cat_id UUID;
BEGIN
  SELECT id INTO cat_id FROM public.categories WHERE slug = 'akademik-dies-natalis' LIMIT 1;

  INSERT INTO public.events (
    title, slug, description, category_id, start_date, end_date, location, pic_name, pic_contact, status
  ) VALUES (
    'Dies Natalis Ke-40 & Sidang Terbuka',
    'dies-natalis-ke-40-dan-sidang-terbuka',
    'Perayaan Puncak Dies Natalis ke-40 yang mencakup Orasi Ilmiah, Penganugerahan Penghargaan Alumni, dan Bazar Inovasi.',
    cat_id,
    '2026-11-02 08:00:00+07',
    '2026-11-02 16:00:00+07',
    'Auditorium Utama & Lapangan Tengah',
    'Dr. Ahmad Subagja, M.T.',
    '081234567890',
    'published'
  ) ON CONFLICT (slug) DO NOTHING;
END $$;