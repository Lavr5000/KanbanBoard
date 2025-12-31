-- Create table for AI-generated suggestions
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  improved_title TEXT,
  description TEXT,
  acceptance_criteria JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_applied BOOLEAN DEFAULT FALSE
);

-- Index for faster lookups by task_id
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_task_id ON ai_suggestions(task_id);

-- Index for getting latest suggestion per task
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_created_at ON ai_suggestions(created_at DESC);
