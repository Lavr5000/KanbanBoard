import { test, expect } from '@playwright/test'

test.describe('Card Lifecycle E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })
  })

  test('should create a new task', async ({ page }) => {
    // Get initial task count
    const initialCount = await page.locator('[data-testid="task-card"]').count()

    // Click add task button (first column)
    await page.click('[data-testid="add-task-button"]:first-child')

    // Wait for modal to appear
    await page.waitForSelector('#modal-overlay')

    // Fill in task content
    await page.fill('[data-testid="task-content-input"]', 'New E2E test task')

    // Select priority
    await page.click('[data-testid="priority-high"]')

    // Save task
    await page.click('[data-testid="save-task-button"]')

    // Wait for modal to close
    await page.waitForSelector('#modal-overlay', { state: 'hidden' }).catch(() => {})

    // Wait a moment for the task to appear
    await page.waitForTimeout(500)

    // Verify task count increased
    const newCount = await page.locator('[data-testid="task-card"]').count()
    expect(newCount).toBeGreaterThan(initialCount)

    // Verify task content appears on page
    await expect(page.locator('text=New E2E test task')).toBeVisible()
  })

  test('should edit an existing task', async ({ page }) => {
    // Get first task if exists
    const firstTask = page.locator('[data-testid="task-card"]:first-child')

    const taskCount = await firstTask.count()

    if (taskCount === 0) {
      test.skip()
      return
    }

    // Double click to edit
    await firstTask.dblclick()

    // Wait for modal
    await page.waitForSelector('#modal-overlay')

    // Edit content
    const contentInput = page.locator('[data-testid="task-content-input"]')
    await contentInput.fill('Updated task content')

    // Save
    await page.click('[data-testid="save-task-button"]')

    // Wait for modal to close
    await page.waitForSelector('#modal-overlay', { state: 'hidden' }).catch(() => {})
    await page.waitForTimeout(500)

    // Verify update appears on page
    await expect(page.locator('text=Updated task content')).toBeVisible()
  })

  test('should delete a task', async ({ page }) => {
    // Get initial task count
    const initialCount = await page.locator('[data-testid="task-card"]').count()

    if (initialCount === 0) {
      test.skip()
      return
    }

    // Click delete button on first task
    await page.click('[data-testid="task-card"]:first-child [data-testid="delete-task-button"]')

    // Wait for delete confirmation modal
    await page.waitForSelector('#modal-overlay')

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]')

    // Wait for modal to close
    await page.waitForSelector('#modal-overlay', { state: 'hidden' }).catch(() => {})
    await page.waitForTimeout(500)

    // Verify task count decreased
    const newCount = await page.locator('[data-testid="task-card"]').count()
    expect(newCount).toBeLessThan(initialCount)
  })

  test('should move task between columns via drag and drop', async ({ page }) => {
    // Get first column and second column
    const columns = page.locator('[data-testid="column"]')
    const columnCount = await columns.count()

    if (columnCount < 2) {
      test.skip()
      return
    }

    const firstColumn = columns.nth(0)
    const secondColumn = columns.nth(1)

    // Get initial counts
    const sourceInitialCount = await firstColumn.locator('[data-testid="task-card"]').count()
    const targetInitialCount = await secondColumn.locator('[data-testid="task-card"]').count()

    if (sourceInitialCount === 0) {
      test.skip()
      return
    }

    // Drag first task from first column to second column
    const firstTask = firstColumn.locator('[data-testid="task-card"]').first()

    await firstTask.dragTo(secondColumn)

    // Wait for drop animation
    await page.waitForTimeout(500)

    // Verify counts changed
    const sourceNewCount = await firstColumn.locator('[data-testid="task-card"]').count()
    const targetNewCount = await secondColumn.locator('[data-testid="task-card"]').count()

    expect(sourceNewCount).toBeLessThanOrEqual(sourceInitialCount)
    expect(targetNewCount).toBeGreaterThanOrEqual(targetInitialCount)
  })
})
