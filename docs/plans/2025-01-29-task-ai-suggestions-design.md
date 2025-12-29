# Task AI Suggestions Feature Design

**Date:** 2025-01-29
**Author:** Lavrov Denis
**Status:** Design Approved

## Overview

Add AI-powered suggestions to help users improve their task descriptions immediately after creation. Suggestions appear inside the task card with structured improvements: better title, description, acceptance criteria, and risks.

## Requirements

1. Generate AI suggestions immediately after task creation
2. Display suggestions inside expanded task card
3. Auto-hide after 30 seconds with restore icon
4. Use context from nearby tasks for better suggestions
5. Structured output format

## Architecture

### Components

1. **TaskAISuggestions** - New feature component
   - Displays structured suggestions
   - Manages visibility state
   - Handles restore icon click

2. **AISuggestionIcon** - Small icon component
   - Shows after suggestions auto-hide
   - Click to restore suggestions
   - Sparkle emoji + "AI" label

3. **useTaskAI** - New hook
   - Fetches suggestions from DeepSeek API
   - Builds context from nearby tasks
   - Caches results
   - Manages visibility and auto-hide timer

### API Route

**`/api/ai/suggestions`** - Endpoint for DeepSeek integration

**Request:**
```json
{
  "taskContent": "Сделать авторизацию",
  "columnTitle": "Новая задача",
  "boardName": "Мой проект",
  "nearbyTasks": [
    { "content": "Добавить кнопку входа" },
    { "content": "Создать форму регистрации" }
  ]
}
```

**Response:**
```json
{
  "improvedTitle": "Реализовать JWT-авторизацию",
  "description": "Добавить возможность входа по email с JWT-токенами",
  "acceptanceCriteria": [
    "Форма входа принимает email/пароль",
    "JWT сохраняется в localStorage",
    "Есть кнопка Выйти"
  ],
  "risks": [
    "Не забыть про валидацию пароля"
  ]
}
```

### Data Flow

```
User creates task
  ↓
useTaskAI.generateSuggestions()
  ↓
POST /api/ai/suggestions
  ↓
DeepSeek API (with nearby tasks context)
  ↓
Response → TaskCard expands
  ↓
Suggestions shown for 30s
  ↓
Auto-hide → AI icon remains
  ↓
Click icon → restore suggestions
```

## UI Design

### Expanded Task Card with Suggestions

```
┌─────────────────────────────────────────┐
│ 📝 Сделать авторизацию          [AI]   │
├─────────────────────────────────────────┤
│ 💡 AI-предложения                       │
│                                         │
│ 📌 Улучшенное название:                 │
│ Реализовать JWT-авторизацию             │
│                                         │
│ 📝 Описание:                            │
│ Добавить возможность входа по email    │
│ и паролю с JWT-токенами                 │
│                                         │
│ ✅ Критерии приемки:                    │
│ • Форма входа принимает email/пароль   │
│ • При успешном входе сохраняется token  │
│ • Есть кнопка "Выйти"                   │
│                                         │
│ ⚠️ Риски:                               │
│ • Не забыть про валидацию пароля        │
│                                         │
│            [Скрыть через 27с]           │
└─────────────────────────────────────────┘
```

### After Auto-Hide

```
┌─────────────────────────────────────────┐
│ 📝 Сделать авторизацию         [✨ AI]  │
└─────────────────────────────────────────┘
```

### Animations

- **Appear:** smooth slide down + fade in (200ms)
- **Disappear:** fade out (300ms) → card shrinks
- **Skeleton:** shimmer effect while loading

### Styles

- Suggestions background: slightly darker than task card
- Section icons: 📌 📝 ✅ ⚠️ (emoji)
- Text: gray, smaller than main task text
- Hide button: small, semi-transparent

## Prompt Engineering

### System Prompt for DeepSeek

```
Ты - AI-ассистент для Kanban доски. Твоя задача - улучшать формулировки задач.

На вход ты получаешь:
- Текст новой задачи
- Название колонки (контекст статуса)
- Название проекта
- 3-5 соседних задач в этой же колонке (для понимания стиля и контекста проекта)

Ты должен вернуть JSON с улучшениями:

{
  "improvedTitle": "более конкретное и ясное название",
  "description": "развёрнутое описание (если нужно добавить контекст)",
  "acceptanceCriteria": ["критерий 1", "критерий 2", "критерий 3"],
  "risks": ["риск 1", "риск 2"]
}

Правила:
- improvedTitle: должно быть конкретным, начинаться с глагола
- description: добавляй только если оригинал недостаточно подробный
- acceptanceCriteria: 3-5 конкретных проверяемых критериев
- risks: 2-4 потенциальных проблем или забытых аспектов
- Учитывай стиль соседних задач
- Используй русский язык
- Не придумывай детали - только улучшай и структурируй то, что есть
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| API unavailable | Show "Подсказки временно недоступны", no icon |
| Empty response | Don't show suggestions or icon |
| Invalid JSON | Show error message, retry on icon click |
| Rate limit | Show "Попробуйте через минуту", keep icon for retry |
| No nearby tasks | Send empty array, AI gives general suggestions |

## Edge Cases

1. **Task moved to another column**
   - Suggestions remain valid (no update)
   - AI icon persists

2. **Task edited by user**
   - Suggestions don't auto-update
   - AI icon allows requesting new ones

3. **Rapid task creation**
   - Each task requests AI independently
   - Consider debounce (1 sec) between requests

4. **Long request queue**
   - Show spinner in card
   - User can create other tasks in parallel

## Implementation Files

### New Files

- `src/features/task-ai-suggestions/`
  - `ui/TaskAISuggestions.tsx`
  - `ui/AISuggestionIcon.tsx`
  - `hooks/useTaskAI.ts`
- `src/app/api/ai/suggestions/route.ts`
- `src/lib/deepseek.ts`

### Modified Files

- `src/entities/task/ui/TaskCard.tsx` - add TaskAISuggestions
- `.env.local` - add DEEPSEEK_API_KEY

## useTaskAI Hook Structure

```typescript
interface AISuggestion {
  improvedTitle: string
  description: string | null
  acceptanceCriteria: string[]
  risks: string[]
}

interface UseTaskAIReturn {
  suggestions: AISuggestion | null
  loading: boolean
  error: string | null
  visible: boolean
  generateSuggestions: (content: string, column: string, board: string, nearby: string[]) => Promise<void>
  hideSuggestions: () => void
  restoreSuggestions: () => void
}
```

## TaskCard Integration

```typescript
const { suggestions, loading, visible, generateSuggestions, hide, restore } = useTaskAI()

useEffect(() => {
  if (justCreated) {
    generateSuggestions(task.content, column.title, board.name, nearbyTasks)
  }
}, [justCreated])

return (
  <div className={cn(styles.card, visible && suggestions && styles.expanded)}>
    <TaskContent />
    {loading && <AISuggestionsSkeleton />}
    {suggestions && visible && <TaskAISuggestions data={suggestions} onHide={hide} />}
    {!visible && suggestions && <AISuggestionIcon onRestore={restore} />}
  </div>
)
```

## Testing Checklist

- [ ] Create task → suggestions appear
- [ ] Wait 30s → suggestions hide, icon remains
- [ ] Click icon → suggestions restore
- [ ] API error → error message shown
- [ ] Rate limit → retry message shown
- [ ] First task in project → general suggestions work
- [ ] Long task text → handled correctly
- [ ] Special characters → don't break JSON
- [ ] API response time < 3s
- [ ] Smooth animations, no lag

## Technical Notes

- DeepSeek API: https://api.deepseek.com/v1/chat/completions
- Model: deepseek-chat
- Environment variable: DEEPSEEK_API_KEY
- Auto-hide timer: 30 seconds
- Nearby tasks count: 3-5
- Max retry attempts: 1
