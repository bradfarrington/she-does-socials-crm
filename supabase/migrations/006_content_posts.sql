-- ============================================
-- Content Posts
-- ============================================

CREATE TABLE IF NOT EXISTS content_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram','facebook','tiktok','linkedin')),
    content_type TEXT NOT NULL CHECK (content_type IN ('reel','carousel','static_post','story','live','email','blog')),
    status TEXT NOT NULL DEFAULT 'drafted' CHECK (status IN ('idea','planned','drafted','scheduled','live')),
    purpose TEXT CHECK (purpose IS NULL OR purpose IN ('educational','sales','community','authority')),
    scheduled_date DATE,
    scheduled_time TIME DEFAULT '09:00',
    caption TEXT,
    hook TEXT,
    cta TEXT,
    notes TEXT,
    media_urls TEXT[] DEFAULT '{}',
    meta_post_id TEXT,
    meta_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own posts" ON content_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON content_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON content_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON content_posts FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Supabase Storage bucket for post media
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for post-media bucket
CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-media');

CREATE POLICY "Anyone can read post media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can update own post media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can delete own post media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-media');
