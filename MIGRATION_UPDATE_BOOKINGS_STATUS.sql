-- Update bookings table to add "booked" status
-- This migration updates the existing bookings table to support the new "booked" status

-- Step 1: Update the default value for status column to 'booked'
ALTER TABLE bookings 
ALTER COLUMN status SET DEFAULT 'booked';

-- Step 2: Update the comment on the status column to include "booked"
COMMENT ON COLUMN bookings.status IS 'Booking status: booked, confirmed, checked_in, checked_out, cancelled';

-- Step 3 (Optional): Update any existing bookings with status 'confirmed' to 'booked'
-- Uncomment the line below if you want to migrate existing "confirmed" bookings to "booked"
-- UPDATE bookings SET status = 'booked' WHERE status = 'confirmed';

-- Step 4: Verify the update
-- Run this query to check the current status distribution:
-- SELECT status, COUNT(*) as count FROM bookings GROUP BY status ORDER BY status;
