-- Secure Edit PINs: one PIN per user, for editing paid invoices / checked-out bookings
-- Admin assigns PINs to users. Only the owning user can use their PIN.

CREATE TABLE IF NOT EXISTS secure_edit_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_secure_edit_pins_user_id ON secure_edit_pins(user_id);

COMMENT ON TABLE secure_edit_pins IS 'PINs for secure edit (paid invoices, checked-out bookings). One per user.';
COMMENT ON COLUMN secure_edit_pins.user_id IS 'Owner of this PIN - only they can use it';
COMMENT ON COLUMN secure_edit_pins.pin_hash IS 'Bcrypt hash of the PIN';
