# Pull Request

## Description
<!-- Brief description of changes -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Related Issues
<!-- Link to related issues -->
- Closes #[issue number]
- Relates to #[issue number]

## Testing

### Unit Tests
- [ ] Added new tests for the changes
- [ ] All existing tests pass locally
- [ ] Run `npm run test` to verify

**Test files added/modified:**
<!-- List test files -->

### E2E Tests
- [ ] Added new E2E tests for critical paths
- [ ] All E2E tests pass locally
- [ ] Run `npm run test:e2e` to verify

**E2E test files added/modified:**
<!-- List E2E test files -->

### Visual Regression
- [ ] Screenshots updated if UI changed
- [ ] No unexpected visual differences
- [ ] Run `npx playwright test --update-snapshots` if needed

### Type Checking
- [ ] No TypeScript errors
- [ ] Run `npm run typecheck` to verify

### Linting
- [ ] Code passes ESLint checks
- [ ] Run `npm run lint` to verify

## Pre-commit Checklist
- [ ] Pre-commit hooks passed locally (or `--no-verify` was used intentionally)
- [ ] Code follows project style guidelines
- [ ] Self-review of code changes completed
- [ ] Comments added to complex logic
- [ ] Documentation updated (if needed)
- [ ] No console.log statements left in production code
- [ ] No commented-out code left in production code

## Bug Prevention

### Does this fix a user-reported bug?
- [ ] Yes
- [ ] No

If yes, which bug?
<!-- Bug description or issue link -->
- Bug #[number]: [description]

### Does this add tests to prevent similar bugs?
- [ ] Yes, unit tests added
- [ ] Yes, E2E tests added
- [ ] Yes, visual regression tests added
- [ ] N/A

## Breaking Changes
<!-- Are there any breaking changes? -->
- [ ] Yes (describe below)
- [ ] No

If yes, describe the breaking changes:
<!-- What changed? How should users migrate? -->

## Performance Impact
<!-- Does this change impact performance? -->
- [ ] Yes (describe below)
- [ ] No

If yes, describe the impact:
<!-- Faster? Slower? More memory? -->

## Screenshots (if applicable)

<!-- Add screenshots for visual changes -->
<!-- Use code blocks or attach images -->

### Before
<!-- Screenshot or description -->

### After
<!-- Screenshot or description -->

## Migration Notes
<!-- If this is a breaking change, how should users migrate? -->

## Checklist for Specific Changes

### If adding new components:
- [ ] Component has TypeScript types
- [ ] Component has unit tests
- [ ] Component has data-testid attributes (if needed for E2E)
- [ ] Component follows existing patterns

### If adding new features:
- [ ] Feature has unit tests
- [ ] Feature has E2E tests for critical paths
- [ ] Feature is documented (if user-facing)
- [ ] Feature handles errors gracefully

### If fixing bugs:
- [ ] Bug is reproducible with tests
- [ ] Fix doesn't break existing functionality
- [ ] Similar bugs are prevented with tests

### If updating dependencies:
- [ ] Reviewed changelogs for breaking changes
- [ ] Tested manually for regressions
- [ ] No new security vulnerabilities
- [ ] Run `npm audit` to verify

### If changing UI:
- [ ] Visual regression tests updated
- [ ] Screenshots reviewed
- [ ] Responsive design tested
- [ ] Accessibility considered (keyboard, screen reader)

## Additional Context
<!-- Any additional information -->

## Staging Environment
<!-- Link to staging deployment if available -->

### How to Test
<!-- Step-by-step instructions for reviewers -->
1.
2.
3.

### Test Data
<!-- Any special test data needed -->

## Reviewer Focus Areas
<!-- What should reviewers pay special attention to? -->
-
-
-

## Notes for Reviewers
<!-- Any helpful context for reviewers -->

---

## CI Status

**Before merging, ensure all CI checks pass:**

- [ ] TypeScript Type Check
- [ ] Unit Tests (Vitest)
- [ ] E2E Tests (Playwright)
- [ ] ESLint Check
- [ ] Security Audit
- [ ] Coverage Threshold (50%)

**View CI results:** [Actions](../../actions)

---

## Merge Instructions

Once approved and all checks pass:

1. **Squash and merge** (preferred) or **Merge commit**
2. **Delete branch** after merge
3. **Verify deployment** to staging/production

**DO NOT merge if:**
- Any CI check is failing
- Tests are flaky
- Coverage dropped significantly
- Breaking changes without migration guide
- No tests for new features
