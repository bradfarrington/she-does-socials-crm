-- ============================================
-- Invoices Table
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'void')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_date DATE,
  recurring TEXT NOT NULL DEFAULT 'none' CHECK (recurring IN ('none', 'monthly', 'quarterly', 'yearly')),
  line_items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invoices" ON invoices FOR DELETE USING (auth.uid() = user_id);
