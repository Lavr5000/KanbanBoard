# TASK: Fix Phase 3 Critical Bugs

**Assigned to:** Web Agent (Remote Claude Code)
**Created:** 2025-12-28
**Priority:** CRITICAL
**Branch:** `claude/fix-phase-3-bugs-auto`
**Base branch:** `claude/setup-supabase-TUKCP`

---

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/Lavr5000/0-KanBanDoska.git
cd 0-KanBanDoska
npm install

# 2. Checkout and create branch
git fetch origin
git checkout claude/setup-supabase-TUKCP
git pull origin claude/setup-supabase-TUKCP
git checkout -b claude/fix-phase-3-bugs-auto

# 3. Read the full ticket
cat tasks/tickets/TICKET-FIX-PHASE-3-AUTO.md
```

---

## Critical Bugs to Fix

### 1. Task Creation (CRITICAL)
**Problem:** Tasks don't appear immediately after creation
**Files:** `src/hooks/useBoardData.ts:194-218`, `src/widgets/board/ui/Board.tsx:40-41`
**Fix:** Use optimistic updates - update UI immediately, rollback on error

### 2. Drag & Drop (CRITICAL)
**Problem:** Tasks don't move immediately when dragged
**Files:** `src/hooks/useBoardData.ts:248-278`, `src/widgets/board/ui/Board.tsx:74-123`
**Fix:** Use optimistic state instead of waiting for Realtime

### 3. Login Redirect (HIGH)
**Problem:** No redirect to `/login` for unauthorized users
**Files:** `src/app/page.tsx`
**Fix:** Add `if (!user) redirect('/login')`

### 4. Navigation Buttons (HIGH)
**Problem:** Navigation buttons don't work
**Files:** `src/widgets/sidebar/ui/Sidebar.tsx:66-101`
**Fix:** Either implement routes or hide unused buttons

---

## Success Criteria

- [ ] Task creation works immediately (no page refresh needed)
- [ ] Drag & drop works immediately (no page refresh needed)
- [ ] Data persists after page refresh
- [ ] Unauthorized users redirect to `/login`
- [ ] All unit tests pass: `npm run test`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors

---

## Workflow

1. **Read full ticket:** `tasks/tickets/TICKET-FIX-PHASE-3-AUTO.md`
2. **Diagnose:** Run `npm run dev`, test manually, create diagnostic report
3. **Fix:** Apply fixes following the detailed plan in the ticket
4. **Test:** Run tests and verify manually
5. **Commit:** `git commit -m "Fix phase 3 bugs: task creation, drag & drop, navigation"`
6. **Push:** `git push origin claude/fix-phase-3-bugs-auto`

---

## Documentation

- Full ticket: `tasks/tickets/TICKET-FIX-PHASE-3-AUTO.md`
- Original bug list: `tasks/tickets/PHASE-3-BUGS-TICKET.md`
- Workflow: `WORKFLOW.md`
- Progress: `PROGRESS.md`

---

**After completion:** Create `PHASE_3_AUTO_FIX_REPORT.md` with results.
