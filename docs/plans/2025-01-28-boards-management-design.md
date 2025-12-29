# Boards Management Feature Design

**Date:** 2025-01-28
**Author:** Lavrov Denis
**Status:** Design Approved

## Overview

Add ability to create, rename, and switch between multiple Kanban boards (projects).

## Requirements

1. Create new boards with custom names
2. Rename existing boards
3. Switch between boards
4. List all user's boards
5. No deletion (safer, simpler)

## Architecture

### Components

1. **BoardSelector** - New sidebar component
   - Replaces current "Проект" block
   - Shows current board name
   - Click to open dropdown

2. **ProjectDropdown** - Dropdown list
   - Lists all user's boards
   - Each item: name + edit icon
   - Bottom: input to create new board

3. **useBoards** - New hook
   - Loads all user's boards from Supabase
   - Manages active board (localStorage)
   - CRUD operations: create, update, switch

### Data Flow

```
Sidebar → useBoards → all boards + active board
Board → useBoardData(activeBoardId) → tasks for that board
Switch board → update localStorage → reload data
```

### Storage

- `localStorage.setItem('activeBoardId', boardId)` - persist active board
- On load: check localStorage, fallback to first board

## UI Design

### Closed State

```
┌─────────────────────────────┐
│ Проект                      │
│ Kanban Board AI      ▼      │
└─────────────────────────────┘
```

### Open Dropdown

```
┌─────────────────────────────┐
│ Проект                      │
│ Kanban Board AI      ▲      │
├─────────────────────────────┤
│ 📁 My First Project    ✏️  │
│ 📁 Website Redesign   ✏️  │
│ 📁 Mobile App         ✏️  │ ← active (highlighted)
├─────────────────────────────┤
│ + Новый проект              │
│ └───────────────────────┐   │
│   Мой новый проект        │ ← input for creation
└──────────────────────────┴───┘
```

- Active board: blue highlight (like nav items)
- Folder icon 📁 for each board
- ✏️ icon: click to edit name
- Input with placeholder "Название проекта..."
- Enter → create & switch to new board

## Edit Workflow

1. User clicks ✏️ icon
2. Text becomes input with current value
3. Input focused, text selected
4. User edits name
5. Enter → save to Supabase
6. Escape or click outside → cancel

### Validation

- Min 1 character (after trim)
- Max 100 characters
- Empty after trim → error "Название не может быть пустым"

### Error Handling

- Network error → show toast
- DB error → show toast, keep edit mode
- Optimistic update → rollback on error

## Create Workflow

1. User opens dropdown
2. Types in bottom input
3. Presses Enter
4. New board created with 5 default columns
5. Auto-switch to new board
6. Dropdown closes

### Default Columns

```typescript
const defaultColumns = [
  { title: 'Новая задача', position: 0 },
  { title: 'Выполняется', position: 1 },
  { title: 'Ожидает проверки', position: 2 },
  { title: 'На тестировании', position: 3 },
  { title: 'В доработку', position: 4 },
]
```

### Validation

- Min 1 character (after trim)
- Max 100 characters
- Empty → input flashes red

## Implementation Files

- `src/hooks/useBoards.ts` - New hook
- `src/widgets/board-selector/` - New feature
  - `ui/BoardSelector.tsx`
  - `ui/ProjectDropdown.tsx`
- `src/widgets/sidebar/ui/Sidebar.tsx` - Replace project block
- `src/hooks/useBoardData.ts` - Accept boardId parameter

## Technical Notes

- Use lucide-react `Pencil` icon for edit
- Click outside to close dropdown
- localStorage key: `activeBoardId`
- Real-time updates via Supabase subscriptions
