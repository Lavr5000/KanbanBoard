# Roadmap Design - Kanban Board 2.0

**Date:** 2025-12-26
**Status:** Approved
**Author:** Claude Code

---

## Overview

This document outlines the roadmap for evolving Kanban Board 2.0 from a local-only application to a production-ready, cloud-based solution with comprehensive testing.

**Priority Areas:**
1. Backend & Data Persistence (Supabase)
2. Technical Quality & Testing

**Usage Model:** Personal use with future team collaboration capabilities

---

## Phase 1: Supabase Integration

### Goal
Migrate from local state (localStorage + Zustand) to cloud-based PostgreSQL database with user authentication.

### Database Schema

```sql
-- Tables
profiles (id, email, full_name, avatar_url, created_at)
boards (id, user_id, name, created_at, updated_at)
columns (id, board_id, title, order, created_at)
tasks (id, column_id, board_id, title, description, priority, deadline, order, created_at, updated_at)

-- Priority enum: 'low' | 'medium' | 'high' | 'critical'
```

### RLS Policies
- Users can read/write only their own boards
- All operations secured through Row Level Security

### Architecture Changes

**Before (Zustand-only):**
```typescript
const { tasks } = useBoardStore()
```

**After (Supabase + Zustand hybrid):**
```typescript
// Server Components
const tasks = await getTasks(boardId)

// Client Components
const { tasks, isLoading } = useTasks(boardId)

// Zustand for UI state only
const { searchQuery, isModalOpen } = useBoardStore()
```

### Data Flow

**Initial Load:**
```
Server Component → Supabase Query → Initial HTML with data
```

**Client Interactions:**
```
User Action → Optimistic Update → Supabase Mutation → Realtime Confirmation
```

### Realtime Subscriptions

Subscribe to board changes for multi-device sync:
```typescript
supabase
  .channel(`board:${boardId}`)
  .on('postgres_changes', { event: '*', table: 'tasks' }, handleUpdate)
  .subscribe()
```

### Optimistic Updates

Instant UI feedback with automatic rollback on error:
```typescript
async function moveTask(taskId, newColumnId) {
  const previousState = store.getState()
  store.setTaskColumn(taskId, newColumnId) // Optimistic

  try {
    await supabase.from('tasks').update({ column_id: newColumnId })
  } catch {
    store.setState(previousState) // Rollback
  }
}
```

---

## Phase 2: Testing

### Unit Tests (Vitest + React Testing Library)

**Structure:**
```
src/__tests__/
  ├── unit/
  │   ├── store/
  │   ├── lib/
  │   └── features/
  └── components/
      ├── TaskCard.test.tsx
      ├── Column.test.tsx
      └── Modal.test.tsx
```

**Coverage Target:** 70%+ for business logic

**Tested Areas:**
- UI components (render, interactions)
- Zustand store actions (UI state only)
- Utilities (cn merge, date formatting)
- Custom hooks
- Query functions (with mocked Supabase)

### E2E Tests (Playwright)

**Scenarios:**

**Basic:**
1. Create new task
2. Move task between columns
3. Edit task
4. Delete task with confirmation
5. Search tasks

**Auth:**
6. User login
7. User registration
8. Logout

**Data-driven:**
9. Task persists after page reload
10. Changes sync across browsers (realtime)

**Configuration:**
- Browsers: chromium, firefox
- Workers: 1 (avoid race conditions)
- Test database with seed data

---

## Phase 3: Production Ready

### Error Handling

**Error Boundaries:**
```typescript
// app/error.tsx
- Network errors (Supabase connection)
- Auth errors (unauthorized, session expired)
- Validation errors (invalid data)
- Runtime errors
```

### Graceful Degradation

**1. Offline Mode:**
- Queue changes when offline
- Sync when connection restored
- UI indicator for offline state

**2. Timeout Handling:**
- Timeout wrapper for Supabase queries
- Retry logic with exponential backoff

**3. Realtime Reconnect:**
- Auto-reconnect on connection loss
- Exponential backoff
- "Connection restored" indicator

### Loading States

**Skeletons:**
- TaskCardSkeleton
- ColumnSkeleton
- BoardSkeleton

**Spinners:**
- Create task button
- Modal save button
- Form submission

### Validation

**Client-side (Zod):**
```typescript
taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  deadline: z.date().optional(),
})
```

**Server-side (PostgreSQL):**
```sql
CHECK constraints for priority, title length, etc.
```

---

## Phase 4: Monitoring & CI/CD

### Monitoring (Sentry)

**Tracked:**
- JavaScript errors in browser
- Server-side errors
- Performance metrics (FCP, LCP)
- User sessions for error reproduction

### CI/CD Pipeline (GitHub Actions)

**Stages:**
1. **Lint** - ESLint, TypeScript check
2. **Unit Tests** - Vitest with coverage
3. **E2E Tests** - Playwright on chromium
4. **Build** - Next.js production build
5. **Deploy** - Auto-deploy to Vercel (main branch)

### Deployment

**Vercel Integration:**
- Auto-deploy on merge to main
- Preview deploys for PRs
- Environment variables via dashboard
- Custom domain (optional)

**Required Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SENTRY_DSN
```

---

## Future: Team Features (Phase 5+)

**Planned but not prioritized:**
- Multi-user boards
- Task assignment
- Comments on tasks
- Activity feed
- Advanced permissions (roles)

---

## Implementation Order

See [tasks/todo.md](../tasks/todo.md) for detailed step-by-step implementation plan.

---

## Tech Stack Summary

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (UI state only)
- Framer Motion
- DnD Kit

**Backend:**
- Supabase (PostgreSQL, Auth, Realtime)

**Testing:**
- Vitest + React Testing Library
- Playwright

**Infrastructure:**
- Vercel (hosting)
- Sentry (monitoring)
- GitHub Actions (CI/CD)

---

## Success Criteria

- ✅ All data persisted in Supabase
- ✅ Users can authenticate
- ✅ Realtime sync across devices
- ✅ 70%+ test coverage
- ✅ All tests pass in CI/CD
- ✅ Production-ready error handling
- ✅ Monitoring configured
- ✅ Documentation complete
