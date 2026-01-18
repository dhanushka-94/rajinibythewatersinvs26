-- Quick fix: Disable RLS on hotel_info table
-- This is needed because the application uses custom cookie-based authentication
-- Permission checks are handled by middleware, not RLS

-- Disable RLS
ALTER TABLE hotel_info DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view hotel info" ON hotel_info;
DROP POLICY IF EXISTS "Allow admin users to update hotel info" ON hotel_info;
