-- =====================================================
-- Fix: boards.user_id FK race condition
-- =====================================================
--
-- PROBLEM (Fixed):
-- When a new user registered, the app tried to create their first board
-- before the handle_new_user() trigger could create a record in public.users.
-- This caused: "Foreign key constraint violation on boards_user_id_fkey"
--
-- ROOT CAUSE:
-- boards.user_id was referencing public.users(id), but records in public.users
-- are created asynchronously by a trigger on auth.users INSERT.
-- The app (useBoardData.ts:105-119) creates a board immediately after
-- authentication, before the trigger completes.
--
-- SOLUTION:
-- Change FK to reference auth.users(id) directly.
-- auth.users record exists immediately upon registration,
-- eliminating the race condition.
--
-- =====================================================

-- Drop old FK constraint (if exists)
ALTER TABLE boards DROP CONSTRAINT IF EXISTS boards_user_id_fkey;

-- Add new FK referencing auth.users directly
-- This eliminates race condition because auth.users record
-- is available immediately upon registration
ALTER TABLE boards
  ADD CONSTRAINT boards_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- =====================================================
-- NOTES:
-- =====================================================
--
-- 1. public.users table still exists and is still used for:
--    - Storing user role (admin/user)
--    - Storing additional profile data (full_name)
--    - The is_admin() function checks public.users.role
--
-- 2. The handle_new_user() trigger still runs and creates
--    profiles in public.users, but this is no longer blocking
--    for board creation.
--
-- 3. RLS policies on boards use auth.uid() = user_id which
--    works correctly with both auth.users and public.users
--    references since IDs are the same.
--
-- 4. All other tables already reference auth.users(id):
--    - analytics_events.user_id -> auth.users(id)
--    - ai_usage_logs.user_id -> auth.users(id)
--    - user_sessions.user_id -> auth.users(id)
--    - suggestions.user_id -> auth.users(id)
--    - public.users.id -> auth.users(id)
--
-- =====================================================
