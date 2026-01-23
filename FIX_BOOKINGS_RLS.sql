-- Quick fix: Disable RLS on bookings table
-- This is needed because the application uses custom cookie-based authentication
-- Permission checks are handled by middleware and API routes, not RLS
-- This matches the pattern used for other tables like hotel_info

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view bookings" ON bookings;
DROP POLICY IF EXISTS "Admin, manager, and staff can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Admin, manager, and staff can update bookings" ON bookings;
DROP POLICY IF EXISTS "Admin and manager can delete bookings" ON bookings;

-- Disable RLS
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
