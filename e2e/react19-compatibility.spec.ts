import { test, expect } from '@playwright/test'

test.describe('React 19 Compatibility', () => {
  test('no React 19 internal errors in console', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    // Interact with various components
    // Open modal
    await page.click('[data-testid="add-task-button"]:first-child')
    await page.waitForSelector('#modal-overlay')

    // Fill input
    await page.fill('[data-testid="task-content-input"]', 'Test task')

    // Close modal
    const overlay = page.locator('#modal-overlay')
    await overlay.click({ position: { x: 10, y: 10 } })

    // Wait for modal to close
    await page.waitForTimeout(500)

    // Check for React 19 specific errors
    const reactErrors = consoleErrors.filter(err =>
      err.includes('Expected static flag') ||
      err.includes('React 19') ||
      err.includes('concurrent') ||
      err.includes('Warning:') ||
      err.includes('useEffect')
    )

    // Allow some non-critical warnings but fail on errors
    const criticalErrors = reactErrors.filter(err =>
      !err.includes('componentWillReceiveProps') &&
      !err.includes('componentWillMount')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('concurrent features work correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    // Open modal
    await page.click('[data-testid="add-task-button"]:first-child')
    await page.waitForSelector('#modal-overlay')

    // Rapid inputs (should be handled by React 19 concurrent rendering)
    const input = page.locator('[data-testid="task-content-input"]')

    await input.fill('A')
    await page.waitForTimeout(50)
    await input.fill('AB')
    await page.waitForTimeout(50)
    await input.fill('ABC')
    await page.waitForTimeout(50)

    // Should not cause any issues
    await expect(input).toHaveValue('ABC')

    // Close modal
    const overlay = page.locator('#modal-overlay')
    await overlay.click({ position: { x: 10, y: 10 } })
    await page.waitForTimeout(500)

    // Verify UI is still responsive
    await expect(page.locator('[data-testid="board-container"]')).toBeVisible()
  })

  test('state updates work correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Get initial task count
    const initialCount = await page.locator('[data-testid="task-card"]').count()

    // Open modal
    await page.click('[data-testid="add-task-button"]:first-child')
    await page.waitForSelector('#modal-overlay')

    // Fill and save (triggers state update)
    await page.fill('[data-testid="task-content-input"]', 'React 19 compatibility test')
    await page.click('[data-testid="priority-high"]')
    await page.click('[data-testid="save-task-button"]')

    // Wait for state update
    await page.waitForTimeout(1000)

    // Verify task was created
    const newCount = await page.locator('[data-testid="task-card"]').count()
    expect(newCount).toBeGreaterThan(initialCount)

    // Check for React errors
    const reactErrors = consoleErrors.filter(err =>
      err.includes('state') ||
      err.includes('render') ||
      err.includes('Maximum update depth')
    )

    expect(reactErrors).toHaveLength(0)
  })

  test('no memory leaks during rapid interactions', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Rapid open/close of modal (tests cleanup)
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="add-task-button"]:first-child')
      await page.waitForSelector('#modal-overlay')
      await page.waitForTimeout(100)

      const overlay = page.locator('#modal-overlay')
      await overlay.click({ position: { x: 10, y: 10 } })
      await page.waitForTimeout(100)
    }

    // Check for memory leak warnings
    const memoryErrors = consoleErrors.filter(err =>
      err.includes('memory') ||
      err.includes('leak') ||
      err.includes('listener')
    )

    expect(memoryErrors).toHaveLength(0)

    // Verify UI is still functional
    await expect(page.locator('[data-testid="board-container"]')).toBeVisible()
  })

  test('drag and drop works with React 19', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Get columns
    const columns = page.locator('[data-testid="column"]')
    const columnCount = await columns.count()

    if (columnCount < 2) {
      test.skip()
      return
    }

    const firstColumn = columns.nth(0)
    const targetColumn = columns.nth(1)

    // Check if first column has tasks
    const taskCount = await firstColumn.locator('[data-testid="task-card"]').count()
    if (taskCount === 0) {
      test.skip()
      return
    }

    // Perform drag and drop (tests React 19 concurrent features with dnd-kit)
    const firstTask = firstColumn.locator('[data-testid="task-card"]').first()
    await firstTask.dragTo(targetColumn)
    await page.waitForTimeout(500)

    // Check for React or dnd-kit errors
    const reactErrors = consoleErrors.filter(err =>
      err.includes('React') ||
      err.includes('dnd') ||
      err.includes('useRef') ||
      err.includes('concurrent')
    )

    expect(reactErrors).toHaveLength(0)

    // Verify UI is still functional
    await expect(page.locator('[data-testid="board-container"]')).toBeVisible()
  })

  test('useEffect and cleanup work correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate away and back (triggers cleanup and re-mount)
    await page.goto('/about')
    await page.waitForTimeout(500)
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    // Check for cleanup errors
    const cleanupErrors = consoleErrors.filter(err =>
      err.includes('cleanup') ||
      err.includes('useEffect') ||
      err.includes('memory leak')
    )

    expect(cleanupErrors).toHaveLength(0)

    // Verify board is still functional
    await expect(page.locator('[data-testid="board-container"]')).toBeVisible()
  })
})
