# Admin Analytics Panel

## Overview

Admin panel embedded in the application at `/admin` route. Provides comprehensive analytics for user activity, AI usage costs, and system health metrics.

## Setup Instructions

### 1. Run Database Migrations

Execute the SQL migrations in Supabase:

```bash
# Apply migrations in order:
supabase migration up
```

Or manually run these files in Supabase SQL Editor:
- `supabase/migrations/20250103_add_admin_role.sql` - Creates admin role system
- `supabase/migrations/20250103_create_analytics_tables.sql` - Creates analytics tables

### 2. Set First Admin User

After migrations, run this SQL command to make yourself an admin:

```sql
SELECT public.set_admin_role(
  'YOUR_USER_ID_HERE'::uuid  -- Get your user_id from auth.users table
);
```

Or update directly:
```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### 3. Access Admin Panel

1. Login to the application
2. Navigate to `/admin`
3. You should see the admin dashboard

## Features

### Overview Page (`/admin`)
- Key metrics: active users, total tasks, AI requests today, AI costs
- User activity chart (line chart)
- AI usage distribution (pie chart)
- Top projects table
- Auto-refresh toggle (30s interval)
- Time range selector (24h, 7d, 30d)

### AI Analytics Page (`/admin/analytics`)
- Total AI requests, total cost, average cost per request
- Cost breakdown by AI model (bar chart)
- Cost forecast with predictions (line chart)
- Efficiency metrics (success rate, tokens/request, cache efficiency)
- Top AI users table
- Optimization recommendations
- CSV export

### Users Page (`/admin/users`)
- Risk alerts for inactive users
- Key metrics: total users, new users, active today, avg session time
- Geography distribution (pie chart)
- Retention chart (bar chart)
- Users table with search and filters
- Status indicators (active/at-risk)
- CSV export

### System Page (`/admin/system`)
- System health: uptime, avg response time, storage, errors/hour
- API performance (P50/P95/P99 percentiles)
- Error rate over time
- Supabase resource usage (database, auth, storage, functions)
- Error logs with investigation status
- System trends forecast

## Architecture

### Database Tables

#### `public.users`
- Extends `auth.users` with role column
- Roles: 'user' (default), 'admin'
- RLS policies for access control

#### `analytics_events`
- Tracks all user activity events
- Event types: task_created, task_moved, column_added, ai_suggestion_used, etc.
- Properties stored as JSONB

#### `ai_usage_logs`
- Tracks AI API usage
- Model, operation, tokens, costs
- Per-user cost tracking

#### `user_sessions`
- User session tracking
- Duration, page views, actions count
- Engagement analytics

### Helper Functions

SQL functions available:
- `public.is_admin()` - Check if current user is admin
- `public.track_analytics_event()` - Log analytics event
- `public.track_ai_usage()` - Log AI usage
- `public.start_user_session()` - Start session tracking
- `public.end_user_session()` - End session tracking

### Route Protection

Middleware (`src/middleware.ts`) protects `/admin` routes:
- Checks authentication
- Verifies admin role
- Redirects non-admins to home

## Next Steps

### TODO: Implement Analytics Tracking

Add event tracking throughout the app:

```typescript
// Example: Track task creation
await supabase.rpc('track_analytics_event', {
  p_event_type: 'task_created',
  p_properties: { task_id: taskId, column_id: columnId }
})

// Example: Track AI usage
await supabase.rpc('track_ai_usage', {
  p_model: 'gpt-4o-mini',
  p_operation: 'suggestion_generation',
  p_input_tokens: 150,
  p_output_tokens: 50,
  p_cost_usd: 0.0003,
  p_board_id: boardId
})
```

### TODO: Implement CSV Export

Add CSV export functionality to tables:

```typescript
const exportToCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h])).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
```

### TODO: Connect Real Data

Replace mock data with real API calls:

```typescript
// Example: Fetch analytics from Supabase
const { data: analytics } = await supabase
  .from('analytics_events')
  .select('*')
  .gte('created_at', getStartDate(timeRange))
```

## Security Notes

1. Admin role is required for `/admin` access
2. RLS policies protect analytics data
3. Only admins can view all analytics
4. Users can only view their own AI usage logs
5. Middleware provides route-level protection

## Color Scheme

- Background: `#121218`
- Card background: `#1a1a20`
- Border: `#374151`, `#4b5563`
- Primary: `#3b82f6` (blue)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (yellow)
- Error: `#ef4444` (red)
- Text: `#ffffff` (primary), `#9ca3af` (secondary), `#6b7280` (muted)

## Tech Stack

- Next.js 15 App Router
- Supabase (PostgreSQL, Auth, RLS)
- Recharts (charts)
- TypeScript
- Tailwind CSS
- Lucide React (icons)
