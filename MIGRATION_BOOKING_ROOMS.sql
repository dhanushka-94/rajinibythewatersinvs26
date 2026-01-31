-- Multiple rooms per booking: junction table replaces single room_id

-- 1. Create booking_rooms junction table
CREATE TABLE IF NOT EXISTS booking_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES hotel_rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id, room_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_rooms_booking_id ON booking_rooms(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_room_id ON booking_rooms(room_id);

COMMENT ON TABLE booking_rooms IS 'Many-to-many: bookings can have multiple rooms';

-- 2. Migrate existing room_id data to booking_rooms (if room_id column exists)
INSERT INTO booking_rooms (booking_id, room_id)
SELECT id, room_id FROM bookings
WHERE room_id IS NOT NULL
ON CONFLICT (booking_id, room_id) DO NOTHING;

-- 3. Drop room_id from bookings (room_type kept for display summary)
ALTER TABLE bookings DROP COLUMN IF EXISTS room_id;
