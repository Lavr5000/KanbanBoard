-- Create suggestions table for user feedback
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'improvement', 'other')),
  content TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view own suggestions
CREATE POLICY "Users can view own suggestions"
  ON suggestions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own suggestions
CREATE POLICY "Users can insert own suggestions"
  ON suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions(category);

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('suggestions-screenshots', 'suggestions-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'suggestions-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'suggestions-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
