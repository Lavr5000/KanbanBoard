# Onboarding Tour Design

**Date:** 2025-01-03
**Status:** Ready for Implementation
**Author:** Lavr5000 + Claude Code

---

## Overview

Interactive onboarding tour for new users to introduce 3 key AI features of the Kanban board through spotlight-based tooltips with soft overlay blur.

**Goals:**
- Reduce time-to-first-action for new users
- Showcase AI-powered features (Roadmap, Task suggestions)
- Provide guided, self-paced learning experience
- Minimize support questions about core features

---

## Requirements

### Functional Requirements

1. **6-step tour** covering:
   - AI Roadmap panel location
   - AI Roadmap generation
   - Creating columns
   - Creating tasks
   - AI in task (icon)
   - AI suggestions usage

2. **Spotlight style:**
   - Soft overlay blur (rgba(0,0,0,0.3))
   - Active element highlighted with glow
   - Automatic tooltip positioning

3. **User controls:**
   - "Next" button → advance to next step
   - "Back" button → return to previous step
   - "Skip" button → skip current step (not entire tour)
   - "Skip tour" option → close entire tour

4. **Timing:**
   - Auto-start 1-2 seconds after page load
   - Only on desktop (>768px)
   - Check for first visit via localStorage

5. **Persistence:**
   - Store completion status in localStorage
   - Key: `onboarding_completed`
   - Value: `"true"` | `"false"` | undefined

### Non-Functional Requirements

1. **Performance:** <50KB added to bundle (react-joyride)
2. **Accessibility:** Keyboard navigation, screen reader support
3. **Responsiveness:** Disable on mobile, adapt tooltip position
4. **Browser support:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## Architecture

### File Structure (FSD)

```
src/
├── features/
│   └── onboarding/
│       ├── ui/
│       │   └── OnboardingTour.tsx       # Main Joyride wrapper
│       ├── lib/
│       │   ├── tour-steps.ts             # 6-step configuration
│       │   ├── storage.ts                # localStorage helpers
│       │   └── joyride-styles.ts         # Style customization
│       ├── hooks/
│       │   └── useOnboarding.ts          # Tour state management
│       └── index.ts                      # Public API
└── widgets/
    └── board/
        └── ui/
            └── Board.tsx                 # Integration point
```

### Component: OnboardingTour

```typescript
interface OnboardingTourProps {
  run: boolean              // Start/stop tour
  onCallback?: (data: CallbackData) => void  // Event handler
}
```

**Responsibilities:**
- Wrap react-joyride with custom styles
- Handle tour lifecycle events
- Apply custom styling to match dark theme

### Hook: useOnboarding

```typescript
interface UseOnboardingReturn {
  shouldRunTour: boolean
  setTourCompleted: () => void
}
```

**Responsibilities:**
- Check localStorage for completion status
- Provide completion setter
- Check screen size (desktop only)

### Storage Functions

```typescript
// storage.ts
isOnboardingCompleted(): boolean
setOnboardingCompleted(value: boolean): void
```

---

## Tour Steps

### Step 1: AI Roadmap Panel

**Target:** `[data-tour="roadmap-panel"]`
**Content:**
```
🎯 AI Roadmap
Панель внизу экрана для генерации дорожных карт проекта.
AI создаст структуру задач на основе твоего описания.
```
**Placement:** `top`
**Action:** Highlight panel at bottom of screen

### Step 2: AI Generation Button

**Target:** `[data-tour="ai-generate-btn"]`
**Content:**
```
✨ Генерация roadmap
Нажми кнопку с Sparkles, чтобы открыть AI чат.
Опиши свой проект, и AI предложит список задач.
```
**Placement:** `left`
**Action:** Point to sparkles button in Roadmap panel

### Step 3: Add Column

**Target:** `.btn-add-column` (or `[data-tour="add-column-btn"]`)
**Content:**
```
📋 Создание колонок
Нажми "+" чтобы добавить новую колонку на доску.
Максимум 7 колонок. Первую удалить нельзя.
```
**Placement:** `right`
**Action:** Highlight add column button

### Step 4: Add Task

**Target:** `[data-tour="add-task-btn"]`
**Content:**
```
➕ Новая задача
Создавай задачи в любой колонке.
Указывай приоритет, теги и сроки.
```
**Placement:** `top`
**Action:** Highlight task creation button

### Step 5: AI Task Icon

**Target:** `[data-tour="task-ai-icon"]`
**Content:**
```
🤖 AI в задаче
Иконка sparkles открывает AI предложения.
AI улучшит содержание задачи на контексте проекта.
```
**Placement:** `left`
**Action:**
- Open AI suggestions panel on first task
- Show sparkles icon

### Step 6: AI Suggestions

**Target:** `[data-tour="task-ai-suggestions"]`
**Content:**
```
💡 Использование AI
Выбери подходящее предложение из списка.
Оно автоматически заменит текст задачи.

Готово! Теперь ты знаешь всё основное. 🎉
```
**Placement:** `top`
**Action:**
- Show AI suggestions panel
- Close panel after step

---

## Styling

### Joyride Configuration

```typescript
// joyride-styles.ts
export const joyrideStyles = {
  options: {
    zIndex: 10000,
    overlayColor: 'rgba(0, 0, 0, 0.3)',
    spotlightClicks: true,
    spotlightPadding: 8,
    primaryColor: '#3b82f6',
    textColor: '#ffffff',
    width: 320,
    transitionDuration: 300,
  },
}
```

### CSS Styles

```css
/* Tooltip - dark theme */
.onboarding-tooltip {
  background: #1a1a20;
  border: 1px solid #3b82f6;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(8px);
}

/* Buttons */
.onboarding-btn-next {
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
}

.onboarding-btn-back {
  background: transparent;
  border: 1px solid #4b5563;
  color: #9ca3af;
}

.onboarding-btn-skip {
  background: transparent;
  color: #6b7280;
  font-size: 14px;
}

/* Effects */
.joyride-overlay {
  backdrop-filter: blur(2px);
}

.joyride-spotlight {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4);
  border-radius: 8px;
}
```

---

## Integration

### Board.tsx Integration

```typescript
import { OnboardingTour } from '@/features/onboarding'
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'
import { STATUS } from 'react-joyride'

export function Board() {
  const { shouldRunTour, setTourCompleted } = useOnboarding()
  const [runTour, setRunTour] = useState(false)
  const [demoTaskAI, setDemoTaskAI] = useState(false)

  // Start tour after delay
  useEffect(() => {
    if (shouldRunTour) {
      const timer = setTimeout(() => setRunTour(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [shouldRunTour])

  // Handle resize (disable on mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && runTour) {
        setRunTour(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [runTour])

  // Joyride events
  const handleJoyrideCallback = (data: CallbackData) => {
    const { index, action, status } = data

    // Open AI panel on step 5
    if (index === 4 && action === 'next') {
      setDemoTaskAI(true)
    }

    // Close AI panel after step 6
    if (index === 5 && action === 'next') {
      setDemoTaskAI(false)
    }

    // Tour finished
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setDemoTaskAI(false)
      setTourCompleted()
      setRunTour(false)
    }
  }

  return (
    <BoardContext.Provider value={...}>
      <OnboardingTour run={runTour} onCallback={handleJoyrideCallback} />
      {/* Rest of Board UI */}
    </BoardContext.Provider>
  )
}
```

### Data-Tour Attributes

Add to existing components:

**RoadmapPanel.tsx:**
```tsx
<div data-tour="roadmap-panel" className="...">
  <button data-tour="ai-generate-btn" onClick={openAIChat}>
    <Sparkles />
  </button>
</div>
```

**AddColumnButton.tsx:**
```tsx
<button data-tour="add-column-btn" className="btn-add-column">
  <Plus />
</button>
```

**TaskCard.tsx:**
```tsx
<button data-tour="task-ai-icon" onClick={() => setShowAI(true)}>
  <Sparkles />
</button>

{showAI && (
  <AISuggestionsPanel data-tour="task-ai-suggestions" />
)}
```

### Hidden Elements Handling

**Problem:** AI suggestions panel is hidden by default.

**Solution:** Use `forceShowAI` prop to temporarily show during tour.

```typescript
// TaskCard.tsx
interface TaskCardProps {
  task: Task
  forceShowAI?: boolean
}

export function TaskCard({ task, forceShowAI }: TaskCardProps) {
  const [showAI, setShowAI] = useState(false)

  useEffect(() => {
    if (forceShowAI) {
      setShowAI(true)
    }
  }, [forceShowAI])

  return (
    <div>
      <button onClick={() => setShowAI(!showAI)}>
        <Sparkles />
      </button>

      {showAI && (
        <AISuggestionsPanel
          data-tour="task-ai-suggestions"
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  )
}
```

```typescript
// Board.tsx - pass to first task only
<TaskCard
  task={tasks[0]}
  forceShowAI={demoTaskAI && tasks[0]?.id === firstTaskId}
/>
```

---

## Edge Cases

### 1. Element Not Found

**Problem:** Target element doesn't exist (e.g., no tasks on board).

**Solution:**
- Set `disableBeacon: true` on step
- Joyride will skip step automatically
- Or check before starting tour:

```typescript
const canStartTour = tasks.length > 0 && columns.length > 0
if (!canStartTour) {
  // Show simplified tour or create demo task
  await createDemoTask()
}
```

### 2. User Closes Browser Mid-Tour

**Solution:** Save progress to localStorage.

```typescript
// storage.ts
export function saveOnboardingProgress(step: number) {
  localStorage.setItem('onboarding_current_step', String(step))
}

export function getOnboardingProgress(): number {
  return parseInt(localStorage.getItem('onboarding_current_step') || '0')
}

// On return visit - offer to continue
const savedStep = getOnboardingProgress()
if (savedStep > 0 && savedStep < tourSteps.length) {
  showToast("Продолжить обучение с шага " + (savedStep + 1) + "?")
}
```

### 3. Screen Resize to Mobile

**Solution:** Disable tour when width < 768px.

```typescript
useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 768 && runTour) {
      setRunTour(false)
      showToast("Онбординг доступен только на десктопе")
    }
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [runTour])
```

### 4. Empty Board (No Tasks for AI Demo)

**Solution:** Create demo task before tour.

```typescript
const createDemoTaskIfNeeded = async () => {
  if (tasks.length === 0 && columns.length > 0) {
    await createTask(supabase, {
      board_id: boardId,
      column_id: columns[0].id,
      title: 'Демо задача',
      content: 'Пример задачи с AI предложениями',
    })
  }
}
```

### 5. Click Outside Tooltip

**Solution:** Configure Joyride behavior.

```typescript
<Joyride
  disableOverlayClose={true}   // Prevent clicking overlay to close
  disableCloseOnEsc={false}    // Allow Escape key
  ...
/>
```

---

## Testing Plan

### Manual Testing Checklist

- [ ] Tour starts 1.5s after first load
- [ ] localStorage saves completion status
- [ ] "Next" advances to next step
- [ ] "Back" returns to previous step
- [ ] "Skip" closes entire tour
- [ ] All 6 steps highlight correct elements
- [ ] AI panel opens on step 5
- [ ] Tooltip doesn't overflow screen edges
- [ ] Tour disabled on mobile (<768px)
- [ ] Tour doesn't show on repeat visit
- [ ] Overlay covers all except active element
- [ ] Blur effect works on inactive elements
- [ ] Escape key closes tour
- [ ] Resize to mobile closes tour

### Unit Tests (Vitest)

```typescript
// storage.test.ts
describe('Onboarding Storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return false for new user', () => {
    expect(isOnboardingCompleted()).toBe(false)
  })

  it('should save completed status', () => {
    setOnboardingCompleted(true)
    expect(isOnboardingCompleted()).toBe(true)
  })

  it('should save progress', () => {
    saveOnboardingProgress(3)
    expect(getOnboardingProgress()).toBe(3)
  })
})
```

### Integration Tests (Playwright)

```typescript
// onboarding.spec.ts
test('onboarding flow', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  // Wait for tour to start
  await page.waitForSelector('.joyride-tooltip', { timeout: 3000 })

  // Click "Next" through all steps
  for (let i = 0; i < 6; i++) {
    await page.click('button[aria-label="Next"]')
    await page.waitForTimeout(500)
  }

  // Verify tour ended
  await expect(page.locator('.joyride-tooltip')).not.toBeVisible()

  // Verify localStorage
  const completed = await page.evaluate(() =>
    localStorage.getItem('onboarding_completed')
  )
  expect(completed).toBe('true')
})

test('onboarding disabled on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('http://localhost:3000')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  // Tour should not start
  await expect(page.locator('.joyride-tooltip')).not.toBeVisible()
})
```

### Cross-Browser Testing

- Chrome (latest) ✅
- Firefox (latest) ✅
- Safari (latest) ✅
- Edge (latest) ✅

### Responsive Testing

- Desktop 1920x1080 ✅
- Laptop 1366x768 ✅
- Large 2560x1440 ✅
- Tablet 768x1024 - disabled ✅
- Mobile 375x667 - disabled ✅

---

## Implementation Steps

### Phase 1: Setup
1. Install react-joyride
2. Create feature directory structure
3. Create base files (tour-steps, storage, styles, component, hook)

### Phase 2: Core Logic
4. Implement storage functions
5. Configure 6 tour steps
6. Create Joyride styles
7. Build OnboardingTour component
8. Implement useOnboarding hook

### Phase 3: Integration
9. Integrate into Board.tsx
10. Add data-tour attributes to UI components
11. Implement hidden elements handling (forceShowAI)
12. Add mobile detection and resize handler

### Phase 4: Edge Cases
13. Handle empty board scenario
14. Add progress saving to localStorage
15. Implement escape key handling

### Phase 5: Testing
16. Manual testing of all steps
17. Unit tests for storage
18. Integration tests with Playwright
19. Cross-browser testing
20. Responsive testing

### Phase 6: Documentation & Deploy
21. Update README.md with onboarding info
22. Add screenshots (optional)
23. Commit with message "feat: add onboarding tour"
24. Deploy to production
25. Test on live environment

---

## Dependencies

```json
{
  "dependencies": {
    "react-joyride": "^2.7.0"
  }
}
```

**Bundle Impact:** ~50KB minified (~2-3% of total bundle)

**Alternative:** Use code-splitting to load on-demand.

---

## Future Enhancements

### Optional Features (Out of Scope)

1. **Reset button in settings** - Allow users to replay tour
2. **Interactive elements** - Let users click buttons during tour
3. **Video walkthrough** - Embedded video for complex features
4. **Progress bar** - Show step indicator (1/6, 2/6, etc.)
5. **Keyboard shortcuts** - Arrow keys to navigate steps
6. **Custom themes** - Light/dark mode variants
7. **Analytics tracking** - Track completion rates
8. **A/B testing** - Test different step orders

### Advanced Features

1. **Conditional steps** - Show/hide steps based on user role
2. **Multi-language** - i18n support for tour content
3. **Contextual help** - "?" icon that triggers specific step
4. **Tour editor** - Admin panel to modify tour content
5. **User feedback** - Rate helpfulness after tour

---

## Success Metrics

Track these metrics after implementation:

1. **Completion rate** - % of users who finish all 6 steps
2. **Skip rate** - % of users who skip tour
3. **Feature adoption** - % of users who use AI features after tour
4. **Time to first action** - Avg time before first task created
5. **Support tickets** - Reduction in "how to" questions

**Target:**
- Completion rate > 70%
- AI feature usage increase > 50%
- Support tickets decrease > 30%

---

## References

- [react-joyride documentation](https://docs.react-joyride.com/)
- [FSD methodology](https://feature-sliced.design/)
- Current project: `docs/2025-12-26-roadmap-design.md`
