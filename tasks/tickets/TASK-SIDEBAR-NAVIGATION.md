# TASK: Sidebar Navigation Improvements

**Assigned to:** Web Agent (Remote Claude Code)
**Created:** 2025-12-28
**Priority:** HIGH
**Branch:** `claude/sidebar-navigation-fix` (create from `claude/fix-phase-3-bugs-auto-jJadF`)
**Base branch:** `claude/fix-phase-3-bugs-auto-jJadF`

---

## Quick Start

```bash
# 1. Checkout the fix branch first
git fetch origin
git checkout claude/fix-phase-3-bugs-auto-jJadF
git pull origin claude/fix-phase-3-bugs-auto-jJadF

# 2. Create new branch for navigation fixes
git checkout -b claude/sidebar-navigation-fix

# 3. Read this file and understand what needs to be done
cat tasks/tickets/TASK-SIDEBAR-NAVIGATION.md
```

---

## Problem Analysis

Current navigation buttons in `src/widgets/sidebar/ui/Sidebar.tsx`:

| Button | Current Behavior | Problem |
|--------|------------------|---------|
| **Канбан** | `setSearchQuery("")` | Works, but same as "Все задачи" |
| **Все задачи** | `setSearchQuery("")` | DUPLICATE - does the same as "Канбан" |
| **Команда** | Opens modal with mock data | Shows fake users (Евгений, Анна, Иван) |
| **Отчет** | Shows alert with stats | Works, but alert is ugly |

---

## Tasks

### 1. Remove Duplicate Button (EASY)

**Remove:** "Все задачи" button

**Why:** It's a duplicate of "Канбан" - both do `setSearchQuery("")`

**Files:** `src/widgets/sidebar/ui/Sidebar.tsx:15-19`

**Action:**
- Remove `{ icon: ListTodo, label: "Все задачи", id: "all-tasks" }` from navItems
- Remove case "all-tasks" from handleNavClick switch

---

### 2. Fix "Команда" Button (MEDIUM - Choose One)

**Option A: Remove temporarily** (EASIEST)
- Remove button from navItems
- Add TODO comment to implement later when team features are needed

**Option B: Implement properly** (MORE WORK)
- Create `team_members` table in Supabase
- Add CRUD operations (add/remove team members)
- Load from Supabase instead of mock data
- Allow assigning tasks to team members

**Recommendation:** Start with Option A (remove), implement Option B later when needed

**Files:**
- `src/widgets/sidebar/ui/Sidebar.tsx:16`
- `src/entities/task/model/store.ts` (mockMembers)
- `src/features/team/ui/TeamModal.tsx`

---

### 3. Improve "Отчет" (OPTIONAL - LOW PRIORITY)

**Current:** Shows alert with text

**Better:** Show in a nice modal component

**Files:** `src/widgets/sidebar/ui/Sidebar.tsx:79-95`

**Action:**
- Create `ReportModal.tsx` component
- Show stats in a beautiful formatted table
- Add export button

**Note:** This is optional - current alert works, just ugly

---

## Success Criteria

- [ ] "Все задачи" button removed (duplicate eliminated)
- [ ] "Команда" button either:
  - Removed temporarily, OR
  - Implemented with real Supabase data
- [ ] "Канбан" and "Отчет" still work
- [ ] No console errors
- [ ] Manual test: all buttons work

---

## Minimal Changes Approach

**Phase 1 (Do this first):**
1. Remove "Все задачи" button
2. Remove "Команда" button (temporarily)
3. Test that remaining buttons work

**Phase 2 (Only if requested):**
4. Implement proper team management
5. Improve report modal

---

## Testing

```bash
npm run dev
# Test each button:
# - Click "Канбан" → should show all tasks
# - Click "Отчет" → should show statistics
# - Verify removed buttons are gone
```

---

## Example: Removing Buttons

```typescript
// Before:
const navItems = [
  { icon: LayoutDashboard, label: "Канбан", id: "kanban" },
  { icon: Users, label: "Команда", id: "team" },
  { icon: ListTodo, label: "Все задачи", id: "all-tasks" },  // REMOVE THIS
  { icon: PieChart, label: "Отчет", id: "reports" },
];

// After:
const navItems = [
  { icon: LayoutDashboard, label: "Канбан", id: "kanban" },
  { icon: PieChart, label: "Отчет", id: "reports" },
];
```

---

## What NOT to do

- ❌ Don't add complex routing (Next.js router) - not needed yet
- ❌ Don't create new pages - keep it single page for now
- ❌ Don't over-engineer - minimal changes only
- ❌ Don't implement team features unless explicitly requested

---

## After Completion

```bash
git add .
git commit -m "fix: remove duplicate navigation buttons, clean up sidebar"
git push origin claude/sidebar-navigation-fix
```

---

**Estimated time:** 30 minutes for Phase 1 (removal only)
**Estimated time:** 2-3 hours for Phase 2 (full team implementation)

**Start with Phase 1 - keep it simple!**
