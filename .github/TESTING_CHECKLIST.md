# Test Maintenance Checklist

This checklist ensures test quality and long-term maintainability.

## Weekly Tasks

- [ ] **Review failed tests in GitHub Actions**
  - Check for flaky tests
  - Investigate consistent failures
  - Fix or update tests as needed

- [ ] **Update flaky tests**
  - Identify tests with inconsistent results
  - Add proper waits/timeouts
  - Fix timing issues

- [ ] **Review Dependabot PRs for testing dependencies**
  - Vitest, Playwright, React Testing Library updates
  - Review changelogs for breaking changes
  - Test in local environment before merging

- [ ] **Check coverage trends**
  - Review coverage report in Codecov
  - Ensure no significant drops
  - Add tests for uncovered critical paths

**Time estimate:** 30-60 minutes per week

## Monthly Tasks

- [ ] **Run full test suite on all browsers**
  ```bash
  npm run test:e2e -- --project=chromium
  npm run test:e2e -- --project=firefox
  npm run test:e2e -- --project=webkit
  ```

- [ ] **Review and update outdated test data**
  - Check fixtures for stale data
  - Update test data to match current features
  - Remove unused fixtures

- [ ] **Check for new React 19 testing best practices**
  - Review React testing documentation
  - Update tests for new patterns
  - Check for deprecated APIs

- [ ] **Update testing dependencies**
  - Check for new versions: Vitest, Playwright, etc.
  - Review breaking changes
  - Test locally before deploying

- [ ] **Review visual regression baselines**
  - Check for intentional vs unintentional changes
  - Update screenshots if UI changed
  - Investigate unexpected differences

**Time estimate:** 1-2 hours per month

## Quarterly Tasks

- [ ] **Audit test coverage gaps**
  - Review coverage report
  - Identify untested critical paths
  - Plan tests for gaps

- [ ] **Remove redundant tests**
  - Find duplicate test cases
  - Consolidate similar tests
  - Remove tests that don't add value

- [ ] **Consolidate similar tests**
  - Use `test.each()` for data-driven tests
  - Share setup code in fixtures
  - Create reusable helper functions

- [ ] **Review and update testing documentation**
  - Update TESTING.md with new patterns
  - Add examples for common scenarios
  - Fix outdated documentation

- [ ] **Assess if new test types are needed**
  - Performance tests?
  - Accessibility tests?
  - Integration tests for new features?

**Time estimate:** 2-4 hours per quarter

## When Adding New Features

### 1. Unit Tests
- [ ] Add component tests for new components
- [ ] Test all user interactions
- [ ] Test edge cases (empty states, errors, loading)
- [ ] Test with different props
- [ ] Add React 19 compatibility tests (if using new features)

### 2. E2E Tests
- [ ] Add critical user journey tests
- [ ] Test happy path
- [ ] Test error paths
- [ ] Add `data-testid` attributes for new elements

### 3. Visual Tests
- [ ] Add screenshot tests if UI changed
- [ ] Test responsive design
- [ ] Test dark mode (if applicable)

### 4. Type Safety
- [ ] Ensure no new TypeScript errors
- [ ] Run `npm run typecheck`
- [ ] Add proper types for new code

### 5. Documentation
- [ ] Update TESTING.md if new patterns introduced
- [ ] Add examples to README files
- [ ] Document any new test utilities

## When Fixing Bugs

### 1. Reproduce
- [ ] Add test that reproduces the bug
- [ ] Verify test fails before fix
- [ ] Test should be specific to the bug

### 2. Fix
- [ ] Implement the fix
- [ ] Ensure fix doesn't break other tests
- [ ] Run full test suite

### 3. Verify
- [ ] Ensure test passes after fix
- [ ] Test manually if needed
- [ ] Add regression test for similar bugs

### 4. Prevent
- [ ] Add similar tests to prevent regression
- [ ] Update documentation if bug revealed knowledge gap
- [ ] Consider adding E2E test for critical bugs

## When Updating Dependencies

### 1. Check
- [ ] Review changelogs for breaking changes
- [ ] Check for deprecated APIs
- [ ] Look for new features that could improve tests

### 2. Test
- [ ] Run full test suite
- [ ] Run E2E tests on all browsers
- [ ] Test visually if UI library updated

### 3. Audit
- [ ] Run `npm audit`
- [ ] Review security vulnerabilities
- [ ] Update if critical vulnerabilities found

### 4. Update
- [ ] Update tests if API changed
- [ ] Update mocks if needed
- [ ] Update documentation

## Test Health Indicators

### Healthy
- [ ] All tests pass consistently
- [ ] Test execution time < 5 minutes
- [ ] Coverage > 70% for critical paths
- [ ] No flaky tests
- [ ] CI/CD passes on every push

### Needs Attention
- [ ] Flaky tests (pass/fail inconsistently)
- [ ] Slow tests (execution time increasing)
- [ ] Declining coverage
- [ ] Many skipped tests
- [ ] Tests need frequent updates

### Action Required
- [ ] Consistently failing tests
- [ ] Broken CI pipeline
- [ ] Type errors in CI
- [ ] Visual regression failures
- [ ] Coverage dropped below threshold

## Test Metrics to Track

### Coverage
- **Goal:** 70%+ for critical paths
- **Threshold:** 50% minimum (enforced in CI)
- **Trend:** Should be stable or increasing

### Execution Time
- **Unit tests:** < 2 minutes
- **E2E tests:** < 3 minutes
- **Total:** < 5 minutes
- **Trend:** Should be stable or decreasing

### Flaky Test Rate
- **Goal:** 0% flaky tests
- **Action Required:** If > 5% flaky
- **Solution:** Add proper waits, fix timing issues

### CI Pass Rate
- **Goal:** 100% pass rate
- **Action Required:** If < 95% pass
- **Solution:** Fix failing tests, update snapshots

## Common Issues & Solutions

### Issue: Tests are slow

**Solutions:**
- Use `vi.mock()` instead of real implementations
- Reduce test data size
- Use `test.skip()` for slow tests during development
- Run tests in parallel (Vitest does this by default)

### Issue: Tests are flaky

**Solutions:**
- Add `waitFor()` for async operations
- Increase timeout for slow operations
- Use `beforeEach()` for setup
- Avoid hardcoded timeouts (`waitForTimeout`)

### Issue: Coverage dropped

**Solutions:**
- Add tests for uncovered code
- Remove unused code (if not needed)
- Check if code is actually used
- Update coverage goals if realistic

### Issue: Visual regression failures

**Solutions:**
- Review diff in `playwright-report/`
- Update screenshots if change is intentional
- Fix bug if change is unintentional
- Adjust `maxDiffPixels` for anti-aliasing

## Test Quality Checklist

### Each Test Should:
- [ ] Test one thing (single responsibility)
- [ ] Have a clear, descriptive name
- [ ] Be independent of other tests
- [ ] Clean up after itself
- [ ] Use semantic queries (getByRole > getByText)
- [ ] Test behavior, not implementation
- [ ] Handle edge cases
- [ ] Be fast (< 100ms for unit tests)

### Each Test File Should:
- [ ] Have a clear purpose
- [ ] Use `describe()` blocks for organization
- [ ] Use `beforeEach()` for setup
- [ ] Use `afterEach()` for cleanup
- [ ] Mock external dependencies
- [ ] Have comprehensive coverage
- [ ] Be readable and maintainable

## Resources

- [Vitest Best Practices](https://vitest.dev/guide/why.html)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [React Testing Library Guidelines](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Best Practices](https://testingjavascript.com/)

## Template for Quarterly Review

```markdown
## QX 202X Test Review

### Coverage
- Current: XX%
- Last quarter: XX%
- Change: +/- XX%

### Test Count
- Unit tests: XX
- E2E tests: XX
- Total: XX

### Execution Time
- Unit tests: XXs
- E2E tests: XXs
- Total: XXs

### Issues Found
- Flaky tests: XX
- Fixed bugs: XX
- Prevented bugs: XX

### Actions Taken
- [ ] Fixed flaky tests
- [ ] Added tests for coverage gaps
- [ ] Updated dependencies
- [ ] Improved documentation

### Next Quarter Goals
- Increase coverage to XX%
- Reduce execution time to XXs
- Add XX new E2E tests
```
