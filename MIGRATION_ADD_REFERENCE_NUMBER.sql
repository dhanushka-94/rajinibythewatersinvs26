-- Add reference_number column to invoices table
-- This column stores the reference number when a travel company is selected

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS reference_number TEXT NULL;

COMMENT ON COLUMN invoices.reference_number IS 'Reference number for the invoice when billing to a travel company.';
