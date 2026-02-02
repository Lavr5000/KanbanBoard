# Unit Tests

This directory contains Vitest unit and integration tests.

## Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test -- --watch

# Specific file
npm run test -- Board.unit.test.tsx

# Coverage
npm run test:coverage

# UI mode
npm run test:ui
```

## File Naming

- `*.unit.test.tsx` - Isolated component tests
- `*.integration.test.ts` - Multi-component/state tests
- `setup.ts` - Global test configuration
- `mocks.ts` - Centralized test mocks

## Test Categories

### Component Tests (`*.unit.test.tsx`)

Test individual components in isolation.

**What to test:**
- Rendering with different props
- User interactions (clicks, inputs)
- State changes
- Conditional rendering

**What NOT to test:**
- Implementation details (internal functions)
- Third-party library behavior
- CSS styles
- Framework internals

**Examples:**
- `Board.unit.test.tsx` - Board component rendering
- `TaskCard.unit.test.tsx` - Task card interactions
- `Modal.unit.test.tsx` - Modal visibility and behavior
- `AddTaskModal.unit.test.tsx` - Add task form validation
- `EditTaskModal.unit.test.tsx` - Edit task form
- `ExportModal.unit.test.tsx` - Export functionality
- `BoardBackground.unit.test.tsx` - Background components

### Integration Tests (`*.integration.test.ts`)

Test how components work together.

**What to test:**
- Component + Context
- Component + Store (Zustand)
- Component + Custom hooks
- Multi-component workflows

**Examples:**
- `Store.integration.test.ts` - Zustand store state management
- `DragDrop.integration.test.tsx` - Drag-drop interactions

## Mocking

All mocks are centralized in `mocks.ts`. Import them in your tests:

```typescript
import { vi } from 'vitest'

// Mocks are auto-imported from setup.ts
// Available mocks:
// - @supabase/supabase-js
// - @dnd-kit/core
// - @dnd-kit/utilities
// - @dnd-kit/sortable
```

### Module Mocking

```typescript
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mock' }))
}))
```

### Component Mocking

```typescript
vi.mock('@/features/some/Component', () => ({
  SomeComponent: () => <div>Mock</div>
}))
```

### Function Mocking

```typescript
const mockFn = vi.fn()
mockFn.mockReturnValue('result')
mockFn.mockResolvedValue('async-result')
```

## Async Testing

```typescript
import { waitFor } from '@testing-library/react'

it('handles async operation', async () => {
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
```

## React 19 Specific

Testing React 19 features:

```typescript
import { userEvent } from '@testing-library/user-event'

it('works with concurrent rendering', async () => {
  const user = userEvent.setup()
  render(<Component />)

  // Rapid changes test concurrent rendering
  await user.type(input, 'ABC')
  expect(input).toHaveValue('ABC')
})
```

### Testing useTransition

```typescript
it('shows pending state during transition', async () => {
  render(<Component />)
  const button = screen.getByText('Update')

  await userEvent.click(button)

  // Should show pending state
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // Should show completed state
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument()
  })
})
```

### Testing useOptimistic

```typescript
it('shows optimistic updates', async () => {
  render(<Component />)
  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'New value')

  // Should show optimistic update immediately
  expect(screen.getByText('New value')).toBeInTheDocument()

  // Should show confirmed state after server responds
  await waitFor(() => {
    expect(screen.getByText('Saved: New value')).toBeInTheDocument()
  })
})
```

## Common Patterns

### Testing Conditional Rendering

```typescript
it('shows content when prop is true', () => {
  render(<Component show={true} />)
  expect(screen.getByText('Content')).toBeInTheDocument()
})

it('hides content when prop is false', () => {
  render(<Component show={false} />)
  expect(screen.queryByText('Content')).not.toBeInTheDocument()
})
```

### Testing User Interactions

```typescript
it('calls onClick when button is clicked', async () => {
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Click me</Button>)

  await userEvent.click(screen.getByRole('button'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Testing Form Input

```typescript
it('updates input value', async () => {
  render(<Form />)

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'Hello')

  expect(input).toHaveValue('Hello')
})
```

### Testing Form Validation

```typescript
it('shows error when input is empty', async () => {
  render(<Form />)

  const submitButton = screen.getByRole('button', { name: 'Submit' })
  await userEvent.click(submitButton)

  expect(screen.getByText('Required')).toBeInTheDocument()
})
```

## Debugging Tests

### Using test.each

```typescript
test.each([
  { input: 'a', expected: 'A' },
  { input: 'b', expected: 'B' },
  { input: 'c', expected: 'C' },
])('transforms $input to $expected', ({ input, expected }) => {
  expect(transform(input)).toBe(expected)
})
```

### Using describe.each

```typescript
describe.each([
  { priority: 'high', color: 'red' },
  { priority: 'medium', color: 'yellow' },
  { priority: 'low', color: 'green' },
])('$priority priority', ({ priority, color }) => {
  it(`has ${color} color`, () => {
    render(<TaskCard priority={priority} />)
    expect(screen.getByTestId('task-card')).toHaveClass(`bg-${color}`)
  })
})
```

### Debugging with screen.debug

```typescript
it('debugs component', () => {
  render(<Component />)
  screen.debug() // Prints component HTML to console
})
```

### Debugging with console.log

```typescript
it('logs state', () => {
  const { container } = render(<Component />)
  console.log(container.innerHTML)
})
```

## Test Coverage

View coverage report:
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

**Current Goals:**
- Critical paths: 80%+
- UI components: 60%+
- Utilities: 90%+

## Tips

1. **Use semantic queries**: `getByRole('button')` > `getByText('Save')` > `getByClassName('.btn')`
2. **Test behavior, not implementation**: Test what users see and do, not how it works internally
3. **Keep tests simple**: Each test should test one thing
4. **Use beforeEach for setup**: Keep tests independent
5. **Mock external dependencies**: Don't test third-party libraries
6. **Use waitFor for async**: Don't rely on hardcoded timeouts
7. **Clean up after tests**: Use `afterEach` if needed

## Troubleshooting

### Test fails with "Expected static flag was missing"

This is a React 19 compatibility issue. Ensure:
- `@testing-library/react` is v16.1.0+
- `@testing-library/user-event` is v14.5.0+
- Components use proper React 19 patterns

### Test is flaky (sometimes passes, sometimes fails)

This is usually a timing issue. Solutions:
- Use `waitFor` instead of `waitFor`
- Add explicit waits for animations: `await waitFor(() => ...)`
- Increase timeout: `it('test', async () => { ... }, { timeout: 10000 })`

### Mock doesn't work

Check:
1. Mock path matches actual import path
2. Mock is defined before `import` statements (hoisted)
3. Mock returns the right shape

### "Cannot find module" error

This is usually a path alias issue. Check:
1. `tsconfig.json` has correct `paths`
2. `vitest.config.ts` has correct `resolve.alias`
3. Import uses correct alias: `@/` not `./src/`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)
- [User Event API](https://testing-library.com/docs/user-event/intro)
