-- ============================================
-- Clear Database (Keep Users Only)
-- ============================================
-- This script deletes all data from all tables
-- except the users table (system users)
-- 
-- WARNING: This will permanently delete all data!
-- Run this in your Supabase SQL Editor
-- ============================================

-- Disable foreign key checks temporarily (if needed)
SET session_replication_role = 'replica';

-- Delete all invoices
DELETE FROM invoices;

-- Delete all guests
DELETE FROM guests;

-- Delete all travel companies
DELETE FROM travel_companies;

-- Delete all invoice items
DELETE FROM invoice_items;

-- Delete all bank details
DELETE FROM bank_details;

-- Delete all activity logs
DELETE FROM activity_logs;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- ============================================
-- Database Cleared!
-- ============================================
-- All data has been deleted except users table
-- Users table remains intact with all system users
-- ============================================
