-- Function to get daily activity data
CREATE OR REPLACE FUNCTION get_daily_activity(start_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
  date TEXT,
  users BIGINT,
  tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_STRING(created_at, 'DD-MM') AS date,
    COUNT(DISTINCT user_id) AS users,
    COUNT(*) FILTER (WHERE event_type = 'task_created') AS tasks
  FROM analytics_events
  WHERE created_at >= start_date
  GROUP BY TO_STRING(created_at, 'DD-MM')
  ORDER BY MIN(created_at);
END;
$$ LANGUAGE plpgsql;

-- Alternative simpler version using DATE_TRUNC
CREATE OR REPLACE FUNCTION get_daily_activity_v2(start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days')
RETURNS TABLE (
  date TEXT,
  users BIGINT,
  tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('day', created_at), 'MM-DD') AS date,
    COUNT(DISTINCT user_id) AS users,
    COUNT(*) FILTER (WHERE event_type = 'task_created')::BIGINT AS tasks
  FROM analytics_events
  WHERE created_at >= start_date
  GROUP BY DATE_TRUNC('day', created_at)
  ORDER BY DATE_TRUNC('day', created_at);
END;
$$ LANGUAGE plpgsql;
