-- ============================================
-- Client Logo & Active/Past Status
-- ============================================

-- Logo URL — stores the public URL of the uploaded logo image
ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Status — distinguishes active clients from past clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past'));

-- ============================================
-- Supabase Storage Bucket for Client Logos
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to client-logos
CREATE POLICY "Authenticated users can upload client logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-logos'
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update own client logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'client-logos'
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete own client logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'client-logos'
  AND auth.uid() IS NOT NULL
);

-- Allow public read access to client logos
CREATE POLICY "Public read access to client logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-logos');
