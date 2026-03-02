-- ============================================
-- Extended Client Fields
-- ============================================

-- Contact Details: social handles
ALTER TABLE clients ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tiktok_handle TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Business Info: expanded
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_description TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS usp TEXT;

-- Content Wants & Needs
ALTER TABLE clients ADD COLUMN IF NOT EXISTS content_looking_for TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS content_not_working TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS content_themes TEXT;

-- 3 Month Strategy Plan
ALTER TABLE clients ADD COLUMN IF NOT EXISTS strategy_month_1_goal TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS strategy_month_1_actions TEXT[] DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS strategy_month_2_goal TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS strategy_month_2_actions TEXT[] DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS strategy_month_3_goal TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS strategy_month_3_actions TEXT[] DEFAULT '{}';
