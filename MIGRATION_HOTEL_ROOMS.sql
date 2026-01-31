-- Hotel Rooms: CRUD for room management, used with bookings and invoices

CREATE TABLE IF NOT EXISTS hotel_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(50) NOT NULL UNIQUE,
  room_type VARCHAR(100) NOT NULL,
  rate_per_night DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  capacity INTEGER NOT NULL DEFAULT 2,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'disabled')),
  floor VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotel_rooms_status ON hotel_rooms(status);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_room_number ON hotel_rooms(room_number);

COMMENT ON TABLE hotel_rooms IS 'Hotel room definitions for bookings and invoices';
COMMENT ON COLUMN hotel_rooms.room_number IS 'Unique room identifier (e.g. 101, A1)';
COMMENT ON COLUMN hotel_rooms.room_type IS 'Type/category (e.g. Standard, Deluxe, Suite)';
COMMENT ON COLUMN hotel_rooms.rate_per_night IS 'Base rate per night for invoicing';

-- Add room_id to bookings (optional FK)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES hotel_rooms(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
