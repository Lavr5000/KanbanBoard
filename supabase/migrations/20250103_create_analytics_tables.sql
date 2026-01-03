-- =============================================
-- Admin Analytics Tables Migration
-- =============================================

-- =============================================
-- Table: analytics_events
-- Stores all user activity events for analytics
-- =============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- e.g., 'task_created', 'task_moved', 'column_added', 'ai_suggestion_used'
  properties JSONB DEFAULT '{}', -- Additional event data (task_id, column_id, board_id, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Only admins can read analytics
CREATE POLICY "Admins can view analytics_events"
  ON analytics_events FOR SELECT
  USING (public.is_admin());

-- Service role can insert (via backend)
CREATE POLICY "Service can insert analytics_events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- =============================================
-- Table: ai_usage_logs
-- Tracks AI API usage for cost analysis
-- =============================================
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  model TEXT NOT NULL, -- e.g., 'gpt-4o-mini', 'claude-3-5-haiku-20241022'
  operation TEXT NOT NULL, -- e.g., 'suggestion_generation', 'roadmap_generation'
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  total_tokens INT GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  board_id UUID,
  metadata JSONB DEFAULT '{}', -- Additional context (success, error_message, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cost analysis queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_model ON ai_usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_board_id ON ai_usage_logs(board_id);

-- RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read AI usage logs
CREATE POLICY "Admins can view ai_usage_logs"
  ON ai_usage_logs FOR SELECT
  USING (public.is_admin());

-- Users can read their own AI usage (for transparency)
CREATE POLICY "Users can view own ai_usage_logs"
  ON ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert
CREATE POLICY "Service can insert ai_usage_logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (true);

-- =============================================
-- Table: user_sessions
-- Tracks user sessions for engagement analytics
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INT,
  page_views INT DEFAULT 1,
  actions_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}' -- browser, device, location, etc.
);

-- Indexes for session queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_started ON user_sessions(user_id, started_at DESC);

-- RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can read sessions
CREATE POLICY "Admins can view user_sessions"
  ON user_sessions FOR SELECT
  USING (public.is_admin());

-- Users can read their own sessions
CREATE POLICY "Users can view own user_sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert and update
CREATE POLICY "Service can manage user_sessions"
  ON user_sessions FOR ALL
  WITH CHECK (true);

-- =============================================
-- Helper Functions for Analytics
-- =============================================

-- Function to track analytics event
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_event_type TEXT,
  p_properties JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO analytics_events (user_id, event_type, properties)
  VALUES (auth.uid(), p_event_type, p_properties)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track AI usage
CREATE OR REPLACE FUNCTION track_ai_usage(
  p_model TEXT,
  p_operation TEXT,
  p_input_tokens INT DEFAULT 0,
  p_output_tokens INT DEFAULT 0,
  p_cost_usd DECIMAL(10,6) DEFAULT 0,
  p_board_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO ai_usage_logs (
    user_id, model, operation,
    input_tokens, output_tokens, cost_usd,
    board_id, metadata
  )
  VALUES (
    auth.uid(), p_model, p_operation,
    p_input_tokens, p_output_tokens, p_cost_usd,
    p_board_id, p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start user session
CREATE OR REPLACE FUNCTION start_user_session(
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO user_sessions (user_id, metadata)
  VALUES (auth.uid(), p_metadata)
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end user session
CREATE OR REPLACE FUNCTION end_user_session(
  p_session_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_sessions
  SET
    ended_at = NOW(),
    duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INT
  WHERE id = p_session_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment session page views
CREATE OR REPLACE FUNCTION increment_session_page_views(
  p_session_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_sessions
  SET page_views = page_views + 1
  WHERE id = p_session_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment session actions
CREATE OR REPLACE FUNCTION increment_session_actions(
  p_session_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_sessions
  SET actions_count = actions_count + 1
  WHERE id = p_session_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Views for Common Analytics Queries
-- =============================================

-- Daily active users
CREATE OR REPLACE VIEW daily_active_users AS
SELECT
  DATE(created_at) AS date,
  COUNT(DISTINCT user_id) AS active_users
FROM analytics_events
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- AI usage by user
CREATE OR REPLACE VIEW ai_usage_by_user AS
SELECT
  u.id AS user_id,
  u.email,
  COUNT(*) AS total_requests,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(cost_usd) AS total_cost_usd
FROM ai_usage_logs l
JOIN auth.users u ON l.user_id = u.id
GROUP BY u.id, u.email
ORDER BY total_cost_usd DESC;

-- AI usage by model
CREATE OR REPLACE VIEW ai_usage_by_model AS
SELECT
  model,
  COUNT(*) AS total_requests,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(cost_usd) AS total_cost_usd,
  AVG(cost_usd) AS avg_cost_per_request
FROM ai_usage_logs
GROUP BY model
ORDER BY total_cost_usd DESC;

-- Most common event types
CREATE OR REPLACE VIEW event_type_summary AS
SELECT
  event_type,
  COUNT(*) AS total_events,
  COUNT(DISTINCT user_id) AS unique_users,
  DATE(MAX(created_at)) AS last_occurrence
FROM analytics_events
GROUP BY event_type
ORDER BY total_events DESC;
