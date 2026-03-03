-- ============================================
-- Meta Business Suite Integration
-- ============================================

-- Stores the Meta (Facebook) OAuth connection for each user
CREATE TABLE IF NOT EXISTS meta_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  meta_user_id TEXT NOT NULL,
  meta_user_name TEXT,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE meta_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own meta connections" ON meta_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meta connections" ON meta_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meta connections" ON meta_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meta connections" ON meta_connections FOR DELETE USING (auth.uid() = user_id);

-- Add meta_page_id to clients to link a CRM client to a Meta Page
ALTER TABLE clients ADD COLUMN IF NOT EXISTS meta_page_id TEXT;
