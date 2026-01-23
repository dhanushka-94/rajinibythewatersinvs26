-- Create bookings table for guest booking management
-- This table stores booking information separate from invoices

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest JSONB NOT NULL, -- Primary guest information (for backward compatibility and quick access)
  guests JSONB, -- Additional guests array (optional)
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  room_type VARCHAR(100),
  adults INTEGER,
  children INTEGER,
  babies INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'booked', -- booked, confirmed, checked_in, checked_out, cancelled
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL, -- Link to invoice if created
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create index on booking_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);

-- Create index on guest_id for faster guest-related queries
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);

-- Create index on check_in and check_out for date range queries
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Create index on invoice_id for invoice linking
CREATE INDEX IF NOT EXISTS idx_bookings_invoice_id ON bookings(invoice_id);

-- Add comment to explain the table
COMMENT ON TABLE bookings IS 'Stores guest booking information separate from invoices. Bookings can be linked to invoices when invoices are created.';

-- Add comments to explain key columns
COMMENT ON COLUMN bookings.booking_number IS 'Unique booking reference number';
COMMENT ON COLUMN bookings.guest_id IS 'Reference to guests table (optional, for linking to guest profile)';
COMMENT ON COLUMN bookings.guest IS 'Primary guest information stored as JSONB (for quick access and backward compatibility)';
COMMENT ON COLUMN bookings.guests IS 'Array of additional guest objects (optional)';
COMMENT ON COLUMN bookings.status IS 'Booking status: booked, confirmed, checked_in, checked_out, cancelled';
COMMENT ON COLUMN bookings.invoice_id IS 'Link to invoice if an invoice has been created for this booking';

-- Note: RLS is disabled because this application uses custom cookie-based authentication
-- Permission checks are handled by middleware and API routes, not RLS
-- This matches the pattern used for other tables like hotel_info

-- Disable Row Level Security (RLS)
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
