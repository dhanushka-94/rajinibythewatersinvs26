-- Offers & Promotions: Offers (grouping), Discounts (pricing logic), Coupon Codes (optional trigger)
-- Entity structure: Offer -> Discount -> Coupon Code
-- Discounts apply to Bookings and Invoices
--
-- Prerequisites: Run after MIGRATION_ADD_BOOKINGS_TABLE and invoices/guests exist.

-- 1. OFFERS (marketing/grouping only)
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_display_order ON offers(display_order);

-- 2. DISCOUNTS (pricing logic)
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  min_stay_nights INTEGER NOT NULL DEFAULT 0,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  blackout_dates JSONB DEFAULT '[]',
  max_total_usage INTEGER,
  max_usage_per_guest INTEGER,
  one_time_per_booking BOOLEAN NOT NULL DEFAULT false,
  one_time_per_guest BOOLEAN NOT NULL DEFAULT false,
  applicable_room_types JSONB DEFAULT '[]',
  applicable_rate_type_ids JSONB DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_discounts_offer_id ON discounts(offer_id);
CREATE INDEX IF NOT EXISTS idx_discounts_status ON discounts(status);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_dates ON discounts(valid_from, valid_until);

-- 3. COUPON CODES (optional trigger for Discount)
CREATE TABLE IF NOT EXISTS coupon_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_codes_discount_id ON coupon_codes(discount_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_codes_code_lower ON coupon_codes(LOWER(code));

-- 4. BOOKING_DISCOUNTS (tracks discount applied to booking)
CREATE TABLE IF NOT EXISTS booking_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE RESTRICT,
  coupon_code_id UUID REFERENCES coupon_codes(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  discount_amount DECIMAL(12, 2) NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value_used DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_discounts_booking_id ON booking_discounts(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_discounts_discount_id ON booking_discounts(discount_id);

-- 5. INVOICE_DISCOUNTS (tracks discount applied to invoice - final authority)
CREATE TABLE IF NOT EXISTS invoice_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE RESTRICT,
  coupon_code_id UUID REFERENCES coupon_codes(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  discount_amount DECIMAL(12, 2) NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value_used DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(invoice_id)
);

CREATE INDEX IF NOT EXISTS idx_invoice_discounts_invoice_id ON invoice_discounts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_discounts_discount_id ON invoice_discounts(discount_id);
CREATE INDEX IF NOT EXISTS idx_invoice_discounts_guest_id ON invoice_discounts(guest_id);

-- Check if guests table exists; if not, we may need to remove guest_id FK from booking_discounts/invoice_discounts
-- If guests table doesn't exist, run: ALTER TABLE booking_discounts DROP CONSTRAINT IF EXISTS booking_discounts_guest_id_fkey;
-- ALTER TABLE invoice_discounts DROP CONSTRAINT IF EXISTS invoice_discounts_guest_id_fkey;

COMMENT ON TABLE offers IS 'Marketing/grouping layer for discounts';
COMMENT ON TABLE discounts IS 'Discount definitions with pricing logic and restrictions';
COMMENT ON TABLE coupon_codes IS 'Optional codes to trigger a discount';
COMMENT ON TABLE booking_discounts IS 'Discount applied to booking (estimated)';
COMMENT ON TABLE invoice_discounts IS 'Discount applied to invoice (final authority)';
