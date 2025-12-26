# Kanban Board 2.0

Premium dark mode Kanban board with modern tech stack.

## 🚀 Current Status

**Version:** 2.0.0
**Current Phase:** Planning Supabase Integration
**Progress:** [View Progress Roadmap](tasks/progress.md)

---

## 📋 Quick Links

- **[Roadmap Design](docs/2025-12-26-roadmap-design.md)** - Complete architecture design
- **[Implementation Plan](tasks/roadmap-supabase-testing.md)** - Detailed task checklist
- **[Progress Tracker](tasks/progress.md)** - Current status of all phases

---

## 🎯 Tech Stack

### Current (v2.0 - Local)
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS (premium dark theme)
- **State Management:** Zustand with localStorage
- **Drag & Drop:** @dnd-kit
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Planned (v3.0 - Cloud)
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Testing:** Vitest + Playwright
- **Monitoring:** Sentry
- **CI/CD:** GitHub Actions + Vercel

---

## 🏃 Quick Start

### For AI Agents (Local & Web)

**Important:** Always check the current progress before starting work:

```bash
# Read current progress
cat tasks/progress.md

# Read implementation plan
cat tasks/roadmap-supabase-testing.md
```

**Workflow for Agents:**

1. **Local Agent (Claude Code CLI):**
   - Works directly with filesystem
   - Can run tests, build, dev server
   - Updates progress.md after completing tasks
   - Commits changes with descriptive messages

2. **Web Agent:**
   - Clones repository
   - Reads docs and progress files
   - Implements specific phase tasks
   - Creates pull requests with changes

**Task Assignment Format:**

```
Agent: Implement Phase 1, Task 3 (Create Supabase clients)
Location: tasks/roadmap-supabase-testing.md
Update progress in: tasks/progress.md
When done: Commit with message "feat: implement [task name]"
```

---

## 📦 Setup

### 1. Clone & Install

```bash
git clone https://github.com/Lavr5000/0-KanBanDoska.git
cd 0-KanBanDoska
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
kanban-board2.0/
├── docs/
│   └── 2025-12-26-roadmap-design.md    # Complete architecture design
├── tasks/
│   ├── todo.md                          # Original v2.0 plan (completed)
│   ├── roadmap-supabase-testing.md      # v3.0 implementation plan
│   ├── progress.md                      # Current progress tracker
│   └── git-deployment-plan.md           # Deployment history
├── src/
│   ├── app/                             # Next.js App Router
│   ├── entities/                        # FSD: Business entities
│   ├── features/                        # FSD: Feature-specific logic
│   ├── widgets/                         # FSD: Composite components
│   └── shared/                          # FSD: Shared utilities
├── package.json
└── README.md
```

---

## ✨ Features (v2.0 - Completed)

### Core Functionality
- ✅ Drag & Drop tasks between columns
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Persistent storage (localStorage)
- ✅ Search and filter tasks
- ✅ Real-time statistics

### Task Properties
- ✅ Content/description
- ✅ Priority levels (Low, Medium, High, Critical)
- ✅ Status tracking
- ✅ Type badges (Bug, Feature, Design, Research)
- ✅ Tags system
- ✅ Due dates
- ✅ Assignee avatars

### UI/UX
- ✅ Premium dark theme (#121218 background)
- ✅ Smooth animations (Framer Motion)
- ✅ Responsive design
- ✅ Custom scrollbars
- ✅ Modal system
- ✅ Data export (JSON)
- ✅ Board reset

---

## 🗺️ Roadmap (v3.0 - In Planning)

### Phase 1: Supabase Setup ⏳
- Database schema
- Auth integration
- RLS policies

### Phase 2: Data Migration ⏳
- Migrate localStorage → Supabase
- Realtime subscriptions
- Optimistic updates

### Phase 3: Testing ⏳
- Unit tests (Vitest)
- E2E tests (Playwright)
- 70%+ coverage

### Phase 4: Production Ready ⏳
- Error handling
- Offline mode
- Loading states

### Phase 5: CI/CD & Monitoring ⏳
- GitHub Actions
- Sentry integration
- Vercel deployment

**See [Implementation Plan](tasks/roadmap-supabase-testing.md) for details.**

---

## 🤖 For AI Agents

### How to Work with This Project

**1. Understand Current State:**
```bash
# Always start here
Read tasks/progress.md          # What's done, what's next
Read tasks/roadmap-supabase-testing.md  # Full task list
```

**2. Pick a Task:**
- Find current phase in progress.md
- Locate specific task in roadmap-supabase-testing.md
- Check dependencies (are prerequisites done?)

**3. Implement:**
- Follow design in docs/2025-12-26-roadmap-design.md
- Update code following FSD architecture
- Keep changes minimal and focused

**4. Update Progress:**
```bash
# Mark task as completed in progress.md
# Update status: [ ] → [x]
# Add implementation notes
# Commit changes
```

**5. Test:**
```bash
npm run lint          # Check code quality
npm run build         # Verify build
npm test              # Run tests (when Phase 3 is done)
```

### Example Workflow

**User to Agent:**
```
Implement Phase 1, Task 4: Create Supabase client files

Files to create:
- lib/supabase/client.ts
- lib/supabase/server.ts

Update progress.md when done.
Commit with message: "feat: add Supabase client configuration"
```

**Agent:**
1. Reads tasks/roadmap-supabase-testing.md
2. Reads docs/2025-12-26-roadmap-design.md for architecture
3. Creates files according to design
4. Updates tasks/progress.md
5. Commits changes

---

## 📄 License

Private project

---

## 👤 Author

**Created by:** Lavr5000
**Assisted by:** Claude Code (Anthropic)

**Repository:** https://github.com/Lavr5000/0-KanBanDoska

---

## 📞 Support

For questions or issues, please refer to:
- [Progress Tracker](tasks/progress.md) - Check current status
- [Design Doc](docs/2025-12-26-roadmap-design.md) - Architecture details
- [GitHub Issues](https://github.com/Lavr5000/0-KanBanDoska/issues)
