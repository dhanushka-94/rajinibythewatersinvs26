-- Comprehensive rate types for hotel pricing
-- Run after MIGRATION_RATE_TYPES.sql (or MIGRATION_HOTEL_ROOMS + MIGRATION_BOOKING_ROOMS + MIGRATION_RATE_TYPES)

-- Ensure rate_types table exists (from MIGRATION_RATE_TYPES.sql)
CREATE TABLE IF NOT EXISTS rate_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Insert all rate types (ON CONFLICT skips duplicates by name)
INSERT INTO rate_types (name, display_order) VALUES
  -- Room Only (RO) - 1-6
  ('Room Only – Single (RO)', 1),
  ('Room Only – Double (RO)', 2),
  ('Room Only – Twin (RO)', 3),
  ('Room Only – Triple (RO)', 4),
  ('Room Only – Quad (RO)', 5),
  ('Extra Person – Room Only (RO)', 6),
  -- Bed & Breakfast (BB) - 10-16
  ('Bed & Breakfast – Single (BB)', 10),
  ('Bed & Breakfast – Double (BB)', 11),
  ('Bed & Breakfast – Twin (BB)', 12),
  ('Bed & Breakfast – Triple (BB)', 13),
  ('Bed & Breakfast – Quad (BB)', 14),
  ('Extra Person – Bed & Breakfast (BB)', 15),
  -- Half Board (HB) - 20-26
  ('Half Board – Single (HB)', 20),
  ('Half Board – Double (HB)', 21),
  ('Half Board – Twin (HB)', 22),
  ('Half Board – Triple (HB)', 23),
  ('Half Board – Quad (HB)', 24),
  ('Extra Person – Half Board (HB)', 25),
  -- Full Board (FB) - 30-36
  ('Full Board – Single (FB)', 30),
  ('Full Board – Double (FB)', 31),
  ('Full Board – Twin (FB)', 32),
  ('Full Board – Triple (FB)', 33),
  ('Full Board – Quad (FB)', 34),
  ('Extra Person – Full Board (FB)', 35),
  -- All Inclusive (AI) - 40-45
  ('All Inclusive – Single (AI)', 40),
  ('All Inclusive – Double (AI)', 41),
  ('All Inclusive – Twin (AI)', 42),
  ('All Inclusive – Triple (AI)', 43),
  ('Extra Person – All Inclusive (AI)', 44),
  -- Ultra All Inclusive (UAI) - 50-53
  ('Ultra All Inclusive – Single (UAI)', 50),
  ('Ultra All Inclusive – Double (UAI)', 51),
  ('Extra Person – Ultra All Inclusive (UAI)', 52),
  -- Child rates - 60-75
  ('Child with Bed – Bed & Breakfast (BB)', 60),
  ('Child without Bed – Bed & Breakfast (BB)', 61),
  ('Child with Bed – Half Board (HB)', 62),
  ('Child without Bed – Half Board (HB)', 63),
  ('Child with Bed – Full Board (FB)', 64),
  ('Child without Bed – Full Board (FB)', 65),
  ('Child with Bed – All Inclusive (AI)', 66),
  ('Child without Bed – All Inclusive (AI)', 67),
  -- Meals only - 80-83
  ('Breakfast Only – Per Person', 80),
  ('Lunch Only – Per Person', 81),
  ('Dinner Only – Per Person', 82),
  -- Charges - 90-92
  ('Early Check-in Charge', 90),
  ('Late Check-out Charge', 91)
ON CONFLICT (name) DO NOTHING;
