-- Add timestamps for booking status changes and early/late check-in/out fields
-- This migration adds fields to track when bookings change status and early/late check-in/out times

-- Add status change timestamps
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Add early check-in and late checkout fields
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS early_check_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS early_check_in_time TIME,
ADD COLUMN IF NOT EXISTS early_check_in_notes TEXT,
ADD COLUMN IF NOT EXISTS late_check_out BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS late_check_out_time TIME,
ADD COLUMN IF NOT EXISTS late_check_out_notes TEXT;

-- Add comments
COMMENT ON COLUMN bookings.booked_at IS 'Timestamp when booking status changed to booked';
COMMENT ON COLUMN bookings.confirmed_at IS 'Timestamp when booking status changed to confirmed';
COMMENT ON COLUMN bookings.checked_in_at IS 'Timestamp when booking status changed to checked_in';
COMMENT ON COLUMN bookings.checked_out_at IS 'Timestamp when booking status changed to checked_out';
COMMENT ON COLUMN bookings.cancelled_at IS 'Timestamp when booking status changed to cancelled';
COMMENT ON COLUMN bookings.early_check_in IS 'Whether guest checked in early';
COMMENT ON COLUMN bookings.early_check_in_time IS 'Time of early check-in';
COMMENT ON COLUMN bookings.early_check_in_notes IS 'Notes about early check-in';
COMMENT ON COLUMN bookings.late_check_out IS 'Whether guest checked out late';
COMMENT ON COLUMN bookings.late_check_out_time IS 'Time of late check-out';
COMMENT ON COLUMN bookings.late_check_out_notes IS 'Notes about late check-out';
