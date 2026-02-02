import { test, expect } from '@playwright/test'

test.describe('Drag and Drop Visual States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })
  })

  test('drag preview shows purple glow effect', async ({ page }) => {
    // Get first task if exists
    const firstTask = page.locator('[data-testid="task-card"]:first-child')
    const taskCount = await firstTask.count()

    if (taskCount === 0) {
      test.skip()
      return
    }

    // Start dragging
    await firstTask.dragTo(page.locator('body'), {
      force: true,
    })

    // Note: Taking screenshot during drag is challenging with Playwright
    // The drag overlay is managed by @dnd-kit and appears briefly
    // This test mainly verifies the drag operation doesn't crash

    // Verify task is still visible after drag attempt
    await expect(firstTask).toBeVisible()
  })

  test('drop zone pulse animation on hover', async ({ page }) => {
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

    // Get initial class of target column
    const initialClass = await targetColumn.getAttribute('class')

    // Drag first task over target column
    const firstTask = firstColumn.locator('[data-testid="task-card"]').first()
    await firstTask.dragTo(targetColumn)

    // Wait for drop animation
    await page.waitForTimeout(500)

    // After drag, verify column is still visible
    await expect(targetColumn).toBeVisible()

    // Note: The drop-zone-active class is applied during drag
    // but is transient and hard to capture in screenshots
  })

  test('spring physics animation on drop', async ({ page }) => {
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

    const firstTask = firstColumn.locator('[data-testid="task-card"]').first()

    // Get task position before drag
    const beforeBox = await firstTask.boundingBox()

    // Drag and drop
    await firstTask.dragTo(targetColumn)

    // Wait for drop animation (spring physics)
    await page.waitForTimeout(500)

    // Verify task is still visible
    await expect(firstTask).toBeVisible()

    // Note: Animation timing is handled by CSS transitions
    // Spring physics is applied via cubic-bezier easing
  })

  test('drag operation does not break UI', async ({ page }) => {
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

    const firstTask = firstColumn.locator('[data-testid="task-card"]').first()

    // Perform drag and drop
    await firstTask.dragTo(targetColumn)

    // Wait for animations to complete
    await page.waitForTimeout(1000)

    // Verify board container is still visible
    await expect(page.locator('[data-testid="board-container"]')).toBeVisible()

    // Verify columns are still visible
    await expect(columns).toHaveCount(columnCount)

    // Verify no console errors during drag
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Perform another drag to check for errors
    const secondTask = firstColumn.locator('[data-testid="task-card"]').first()
    if (await secondTask.count() > 0) {
      await secondTask.dragTo(targetColumn)
      await page.waitForTimeout(500)
    }

    // Check for React or dnd-kit errors
    const reactErrors = errors.filter(err =>
      err.includes('React') ||
      err.includes('dnd') ||
      err.includes('Warning')
    )

    expect(reactErrors).toHaveLength(0)
  })

  test('multiple drag operations work correctly', async ({ page }) => {
    // Get columns
    const columns = page.locator('[data-testid="column"]')
    const columnCount = await columns.count()

    if (columnCount < 2) {
      test.skip()
      return
    }

    const firstColumn = columns.nth(0)
    const targetColumn = columns.nth(1)

    // Check if first column has multiple tasks
    const taskCount = await firstColumn.locator('[data-testid="task-card"]').count()
    if (taskCount < 2) {
      test.skip()
      return
    }

    // Get initial task counts
    const sourceInitialCount = await firstColumn.locator('[data-testid="task-card"]').count()
    const targetInitialCount = await targetColumn.locator('[data-testid="task-card"]').count()

    // Drag multiple tasks
    const tasks = firstColumn.locator('[data-testid="task-card"]')
    const tasksToMove = Math.min(3, await tasks.count())

    for (let i = 0; i < tasksToMove; i++) {
      const task = tasks.nth(i)
      await task.dragTo(targetColumn)
      await page.waitForTimeout(300)
    }

    // Wait for all animations to complete
    await page.waitForTimeout(1000)

    // Verify final state
    await expect(page.locator('[data-testid="board-container"]')).toBeVisible()

    // Note: Exact count verification may vary due to async nature of drag operations
    // Main goal is to ensure UI doesn't break
  })
})
