# Design: Roadmap, AI Suggestions Save, Copy Buttons

**Date:** 2025-01-01
**Status:** Approved

## Overview

Three features to improve kanban board UX:
1. Project roadmap panel (persistent note at bottom)
2. Auto-save AI suggestions to database
3. Copy buttons for AI suggestion text

---

## Feature 1: Roadmap Panel

### Architecture

Fixed panel at bottom of screen:
- Collapsed: ~40px height with "📍 Дорожная карта" button
- Expanded: 60-70% viewport height, slides up smoothly
- `position: fixed`, `z-index` above kanban board

### Database

Table `roadmaps`:
```sql
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(board_id)
);
```

One-to-one: each board has one roadmap.

### UI Components

- `RoadmapPanel` - main panel component
- `useRoadmap` hook - load/save content
- Auto-save with 2-3s debounce
- Manual save button
- Status indicator: "Сохранено..." / "Сохранение..."

---

## Feature 2: AI Suggestions Auto-Save

### Database

Table `ai_suggestions`:
```sql
CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  improved_title TEXT,
  description TEXT,
  acceptance_criteria JSONB,
  risks JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  is_applied BOOLEAN DEFAULT FALSE
);
```

### Data Flow

1. User clicks "Get AI Sequence"
2. DeepSeek API returns suggestions
3. Immediately save to `ai_suggestions`
4. UI shows saved suggestions on task reopen

### Changes

- `useTaskAI` - add `taskId` param, save after generation
- `useAISuggestions` - new hook for loading saved suggestions
- `TaskCard` - load and display saved AI history

---

## Feature 3: Copy Buttons for AI

### UI

New `CopyButton` component:
- Icon "📋" on hover
- States: default → "Скопировано!" (2s) → default
- `position: absolute` right of each block
- Visible on group hover only

Apply to each section in `TaskAISuggestions`:
- Improved title
- Description
- Each acceptance criterion
- Each risk

### Implementation

```typescript
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}
```

Wrap each block in `relative` container with `group` class.

---

## Implementation Order

1. **Copy buttons** (no DB changes)
   - Create `CopyButton.tsx`
   - Modify `TaskAISuggestions.tsx`

2. **AI save** (DB + hooks)
   - Create `ai_suggestions` table migration
   - Create `useAISuggestions.ts`
   - Modify `useTaskAI.ts`
   - Modify `TaskCard.tsx`

3. **Roadmap** (DB + new UI)
   - Create `roadmaps` table migration
   - Create `RoadmapPanel.tsx`
   - Create `useRoadmap.ts`
   - Integrate into `Board.tsx`

---

## Files

**New:**
- `src/shared/ui/CopyButton.tsx`
- `src/features/roadmap/ui/RoadmapPanel.tsx`
- `src/features/roadmap/hooks/useRoadmap.ts`
- `src/features/ai-suggestions/hooks/useAISuggestions.ts`

**Modify:**
- `src/features/task-ai-suggestions/ui/TaskAISuggestions.tsx`
- `src/features/task-ai-suggestions/hooks/useTaskAI.ts`
- `src/entities/task/ui/TaskCard.tsx`
- `src/widgets/board/ui/Board.tsx`
