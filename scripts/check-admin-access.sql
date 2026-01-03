-- =============================================
-- Admin Access Check & Fix Script
-- Run this in Supabase SQL Editor to diagnose issues
-- =============================================

-- 1. Check if your user exists in auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check if your user exists in public.users
SELECT id, email, full_name, role, created_at
FROM public.users
ORDER BY created_at DESC;

-- 3. Find users in auth but NOT in public.users (missing profiles)
SELECT
  au.id,
  au.email,
  'Missing profile' as issue
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 4. Test the is_admin() function
SELECT
  id,
  email,
  (SELECT public.is_admin()) as is_admin_result
FROM auth.users
LIMIT 5;

-- 5. Check RLS policies on users table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- 6. Fix: Create missing profiles for existing auth.users
INSERT INTO public.users (id, email, full_name, role)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name',
  'user'  -- default role
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- 7. Verify fix
SELECT id, email, role FROM public.users;

-- =============================================
-- AFTER RUNNING THIS SCRIPT:
-- 1. If you see your email in the results - good!
-- 2. Check if your role is 'admin' - if not, run:
--
--    UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
--
-- 3. Try accessing /admin again
-- =============================================
