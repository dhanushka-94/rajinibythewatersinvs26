-- Add items column to bookings table for invoice items support
-- This column stores an array of invoice item objects (JSONB)

-- Add items column as JSONB (allows storing array of invoice item objects)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS items JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN bookings.items IS 'Array of invoice item objects for the booking (description, quantity, unitPrice, total, etc.)';

-- The column is nullable, so existing bookings will have NULL
-- New bookings can have an array of item objects or NULL if no items
