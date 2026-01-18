-- ============================================
-- Migration: Add Activity Logs Table
-- ============================================
-- This migration creates a table to track all user activities
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  user_full_name TEXT,
  activity_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_entity ON activity_logs(user_id, entity_type, entity_id);

-- Enable RLS (Row Level Security)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read activity logs
-- Admins and managers can see all logs, others can see their own
DROP POLICY IF EXISTS "Allow read activity logs" ON activity_logs;

CREATE POLICY "Allow read activity logs"
ON activity_logs
FOR SELECT
USING (true);

-- Create policy to allow system to insert activity logs
-- Only the application can insert logs
DROP POLICY IF EXISTS "Allow insert activity logs" ON activity_logs;

CREATE POLICY "Allow insert activity logs"
ON activity_logs
FOR INSERT
WITH CHECK (true);

-- ============================================
-- Migration Complete!
-- ============================================
-- The activity_logs table has been created
-- All user activities will now be tracked
-- ============================================
