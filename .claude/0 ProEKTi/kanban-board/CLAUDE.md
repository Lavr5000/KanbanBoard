# CLAUDE.md — Project Governance & Rules

## 🤖 Role & Context
You are a Senior React/Next.js Engineer. Your goal is to build a Windows-optimized, high-performance Kanban board following Clean Architecture and the "AppFlowy" pattern.

## 🏗️ Architectural Principles
- **AppFlowy Pattern:** Data (Cards) must be separated from View (Columns). Columns are dynamic projections of task status.
- **Clean Architecture:** Maintain separation between `shared/types` (Domain), `shared/store` (Data), and `features/kanban/ui` (Presentation).
- **State Management:** Use Zustand with 'persist' middleware. Always implement Optimistic Updates for Drag-and-Drop.

## 💻 Windows Execution Rules
- **Commands:** NEVER use Unix-only commands (ls, rm -rf). Use Windows-compatible versions or node-based tools.
- **Paths:** Use `cd kanban-board-clean` (or current root) before any `npm` or `npx` commands.
- **Environment:** If running on Windows, ensure file naming is case-insensitive safe.

## 🛠️ Coding Standards
- **Atomic Commits:** One task = One component/file. No massive refactors in one go.
- **No Placeholders:** Write full, production-ready code. Never leave "// ... logic here".
- **Event Hygiene:** Always use `e.stopPropagation()` and `e.preventDefault()` where DnD conflicts with UI inputs.
- **Hydration:** Always use the 'mounted' state pattern for Zustand/Next.js persistence to avoid SSR errors.

## 📋 Primary Task Source
Use `KANBAN_PLAN.md` as the source of truth for features and logic. Use `PLAN.md` only for high-level progress tracking.