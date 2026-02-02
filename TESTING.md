# Testing Guide

## Overview

This project uses a multi-layered testing approach to catch bugs before production:

- **Unit Tests (Vitest)**: Component logic, state management
- **E2E Tests (Playwright)**: Critical user journeys, visual regression
- **Pre-commit Hooks (Husky)**: TypeScript checking, linting
- **CI/CD (GitHub Actions)**: Automated testing on every push

## Quick Start

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Type check (no compilation)
npm run typecheck
```

## Project Structure

```
kanbanboard/
├── src/__tests__/               # Unit tests
│   ├── setup.ts                 # Test setup (jest-dom, cleanup)
│   ├── mocks.ts                 # Centralized test mocks
│   ├── Board.unit.test.tsx      # Component tests
│   ├── TaskCard.unit.test.tsx
│   ├── Modal.unit.test.tsx
│   └── Store.integration.test.ts
├── e2e/                        # E2E tests
│   ├── critical-flows/          # User journey tests
│   ├── visual-regression/       # Screenshot tests
│   ├── drag-drop/               # Drag-drop interactions
│   └── fixtures/                # Test data, helpers
├── vitest.config.ts             # Vitest configuration
├── playwright.config.ts         # Playwright configuration
└── .husky/                      # Pre-commit hooks
```

## Writing Unit Tests

### Component Test Template

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '@/features/my/ui/MyComponent'

describe('MyComponent', () => {
  const mockProps = {
    // Props here
  }

  it('renders correctly', () => {
    render(<MyComponent {...mockProps} />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    const mockAction = vi.fn()

    render(<MyComponent {...mockProps} onAction={mockAction} />)

    await user.click(screen.getByRole('button'))

    expect(mockAction).toHaveBeenCalled()
  })
})
```

### Testing Best Practices

1. **Test user behavior, not implementation details**
   - DO: Test that clicking a button calls a callback
   - DON'T: Test that a component has a specific className

2. **Use semantic queries**
   - `getByRole('button')` - Best
   - `getByText('Save')` - Good
   - `getByClassName('.btn')` - Avoid

3. **Mock external dependencies**
   - Use `vi.mock()` for modules
   - Use mock functions for callbacks
   - All centralized mocks are in `src/__tests__/mocks.ts`

4. **Test React 19 compatibility**
   - Test concurrent features (useTransition, useOptimistic)
   - Test rapid state changes
   - Test streaming UI patterns

## Writing E2E Tests

### E2E Test Template

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

### Visual Regression Tests

```typescript
test('modal appears correctly', async ({ page }) => {
  await page.click('[data-testid="open-modal"]')
  await expect(page).toHaveScreenshot('modal.png', {
    maxDiffPixels: 100,
  })
})
```

### E2E Best Practices

1. **Use data-testid for selectors** - Stable across CSS changes
2. **Wait for elements** - Use `waitForSelector` or auto-waiting
3. **Test critical paths only** - Don't test every edge case
4. **Use fixtures** - Share setup code between tests

## Test Data

### Creating Fixtures

```typescript
// e2e/fixtures/test-data.ts
export const mockTask = {
  id: 'test-task-1',
  content: 'Test task content',
  columnId: 'col-1',
  priority: 'high',
  createdAt: new Date().toISOString(),
  tags: [],
}
```

## Pre-commit Hooks

The pre-commit hook runs:
1. ESLint with auto-fix
2. TypeScript type check (`tsc --noEmit`)

**Note:** Type checking is NOT in pre-commit due to @testing-library/jest-dom type conflicts. Run manually before pushing.

To bypass (not recommended):
```bash
git commit --no-verify
```

## CI/CD

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

Required checks before merge:
- TypeScript Type Check
- Unit Tests
- E2E Tests
- ESLint Check
- Security Audit
- Coverage Threshold (50%)

## Common Issues

### React 19 Compatibility

**Issue**: Test fails with "Expected static flag was missing"
**Solution**: Ensure `@testing-library/react` is v16.1.0+

**Issue**: Framer Motion errors
**Solution**: Don't use Framer Motion 12.x with React 19 (use CSS animations)

**Issue**: Concurrent rendering test failures
**Solution**: Use proper async/await and waitFor for state updates

### Z-Index Bugs

**Issue**: Modal appears behind content (Bug #1)
**Test**: Use Playwright screenshot test with z-index assertion
**Location**: `e2e/visual-regression/modals.spec.ts`

### Drag-Drop Testing

**Issue**: Drag-drop tests are flaky
**Solution**:
1. Use `dragTo()` from @dnd-kit test utilities
2. Wait for animations: `await page.waitForTimeout(500)`
3. Increase timeout: `test.setTimeout(10000)`

### TypeScript Errors

**Issue**: Type error passes locally but fails in CI
**Solution**: Run `npm run typecheck` locally before pushing

**Issue**: jest-dom type errors
**Solution**: Use `tsconfig.vitest.json` for test files (automatically configured)

## Coverage Goals

- **Critical paths**: 80%+ coverage
- **UI components**: 60%+ coverage
- **Utilities**: 90%+ coverage

**Current threshold**: 50% minimum enforced in CI

View coverage report:
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

## Test Categories

### Unit Tests (`*.unit.test.tsx`)
- Component rendering with different props
- User interactions (clicks, inputs)
- State changes
- Conditional rendering
- Edge cases

### Integration Tests (`*.integration.test.ts`)
- Component + Context
- Component + Store (Zustand)
- Component + Custom hooks
- Multi-component workflows

### E2E Tests
- Critical user flows (create, edit, delete tasks)
- Visual regression (prevent Bug #1)
- Cross-browser compatibility
- React 19 compatibility

## React 19 Specific Testing

### Testing Concurrent Features

```typescript
it('works with concurrent rendering', async () => {
  const user = userEvent.setup()
  render(<Component />)

  // Rapid changes test concurrent rendering
  await user.type(input, 'ABC')
  expect(input).toHaveValue('ABC')
})
```

### Testing Server Components

For Next.js App Router:
- Server components are tested via E2E
- Client components are tested via unit tests
- Integration tests cover the full stack

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm run test -- Board.unit.test.tsx

# Run with UI for debugging
npm run test:ui

# Run tests in watch mode
npm run test -- --watch
```

### E2E Tests

```bash
# Run with UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Run specific test
npm run test:e2e -- card-lifecycle.spec.ts

# Update screenshots
npx playwright test --update-snapshots
```

### Playwright Inspector

```bash
# Opens inspector with step-by-step execution
npm run test:e2e:debug
```

### Trace Viewer

```bash
# View trace after test failure
npx playwright show-trace trace.zip
```

## Known Issues & Solutions

### Flaky Drag-Drop Tests

If drag-drop tests are flaky:
1. Increase timeout: `test.setTimeout(10000)`
2. Use `dragTo()` instead of manual drag events
3. Wait for animations: `await page.waitForTimeout(500)`
4. Check for CSS transitions interfering

### Screenshot Differences

If screenshots fail after visual changes:
1. Review the diff in `playwright-report/`
2. If change is intentional: `npx playwright test --update-snapshots`
3. If change is a bug: fix the bug

### Mock Issues

If mocks don't work:
1. Check `src/__tests__/mocks.ts` is imported
2. Verify mock path matches actual import
3. Use `vi.clearAllMocks()` in beforeEach if needed

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)
- [React 19 Testing Guide](https://react.dev/learn/testing)

## Test Statistics

**Current Test Coverage:**
- Unit Tests: 83 tests
- E2E Tests: 5 test files
- Coverage Threshold: 50%

**Test Files:**
- `src/__tests__/` - 11 test files
- `e2e/` - 5 test files (critical-flows, visual-regression, drag-drop, React 19 compatibility)

**CI/CD:**
- 3 GitHub Actions workflows (test, audit, coverage)
- Dependabot for dependency updates
- Branch protection rules enforced
