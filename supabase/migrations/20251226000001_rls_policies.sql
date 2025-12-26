-- Row Level Security (RLS) Policies
-- Created: 2025-12-26
-- Description: Configures security policies to ensure users can only access their own data

-- ========================================
-- PROFILES POLICIES
-- ========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ========================================
-- BOARDS POLICIES
-- ========================================

-- Users can view their own boards
CREATE POLICY "Users can view own boards"
  ON boards
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own boards
CREATE POLICY "Users can insert own boards"
  ON boards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own boards
CREATE POLICY "Users can update own boards"
  ON boards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own boards
CREATE POLICY "Users can delete own boards"
  ON boards
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- COLUMNS POLICIES
-- ========================================

-- Users can view columns on their boards
CREATE POLICY "Users can view columns on own boards"
  ON columns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can insert columns on their boards
CREATE POLICY "Users can insert columns on own boards"
  ON columns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can update columns on their boards
CREATE POLICY "Users can update columns on own boards"
  ON columns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can delete columns on their boards
CREATE POLICY "Users can delete columns on own boards"
  ON columns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- ========================================
-- TASKS POLICIES
-- ========================================

-- Users can view tasks on their boards
CREATE POLICY "Users can view tasks on own boards"
  ON tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can insert tasks on their boards
CREATE POLICY "Users can insert tasks on own boards"
  ON tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can update tasks on their boards
CREATE POLICY "Users can update tasks on own boards"
  ON tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
      AND boards.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can delete tasks on their boards
CREATE POLICY "Users can delete tasks on own boards"
  ON tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- ========================================
-- HELPER FUNCTION FOR PROFILE CREATION
-- ========================================
-- Automatically create a profile when a user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies configured successfully!';
  RAISE NOTICE 'All tables are now secured with Row Level Security';
  RAISE NOTICE 'Users can only access their own data';
END $$;
