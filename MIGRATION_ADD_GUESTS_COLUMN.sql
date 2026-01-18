-- Add guests column to invoices table for multiple guests support
-- This column stores an array of guest objects (JSONB) for additional guests

-- Add guests column as JSONB (allows storing array of guest objects)
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS guests JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN invoices.guests IS 'Array of additional guest objects (for display only, shows names to save space)';

-- The column is nullable, so existing invoices will have NULL
-- New invoices can have an array of guest objects or NULL if no additional guests
