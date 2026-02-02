# E2E Tests

This directory contains Playwright end-to-end tests.

## Running Tests

```bash
# All E2E tests
npm run test:e2e

# With UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Specific file
npm run test:e2e -- card-lifecycle.spec.ts

# Update screenshots
npx playwright test --update-snapshots

# Run on specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

## Directory Structure

```
e2e/
├── critical-flows/              # User journey tests
│   └── card-lifecycle.spec.ts   # Create, edit, move, delete cards
├── visual-regression/           # Screenshot comparison
│   └── modals.spec.ts           # Modal z-index tests (Bug #1 prevention)
├── drag-drop/                   # Drag-drop interactions
│   └── drag-drop.spec.ts        # Drag visual state tests
├── react19-compatibility.spec.ts # React 19 specific tests
└── fixtures/                    # Test data, helpers
    ├── test-board.ts            # Board test data
    └── helpers.ts               # Test utility functions
```

## Test Categories

### Critical Flow Tests

Tests that users actually perform:
- Creating tasks
- Editing tasks
- Moving tasks (drag-drop)
- Deleting tasks
- Exporting data

**Location:** `e2e/critical-flows/`

### Visual Regression Tests

Tests that catch UI bugs:
- Modal visibility (z-index)
- Layout shifts
- Responsive design
- Dark mode

**Location:** `e2e/visual-regression/`

**Purpose:** Prevent Bug #1 (modal behind content)

### React 19 Compatibility Tests

Tests for React 19 specific features:
- Concurrent rendering
- Optimistic updates
- Transitions
- Server components

**Location:** `e2e/react19-compatibility.spec.ts`

### Drag-Drop Tests

Tests for drag-drop functionality:
- Drag visual feedback
- Drop zone highlighting
- Card reordering
- Touch device support

**Location:** `e2e/drag-drop/`

## Writing E2E Tests

### Data Testids

Add `data-testid` attributes to elements for reliable selection:

```tsx
<button data-testid="save-button" onClick={handleSave}>
  Save
</button>
```

**Already added to:**
- Board: `data-testid="board-container"`
- TaskCard: `data-testid="task-card-{id}"`
- Column: `data-testid="column-{id}"`
- Modals: `data-testid="modal-overlay"`

### Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]')
  })

  test('does something important', async ({ page }) => {
    // Act
    await page.click('[data-testid="button"]')

    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible()
  })
})
```

### Page Objects Pattern

For complex workflows:

```typescript
class BoardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/')
    await this.page.waitForSelector('[data-testid="board-container"]')
  }

  async addTask(content: string) {
    await this.page.click('[data-testid="add-task-button"]')
    await this.page.fill('[data-testid="task-input"]', content)
    await this.page.click('[data-testid="save-button"]')
  }

  async getTaskCount() {
    return await this.page.locator('[data-testid^="task-card"]').count()
  }
}

// Use in test
test('adds a new task', async ({ page }) => {
  const board = new BoardPage(page)
  await board.goto()

  const before = await board.getTaskCount()
  await board.addTask('New task')
  const after = await board.getTaskCount()

  expect(after).toBe(before + 1)
})
```

### Visual Snapshots

```typescript
test('visual comparison', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('board.png')
})

test('modal screenshot with maxDiffPixels', async ({ page }) => {
  await page.click('[data-testid="open-modal"]')
  await expect(page).toHaveScreenshot('modal.png', {
    maxDiffPixels: 100, // Allow small differences (anti-aliasing)
  })
})
```

## Fixtures

### Using Test Data

```typescript
import { mockBoard } from './fixtures/test-board'

test('loads board with data', async ({ page }) => {
  await page.goto('/')
  // Test with mock board data
})
```

### Custom Helpers

```typescript
import { createTestTask } from './fixtures/helpers'

test('creates test task', async ({ page }) => {
  const task = createTestTask({ content: 'Test task' })
  // Use task in test
})
```

## Debugging

### Debug Mode

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector with step-by-step execution.

### Screenshots on Failure

Screenshots are automatically saved to `test-results/` on failure.

### Trace Viewer

```bash
npx playwright show-trace trace.zip
```

View complete test execution trace including:
- DOM snapshots
- Network requests
- Console logs
- Videos

### Browser Mode

```bash
npm run test:e2e:ui
```

Opens Playwright UI with:
- Time-travel debugging
- DOM inspection
- Network inspection
- Video recording

## Cross-Browser Testing

Tests run on multiple browsers:

### Configured Browsers

```typescript
// playwright.config.ts
projects: [
  { name: 'chromium' },
  { name: 'firefox' },
  { name: 'webkit' }, // Safari
  { name: 'Mobile Chrome' }, // Pixel 5
]
```

### Run on Specific Browser

```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### Mobile Testing

```bash
npm run test:e2e -- --project="Mobile Chrome"
```

## Known Issues

### Flaky Drag-Drop Tests

If drag-drop tests are flaky:

**Symptoms:**
- Test sometimes passes, sometimes fails
- Drag doesn't register
- Drop doesn't trigger

**Solutions:**

1. Increase timeout:
```typescript
test.setTimeout(10000)
```

2. Use `dragTo()` instead of manual drag events:
```typescript
await page.dragAndDrop(
  '[data-testid="task-card-1"]',
  '[data-testid="column-2"]'
)
```

3. Wait for animations:
```typescript
await page.waitForTimeout(500) // Wait for CSS transition
```

4. Check for CSS transitions interfering:
```typescript
// Disable transitions for tests
await page.addStyleTag({
  content: `
    * { transition: none !important; animation: none !important; }
  `
})
```

### Screenshot Differences

If screenshots fail after visual changes:

**Symptoms:**
- Screenshots don't match baseline
- Diff shows differences

**Solutions:**

1. Review the diff in `playwright-report/`:
```bash
npx playwright show-report
```

2. If change is intentional:
```bash
npx playwright test --update-snapshots
```

3. If change is a bug: fix the bug

4. If difference is minor (anti-aliasing):
```typescript
await expect(page).toHaveScreenshot('modal.png', {
  maxDiffPixels: 100, // Allow small differences
  threshold: 0.2, // Allow 20% pixel difference
})
```

### "Timeout waiting for selector"

**Symptoms:**
- Test fails with timeout
- Selector never appears

**Solutions:**

1. Wait explicitly:
```typescript
await page.waitForSelector('[data-testid="board-container"]')
```

2. Increase timeout:
```typescript
await page.waitForSelector('[data-testid="board-container"]', {
  timeout: 10000
})
```

3. Check if selector is correct:
```typescript
// Use browser console to verify
await page.pause()
```

### "Test failed: browser not connected"

**Symptoms:**
- Test fails immediately
- Browser doesn't start

**Solutions:**

1. Check if port is already in use:
```bash
netstat -ano | findstr :3000
```

2. Kill existing processes:
```bash
taskkill /F /IM node.exe
```

3. Restart test server:
```bash
npm run test:e2e
```

## Best Practices

### 1. Use data-testid for Selectors

```typescript
// Good
await page.click('[data-testid="save-button"]')

// Bad (CSS changes break this)
await page.click('.btn.btn-primary')

// Bad (Text changes break this)
await page.click('text=Save')
```

### 2. Wait for Elements

```typescript
// Good (explicit wait)
await page.waitForSelector('[data-testid="board-container"]')

// Bad (hardcoded timeout)
await page.waitForTimeout(5000)

// Good (auto-waiting)
await expect(page.locator('[data-testid="board-container"]')).toBeVisible()
```

### 3. Test Critical Paths Only

```typescript
// Good (critical user journey)
test('user creates a task', async ({ page }) => {
  // Create task
  // Verify task appears
})

// Bad (testing implementation detail)
test('button has correct class', async ({ page }) => {
  const className = await page.locator('button').getAttribute('class')
  expect(className).toContain('btn-primary')
})
```

### 4. Use Fixtures for Setup

```typescript
// Good (reusable fixture)
import { createTestBoard } from './fixtures/test-board'

test('board loads', async ({ page }) => {
  const board = createTestBoard()
  // Test with board
})

// Bad (inline setup)
test('board loads', async ({ page }) => {
  const board = {
    columns: [...],
    tasks: [...],
    // ...
  }
  // Test with board
})
```

## Tips

1. **Run tests in UI mode** for debugging: `npm run test:e2e:ui`
2. **Use trace viewer** for failed tests: `npx playwright show-trace trace.zip`
3. **Keep tests simple** - one test should verify one user journey
4. **Use beforeEach** for setup to keep tests independent
5. **Clean up test data** in `afterEach` if needed
6. **Use page.pause()** to debug interactively
7. **Test on real browsers** - don't rely only on headless mode

## CI/CD

E2E tests run automatically in CI:
- On push to `main` or `develop`
- On pull requests to `main` or `develop`

**Required browsers in CI:**
- Chromium (Linux)
- Firefox (Linux)

**Optional (local only):**
- WebKit (Safari)
- Mobile Chrome

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright GitHub Actions](https://playwright.dev/docs/ci-intro)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
