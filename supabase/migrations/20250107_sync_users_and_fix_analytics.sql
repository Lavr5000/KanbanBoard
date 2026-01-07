-- =============================================
-- Fix User Statistics: Sync existing users and add helper functions
-- =============================================

-- 1. Sync all existing auth.users to public.users (for users registered before trigger)
INSERT INTO public.users (id, email, full_name, created_at)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name',
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);

-- 2. Create function to count unique active users (fixes wrong count issue)
CREATE OR REPLACE FUNCTION get_unique_active_users_count(
  p_start_date TIMESTAMP WITH TIME ZONE
)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM analytics_events
    WHERE created_at >= p_start_date
      AND user_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to get users with activity stats
CREATE OR REPLACE FUNCTION get_users_with_activity(
  p_start_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  user_created_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  actions_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS user_id,
    COALESCE(u.email, au.email) AS email,
    u.full_name,
    u.created_at AS user_created_at,
    MAX(ae.created_at) AS last_activity,
    COUNT(ae.id)::BIGINT AS actions_count
  FROM public.users u
  LEFT JOIN auth.users au ON u.id = au.id
  LEFT JOIN analytics_events ae ON u.id = ae.user_id AND ae.created_at >= p_start_date
  GROUP BY u.id, u.email, au.email, u.full_name, u.created_at
  ORDER BY MAX(ae.created_at) DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to get total users count from auth.users (more accurate)
CREATE OR REPLACE FUNCTION get_total_users_count()
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM auth.users);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to get new users count
CREATE OR REPLACE FUNCTION get_new_users_count(
  p_start_date TIMESTAMP WITH TIME ZONE
)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM auth.users
    WHERE created_at >= p_start_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update handle_new_user to also update email if it changes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_unique_active_users_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_with_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_users_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_new_users_count TO authenticated;
