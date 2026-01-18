-- Add selected_bank_detail_ids column to invoices table for multiple bank account support
-- This column stores an array of bank detail IDs (JSONB array of UUIDs)

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS selected_bank_detail_ids JSONB NULL;

COMMENT ON COLUMN invoices.selected_bank_detail_ids IS 'Array of bank detail IDs (JSONB array of UUIDs) for multiple bank account support. Replaces selected_bank_detail_id for new invoices.';

-- Migrate existing data: convert single selected_bank_detail_id to array format
UPDATE invoices
SET selected_bank_detail_ids = jsonb_build_array(selected_bank_detail_id::text)
WHERE selected_bank_detail_id IS NOT NULL 
  AND selected_bank_detail_ids IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_selected_bank_detail_ids 
ON invoices USING GIN (selected_bank_detail_ids);
