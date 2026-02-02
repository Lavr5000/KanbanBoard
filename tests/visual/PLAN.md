# Visual Testing Plan for Kanban Board

## Problem
Current design uses old dark theme (`#121218`) instead of glassmorphism.

## Playwright MCP Setup
✅ Added to `.claude.json` for KanbanBoard project:
```json
"playwright": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "@playwright/mcp@latest",
    "--executable-path=C:\\Users\\user\\AppData\\Local\\Yandex\\YandexBrowser\\Application\\browser.exe",
    "--console-level=debug"
  ]
}
```

## Next Session Tasks

### 1. Capture Current State (Playwright MCP)
- Navigate to `http://localhost:3000`
- Take full page screenshot
- Document current visual style issues

### 2. Create Visual Test Suite
Create `tests/visual/visual.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Kanban Board Visual Tests', () => {
  test('homepage has glassmorphism background', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Check for glass styles, not solid #121218
  });

  test('sidebar uses glass effects', async ({ page }) => {
    // Verify backdrop-blur, transparency
  });

  test('cards have glass styling', async ({ page }) => {
    // Verify border, blur, shadow
  });
});
```

### 3. Apply Glassmorphism Fixes

#### Files to Update:
1. **src/app/globals.css**
   - Change `body background-color: #121218` to gradient/glass background
   - Add atmospheric background (gradient, orbs, noise)

2. **src/app/page.tsx**
   - Replace `bg-[#121218]` with glass classes
   - Use new `GlassContainer` component

3. **src/widgets/sidebar/ui/Sidebar.tsx**
   - Apply `.glass` or `.glass-dark` classes

4. **src/widgets/board/ui/Board.tsx**
   - Apply glass styles to board background

### 4. Verify with Playwright
- Run visual tests
- Compare before/after screenshots
- Verify glassmorphism is applied correctly

## References
- Existing glass utilities: `.glass`, `.glass-dark`, `.glass-card`
- Glass components: `@/shared/ui/glass/GlassModal`, `GlassPanel`
- Phase 02-01 to 02-06: Component library with glass styles

## Success Criteria
- [ ] Playwright MCP successfully captures screenshots
- [ ] Visual test suite created and passing
- [ ] Glassmorphism background replaces solid #121218
- [ ] All components use glass utilities
- [ ] No regressions in functionality
