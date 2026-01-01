-- Enable RLS on roadmaps table
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Users can read roadmaps only for their own boards
CREATE POLICY "Users can read roadmaps for their boards"
ON roadmaps FOR SELECT
USING (
  board_id IN (
    SELECT id FROM boards WHERE user_id = auth.uid()
  )
);

-- Users can insert roadmaps only for their own boards
CREATE POLICY "Users can insert roadmaps for their boards"
ON roadmaps FOR INSERT
WITH CHECK (
  board_id IN (
    SELECT id FROM boards WHERE user_id = auth.uid()
  )
);

-- Users can update roadmaps only for their own boards
CREATE POLICY "Users can update roadmaps for their boards"
ON roadmaps FOR UPDATE
USING (
  board_id IN (
    SELECT id FROM boards WHERE user_id = auth.uid()
  )
);

-- Users can delete roadmaps only for their own boards
CREATE POLICY "Users can delete roadmaps for their boards"
ON roadmaps FOR DELETE
USING (
  board_id IN (
    SELECT id FROM boards WHERE user_id = auth.uid()
  )
);
