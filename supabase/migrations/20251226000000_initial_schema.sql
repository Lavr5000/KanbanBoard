-- Initial schema for Kanban Board 2.0
-- Created: 2025-12-26
-- Description: Creates tables for profiles, boards, columns, and tasks

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- PROFILES TABLE
-- ========================================
-- Stores user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- ========================================
-- BOARDS TABLE
-- ========================================
-- Stores kanban boards owned by users
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT boards_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Add RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Indexes for boards
CREATE INDEX IF NOT EXISTS boards_user_id_idx ON boards(user_id);
CREATE INDEX IF NOT EXISTS boards_created_at_idx ON boards(created_at DESC);

-- ========================================
-- COLUMNS TABLE
-- ========================================
-- Stores columns within boards
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT columns_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 50),
  CONSTRAINT columns_position_positive CHECK (position >= 0)
);

-- Add RLS
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

-- Indexes for columns
CREATE INDEX IF NOT EXISTS columns_board_id_idx ON columns(board_id);
CREATE INDEX IF NOT EXISTS columns_position_idx ON columns(board_id, position);

-- ========================================
-- TASKS TABLE
-- ========================================
-- Stores tasks within columns
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  deadline TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT tasks_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT tasks_priority_valid CHECK (priority IN ('low', 'medium', 'high')),
  CONSTRAINT tasks_position_positive CHECK (position >= 0)
);

-- Add RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS tasks_column_id_idx ON tasks(column_id);
CREATE INDEX IF NOT EXISTS tasks_board_id_idx ON tasks(board_id);
CREATE INDEX IF NOT EXISTS tasks_position_idx ON tasks(column_id, position);
CREATE INDEX IF NOT EXISTS tasks_deadline_idx ON tasks(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);

-- ========================================
-- UPDATED_AT TRIGGER FUNCTION
-- ========================================
-- Automatically updates updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_columns_updated_at
  BEFORE UPDATE ON columns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INITIAL DATA
-- ========================================
-- Note: Users will be created via Supabase Auth
-- This section is for any initial seed data if needed

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Initial schema created successfully!';
  RAISE NOTICE 'Next step: Configure RLS policies in 20251226000001_rls_policies.sql';
END $$;
