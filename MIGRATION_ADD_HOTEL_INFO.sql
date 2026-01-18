-- Create hotel_info table (singleton - only one record)
CREATE TABLE IF NOT EXISTS hotel_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  telephone TEXT,
  hotline TEXT,
  usa_contact TEXT,
  email TEXT,
  website TEXT,
  logo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default hotel info if table is empty
INSERT INTO hotel_info (
  name,
  address,
  city,
  country,
  telephone,
  hotline,
  usa_contact,
  email,
  website,
  logo_path
)
SELECT 
  'Rajini by The Waters',
  '437, Beralihela, Colony 6',
  'Tissamaharama',
  'Sri Lanka',
  '+94 76 374 1945',
  '+94 76 281 0000',
  '+1 818 984 7763',
  'bookings@rajinihotels.com',
  'www.rajinihotels.com',
  '/images/rajini-logo-flat-color.png'
WHERE NOT EXISTS (SELECT 1 FROM hotel_info);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hotel_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hotel_info_updated_at ON hotel_info;
CREATE TRIGGER hotel_info_updated_at
  BEFORE UPDATE ON hotel_info
  FOR EACH ROW
  EXECUTE FUNCTION update_hotel_info_updated_at();

-- Disable RLS (Row Level Security)
-- Permission checks are handled by the application middleware and API routes
-- The /settings route is already protected to admin-only access in middleware.ts
ALTER TABLE hotel_info DISABLE ROW LEVEL SECURITY;
