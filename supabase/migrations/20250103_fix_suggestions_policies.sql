-- Drop old policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view own suggestions" ON suggestions;
DROP POLICY IF EXISTS "Users can insert own suggestions" ON suggestions;
DROP POLICY IF EXISTS "Admins can view all suggestions" ON suggestions;
DROP POLICY IF EXISTS "Admins can update all suggestions" ON suggestions;

-- Create new policies using auth.uid() directly without accessing users table
CREATE POLICY "Users can view own suggestions"
  ON suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suggestions"
  ON suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- For admin policies, use a SECURITY DEFINER function approach
-- First, create a helper function that runs with definer rights
CREATE OR REPLACE FUNCTION is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Now use this function in policies
CREATE POLICY "Admins can view all suggestions"
  ON suggestions FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all suggestions"
  ON suggestions FOR UPDATE
  USING (is_user_admin(auth.uid()));
