-- ============================================
-- Packages Table
-- ============================================

CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('monthly', 'one_off', 'coaching', 'digital_product')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  deliverables TEXT[] DEFAULT '{}',
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own packages" ON packages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own packages" ON packages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own packages" ON packages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own packages" ON packages FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Add package_id to clients
-- ============================================

ALTER TABLE clients ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES packages(id) ON DELETE SET NULL;
