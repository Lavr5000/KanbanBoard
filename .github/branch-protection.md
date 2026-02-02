# Branch Protection Rules

## Main Branch Protection

To ensure code quality, the following rules should be configured for the `main` branch:

### Required Settings

1. **Require pull request reviews before merging**
   - Number of approvals required: 1
   - Dismiss stale reviews: Yes

2. **Require status checks to pass before merging**
   - Required checks:
     - TypeScript Type Check
     - Unit Tests (Vitest)
     - E2E Tests (Playwright)
     - ESLint Check
     - Security Audit

3. **Require branches to be up to date before merging**
   - Yes

4. **Do not allow bypassing the above settings**
   - No (except for admins)

### How to Configure

1. Go to repository Settings
2. Click "Branches" in left sidebar
3. Click "Add rule" or edit existing `main` rule
4. Configure settings as above
5. Save changes

## Pre-commit Hooks

Local development uses Husky + lint-staged for immediate feedback:

- TypeScript type checking on all `.ts`, `.tsx` files
- ESLint auto-fix on all `.ts`, `.tsx` files

## CI/CD Pipeline Flow

```
Push/PR
  -> typecheck (fastest, ~10s)
  -> unit-tests (~30s)
  -> e2e-tests (~2min)
  -> lint (~20s)

All must pass before merge is allowed.
```
