-- =====================================================
-- Row Level Security (RLS) Setup for Kanban Board
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/sqhtukwjmlaxuvemkydn/sql
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BOARDS POLICIES
-- =====================================================

-- Users can view only their own boards
CREATE POLICY "Users can view own boards"
  ON boards
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert boards with their own user_id
CREATE POLICY "Users can insert own boards"
  ON boards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own boards
CREATE POLICY "Users can update own boards"
  ON boards
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete only their own boards
CREATE POLICY "Users can delete own boards"
  ON boards
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- COLUMNS POLICIES
-- =====================================================

-- Users can view columns from their own boards
CREATE POLICY "Users can view columns from own boards"
  ON columns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can insert columns into their own boards
CREATE POLICY "Users can insert columns into own boards"
  ON columns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can update columns in their own boards
CREATE POLICY "Users can update columns in own boards"
  ON columns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can delete columns from their own boards
CREATE POLICY "Users can delete columns from own boards"
  ON columns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- =====================================================
-- TASKS POLICIES
-- =====================================================

-- Users can view tasks from their own boards
CREATE POLICY "Users can view tasks from own boards"
  ON tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can insert tasks into their own boards
CREATE POLICY "Users can insert tasks into own boards"
  ON tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can update tasks in their own boards
CREATE POLICY "Users can update tasks in own boards"
  ON tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Users can delete tasks from their own boards
CREATE POLICY "Users can delete tasks from own boards"
  ON tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- =====================================================
-- VERIFY SETUP
-- =====================================================

-- Check if RLS is enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('boards', 'columns', 'tasks');

-- Check policies
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
