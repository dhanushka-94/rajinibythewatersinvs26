-- Rate types (Room Only, Bed & Breakfast) with per-room prices

-- 1. Create rate_types table
CREATE TABLE IF NOT EXISTS rate_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_rate_types_display_order ON rate_types(display_order);

-- 2. Seed rate types (Room Only and Bed & Breakfast for migration compat; full list in MIGRATION_RATE_TYPES_UPDATE.sql)
INSERT INTO rate_types (name, display_order) VALUES
  ('Room Only', 1),
  ('Bed & Breakfast', 2)
ON CONFLICT (name) DO NOTHING;

-- 3. Create room_rates table (per-room, per-rate-type pricing)
CREATE TABLE IF NOT EXISTS room_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES hotel_rooms(id) ON DELETE CASCADE,
  rate_type_id UUID NOT NULL REFERENCES rate_types(id) ON DELETE CASCADE,
  rate_per_night DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, rate_type_id)
);

CREATE INDEX IF NOT EXISTS idx_room_rates_room_id ON room_rates(room_id);
CREATE INDEX IF NOT EXISTS idx_room_rates_rate_type_id ON room_rates(rate_type_id);

COMMENT ON TABLE room_rates IS 'Per-room pricing for each rate type (Room Only, Bed & Breakfast, etc.)';

-- 4. Migrate existing hotel_rooms.rate_per_night to room_rates (Room Only)
INSERT INTO room_rates (room_id, rate_type_id, rate_per_night, currency)
SELECT r.id, rt.id, COALESCE(r.rate_per_night, 0), COALESCE(r.currency, 'USD')
FROM hotel_rooms r
CROSS JOIN rate_types rt
WHERE rt.name = 'Room Only'
ON CONFLICT (room_id, rate_type_id) DO NOTHING;

-- 5. Add rate_type_id to booking_rooms (nullable for backward compat)
ALTER TABLE booking_rooms ADD COLUMN IF NOT EXISTS rate_type_id UUID REFERENCES rate_types(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_booking_rooms_rate_type_id ON booking_rooms(rate_type_id);
