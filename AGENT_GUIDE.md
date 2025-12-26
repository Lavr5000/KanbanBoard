# 🤖 Agent Command Guide

Quick reference for assigning tasks to AI agents (Local & Web).

---

## 📍 Current Project Status

**Project:** Kanban Board 2.0
**Current Phase:** Phase 1 - Supabase Setup (Not Started)
**Progress:** 0/88 tasks complete (0%)
**Repository:** https://github.com/Lavr5000/0-KanBanDoska

---

## 🎯 How to Assign Tasks

### For Local Agent (Claude Code CLI)

```
Implement Phase 1, Task 1.1: Create Supabase project

Context:
- Read tasks/progress.md for current state
- Read tasks/roadmap-supabase-testing.md for full task details
- Read docs/2025-12-26-roadmap-design.md for architecture

When done:
- Update tasks/progress.md (mark task as complete: [x])
- Commit with: "feat: create Supabase project"
- Push to GitHub
```

### For Web Agent

```
Clone repository: https://github.com/Lavr5000/0-KanBanDoska.git

Task: Implement Phase 1, Task 1.4 - Create Supabase client files

Files to read:
- tasks/progress.md (current state)
- tasks/roadmap-supabase-testing.md (task details)
- docs/2025-12-26-roadmap-design.md (architecture reference)

Files to create:
- lib/supabase/client.ts
- lib/supabase/server.ts

When done:
- Create pull request with changes
- Update tasks/progress.md
- Reference roadmap phase in commit message
```

---

## 📂 Key Files

### Documentation (READ FIRST)
- `tasks/progress.md` - **START HERE** - Current progress & status
- `tasks/roadmap-supabase-testing.md` - Full task checklist
- `docs/2025-12-26-roadmap-design.md` - Architecture design
- `README.md` - Project overview

### Code Structure
- `src/` - Source code (FSD architecture)
- `lib/` - Utility functions
- `app/` - Next.js pages

---

## 🔄 Workflow

### 1. Before Starting
```bash
# Always check current progress
cat tasks/progress.md

# Identify:
# - Current phase (first incomplete phase)
# - Next task (first unchecked item)
# - Dependencies (are prerequisites done?)
```

### 2. During Implementation
```bash
# Read design docs for context
cat docs/2025-12-26-roadmap-design.md

# Follow existing patterns
# Keep changes minimal
# Test as you go
```

### 3. After Completion
```bash
# Update progress
# - Edit tasks/progress.md
# - Change [ ] → [x] for completed task
# - Add implementation notes

# Commit changes
git add .
git commit -m "feat: [task description]"
git push origin main
```

---

## 📊 Phase Overview

| Phase | Tasks | Status | Can Start? |
|-------|-------|--------|------------|
| Phase 1: Supabase Setup | 13 | ⏳ Not Started | ✅ YES |
| Phase 2: Auth Integration | 8 | ⏸ Blocked | ❌ Wait for Phase 1 |
| Phase 3: Data Migration | 13 | ⏸ Blocked | ❌ Wait for Phase 2 |
| Phase 4: Unit Tests | 15 | ⏸ Blocked | ❌ Wait for Phase 3 |
| Phase 5: E2E Tests | 10 | ⏸ Blocked | ❌ Wait for Phase 3 |
| Phase 6: Production Ready | 13 | ⏸ Blocked | ❌ Wait for Phase 5 |
| Phase 7: CI/CD & Monitoring | 11 | ⏸ Blocked | ❌ Wait for Phase 6 |
| Phase 8: Documentation | 5 | ⏸ Blocked | ❌ Wait for Phase 7 |

---

## 🎯 Next Task

**Phase 1, Task 1.1:** Create Supabase project

**Instructions:**
1. Go to https://supabase.com
2. Create new project
3. Note project URL and anon key
4. Update tasks/progress.md with project details

---

## 📝 Example Task Assignments

### Simple Task (Single File)
```
Implement Phase 1, Task 1.4.1

File: lib/supabase/client.ts
Content: Supabase browser client initialization

Update: tasks/progress.md → mark 1.4.1 as [x]
Commit: "feat: add Supabase browser client"
```

### Complex Task (Multiple Files)
```
Implement Phase 1, Task 1.5 - Create SQL migrations

Files:
- supabase/migrations/001_initial_schema.sql
  - Create profiles table
  - Create boards table
  - Create columns table
  - Create tasks table

Reference: docs/2025-12-26-roadmap-design.md (Database Schema section)

Update: tasks/progress.md → mark 1.5 as [x]
Commit: "feat: create database schema migrations"
```

### Phase Completion
```
Phase 1 complete - All Supabase setup tasks done

Tasks completed:
- ✅ 1.1: Supabase project created
- ✅ 1.2: Environment variables configured
- ✅ 1.3: Dependencies installed
- ✅ 1.4: Client files created
- ✅ 1.5: Database schema created
- ✅ 1.6: RLS policies configured
- ✅ 1.7: Query functions created

Next: Phase 2 - Auth Integration

Update: tasks/progress.md → change Phase 1 status to ✅ Complete
Commit: "chore: complete Phase 1 - Supabase Setup"
```

---

## ⚠️ Important Notes

### Do's ✅
- **Always** read progress.md before starting
- **Always** update progress.md after completing
- **Always** commit with descriptive messages
- **Always** follow existing code patterns
- **Always** test before marking complete

### Don'ts ❌
- **Don't** skip phases (respect dependencies)
- **Don't** update progress.md before testing
- **Don't** make massive changes (keep it simple)
- **Don't** ignore architecture docs
- **Don't** forget to commit & push

---

## 🔧 Quick Commands

```bash
# Check progress
cat tasks/progress.md

# Run development server
npm run dev

# Run tests (when Phase 4+ is done)
npm test

# Build
npm run build

# Lint
npm run lint

# Commit workflow
git add .
git commit -m "feat: [description]"
git push origin main
```

---

## 📞 Help

**Stuck?** Read these files:
1. `docs/2025-12-26-roadmap-design.md` - Architecture reference
2. `tasks/roadmap-supabase-testing.md` - Detailed task list
3. `README.md` - Project overview

**Still stuck?** Check:
- Are dependencies satisfied?
- Is there a similar implementation in the codebase?
- Did you follow the design doc?

---

**Repository:** https://github.com/Lavr5000/0-KanBanDoska
**Last Updated:** 2025-12-26
