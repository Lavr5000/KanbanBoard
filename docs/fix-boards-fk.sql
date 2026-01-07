-- =====================================================
-- FIX: Change boards.user_id foreign key to reference auth.users
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE boards DROP CONSTRAINT IF EXISTS boards_user_id_fkey;

-- Step 2: Add foreign key directly to auth.users (not public.users)
-- This ensures the FK works immediately after signup, without waiting for trigger
ALTER TABLE boards
  ADD CONSTRAINT boards_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Verify the fix
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS references_table
FROM pg_constraint
WHERE conrelid = 'boards'::regclass
AND contype = 'f';
