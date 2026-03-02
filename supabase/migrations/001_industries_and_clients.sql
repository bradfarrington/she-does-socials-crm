-- ============================================
-- Industries Table
-- ============================================

CREATE TABLE IF NOT EXISTS industries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  colour TEXT NOT NULL DEFAULT 'text-warm-600',
  bg TEXT NOT NULL DEFAULT 'bg-warm-100',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with default industries
INSERT INTO industries (name, slug, colour, bg, sort_order) VALUES
  ('Beauty', 'beauty', 'text-rose-600', 'bg-rose-50', 1),
  ('Hospitality', 'hospitality', 'text-brand-700', 'bg-brand-50', 2),
  ('Fitness', 'fitness', 'text-sage-600', 'bg-sage-50', 3),
  ('Therapy', 'therapy', 'text-lavender-500', 'bg-lavender-50', 4),
  ('Education', 'education', 'text-blue-600', 'bg-blue-50', 5),
  ('Travel', 'travel', 'text-cyan-600', 'bg-cyan-50', 6),
  ('Events', 'events', 'text-pink-600', 'bg-pink-50', 7),
  ('Retail', 'retail', 'text-amber-600', 'bg-amber-50', 8),
  ('Food & Drink', 'food_drink', 'text-orange-600', 'bg-orange-50', 9),
  ('Health', 'health', 'text-emerald-600', 'bg-emerald-50', 10),
  ('Other', 'other', 'text-warm-600', 'bg-warm-100', 11);

-- RLS
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read industries" ON industries FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert industries" ON industries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update industries" ON industries FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete industries" ON industries FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- Clients Table
-- ============================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  location TEXT,
  location_type TEXT CHECK (location_type IN ('local', 'national', 'online')),
  is_priority BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  notes TEXT,
  -- Branding
  brand_colours TEXT[] DEFAULT '{}',
  brand_voice TEXT[] DEFAULT '{}',
  words_love TEXT,
  words_avoid TEXT,
  -- Social
  platforms TEXT[] DEFAULT '{}',
  posting_frequency TEXT,
  -- Goals
  success_definition TEXT,
  focus TEXT[] DEFAULT '{}',
  short_term_campaigns TEXT,
  long_term_vision TEXT,
  comfortable_on_camera TEXT CHECK (comfortable_on_camera IN ('yes', 'no', 'sometimes')),
  preferred_content_types TEXT[] DEFAULT '{}',
  content_boundaries TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id);
