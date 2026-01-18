-- ============================================
-- Migration: Add Travel Companies Support
-- ============================================
-- This migration adds support for billing to travel companies
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create travel_companies table
CREATE TABLE IF NOT EXISTS travel_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  phone2 TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  tax_id TEXT,
  contact_person TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_travel_companies_name ON travel_companies(name);
CREATE INDEX IF NOT EXISTS idx_travel_companies_email ON travel_companies(email);

-- Add billing_type and travel_company_id to invoices table
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'guest';

-- Add check constraint for billing_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_billing_type_check'
  ) THEN
    ALTER TABLE invoices
    ADD CONSTRAINT invoices_billing_type_check
    CHECK (billing_type IN ('guest', 'company'));
  END IF;
END $$;

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS travel_company_id UUID;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_travel_company_id_fkey'
  ) THEN
    ALTER TABLE invoices
    ADD CONSTRAINT invoices_travel_company_id_fkey
    FOREIGN KEY (travel_company_id) 
    REFERENCES travel_companies(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for travel_company_id
CREATE INDEX IF NOT EXISTS idx_invoices_travel_company_id ON invoices(travel_company_id);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE travel_companies ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Allow all operations on travel_companies" ON travel_companies;

CREATE POLICY "Allow all operations on travel_companies"
ON travel_companies
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_travel_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create it
DROP TRIGGER IF EXISTS update_travel_companies_updated_at ON travel_companies;

CREATE TRIGGER update_travel_companies_updated_at
BEFORE UPDATE ON travel_companies
FOR EACH ROW
EXECUTE FUNCTION update_travel_companies_updated_at();

-- ============================================
-- Migration Complete!
-- ============================================
-- The travel_companies table has been created
-- The invoices table now supports billing to companies
-- ============================================
