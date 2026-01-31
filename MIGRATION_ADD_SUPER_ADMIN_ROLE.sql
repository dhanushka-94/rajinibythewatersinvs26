-- Add super_admin role support
-- 1. If users.role has a CHECK constraint, update it:
--    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
--    ALTER TABLE users ADD CONSTRAINT users_role_check 
--      CHECK (role IN ('super_admin','admin','manager','staff','viewer'));

-- 2. To promote an existing admin to super_admin (run with your user id):
--    UPDATE users SET role = 'super_admin' WHERE id = 'your-user-uuid';
