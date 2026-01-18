-- ============================================
-- Database Reset Script
-- ============================================
-- This script resets all data except the users table
-- The admin user and all system users will be preserved
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Disable foreign key checks temporarily (if needed)
-- Note: Supabase/PostgreSQL doesn't have foreign keys between these tables
-- but we'll delete in the correct order to be safe

-- 1. Delete all invoices (this is the main data table)
DELETE FROM invoices;

-- 2. Delete all guests
DELETE FROM guests;

-- 3. Delete all bank details
DELETE FROM bank_details;

-- 4. Delete all saved invoice items
DELETE FROM invoice_items;

-- 5. Reset sequences (if any exist)
-- Note: Only reset if you want IDs to start from 1 again
-- Uncomment the following lines if you want to reset auto-increment sequences:

-- ALTER SEQUENCE IF EXISTS invoices_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS guests_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS bank_details_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS invoice_items_id_seq RESTART WITH 1;

-- Verify the reset
-- Check that users table still has data
SELECT 
    'Users count' as table_name,
    COUNT(*) as record_count
FROM users;

-- Check that other tables are empty
SELECT 
    'Invoices count' as table_name,
    COUNT(*) as record_count
FROM invoices
UNION ALL
SELECT 
    'Guests count' as table_name,
    COUNT(*) as record_count
FROM guests
UNION ALL
SELECT 
    'Bank Details count' as table_name,
    COUNT(*) as record_count
FROM bank_details
UNION ALL
SELECT 
    'Invoice Items count' as table_name,
    COUNT(*) as record_count
FROM invoice_items;

-- ============================================
-- Reset Complete!
-- ============================================
-- All data has been deleted except system users
-- Your admin user should still be able to log in
-- ============================================
