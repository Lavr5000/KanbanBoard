-- Enable RLS on ai_suggestions (the only remaining table without it)
-- Fixes: Supabase security alert "rls_disabled_in_public" (2026-03-23)

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read ai_suggestions for their tasks"
ON ai_suggestions FOR SELECT USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN boards b ON t.board_id = b.id
    WHERE b.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert ai_suggestions for their tasks"
ON ai_suggestions FOR INSERT WITH CHECK (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN boards b ON t.board_id = b.id
    WHERE b.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update ai_suggestions for their tasks"
ON ai_suggestions FOR UPDATE USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN boards b ON t.board_id = b.id
    WHERE b.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete ai_suggestions for their tasks"
ON ai_suggestions FOR DELETE USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN boards b ON t.board_id = b.id
    WHERE b.user_id = auth.uid()
  )
);
