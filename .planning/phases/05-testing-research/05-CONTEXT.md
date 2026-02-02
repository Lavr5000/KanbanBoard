# Phase 05 Context: Testing System Failures

## Bugs Found by User (Not Caught by Tests)

### Bug #1: Modal z-index Issue (Recurring)
**Symptom:** Export button opens modal window behind column panels
**Root Cause:** Stacking context conflict - similar to DonationModal issue fixed earlier
**Why Tests Missed It:**
- No visual/regression tests for z-index stacking
- E2E tests don't verify modal visibility in full page context
- No automated visual regression for modal overlays

### Bug #2: Syntax Error in layout.tsx
**Symptom:** Broken TypeScript syntax after viewport refactoring
**Error:** `Expected ';', '}' or <eof>` at icons section
**Why Tests Missed It:**
- No TypeScript type checking in CI/CD
- Build errors only appear in dev mode
- No pre-commit hooks for compilation

### Bug #3: Framer Motion + React 19 Incompatibility
**Symptom:** "Expected static flag was missing" internal React error
**Root Cause:** framer-motion 12.x incompatible with React 19
**Why Tests Missed It:**
- No integration tests for React 19 compatibility
- Library version compatibility not tested
- Error only appears in browser console, not in Node tests

## Current Test Setup

### Existing Tests
```
src/
├── features/
│   └── donation/
│       └── __tests__/
│           └── donation.integration.test.md  (Markdown tests only!)
└── app/
    └── test-modal/
    └── test-stagger/
```

### Test Infrastructure Gaps
1. **No Jest/Vitest configuration** - only markdown integration tests
2. **No TypeScript checking in CI** - tsc --noEmit not run
3. **No E2E framework** - no Playwright/Cypress
4. **No visual regression** - no Percy/Chromatic
5. **No component testing** - no Testing Library
6. **No linting in CI** - ESLint exists but not enforced

## Project Tech Stack (for Test Research)

- **Framework:** Next.js 15.1.3 (App Router)
- **React:** 19.0.0 (NEW - compatibility issues)
- **TypeScript:** 5.x
- **Styling:** Tailwind CSS
- **State:** Zustand (not Redux as roadmap says)
- **Backend:** Supabase
- **Drag & Drop:** @dnd-kit
- **Removed:** framer-motion (replaced with CSS)

## Questions for Research Phase

1. **What testing setup works for React 19 + Next.js 15?**
   - Vitest vs Jest for React 19
   - @testing-library/react v16+ compatibility
   - Next.js 15 testing utilities

2. **How to catch z-index/stacking context bugs?**
   - Visual regression tools (Percy, Chromatic, Playwright screenshots)
   - z-index linting rules
   - E2E tests that verify modal visibility

3. **How to catch TypeScript syntax errors?**
   - Pre-commit hooks (husky + lint-staged)
   - CI pipeline with tsc --noEmit
   - IDE integration (ESLint + TypeScript)

4. **How to test library compatibility?**
   - Dependency audit tools
   - Automated testing after package updates
   - Type checking for third-party libs

5. **What's the minimal viable test setup?**
   - Core tests needed vs nice-to-have
   - Setup time vs coverage benefit
