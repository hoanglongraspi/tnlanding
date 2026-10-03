-- Rental House: equipment/items available for rent
CREATE TABLE IF NOT EXISTS rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_per_day NUMERIC(12, 0) NOT NULL DEFAULT 0,
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rentals_status_sort ON rentals(status, sort_order);

ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Same access model as the other CMS tables (portfolio, companies, ...)
DROP POLICY IF EXISTS "Allow all access to rentals" ON rentals;
CREATE POLICY "Allow all access to rentals" ON rentals FOR ALL USING (true) WITH CHECK (true);

-- Category used to group items on the Rental House page (Body, Lens, Đèn, ...)
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS category VARCHAR(100);
