import { test, expect } from '@playwright/test'

test.describe('Modal Visual Regression (Z-Index Bug Prevention)', () => {
  test('Add task modal appears on top of all content', async ({ page }) => {
    await page.goto('/')

    // Wait for board to load
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    // Open add task modal
    await page.click('[data-testid="add-task-button"]:first-child')

    // Wait for modal to appear
    await page.waitForSelector('#modal-overlay')

    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('add-task-modal-visible.png', {
      maxDiffPixels: 100,
    })

    // Verify modal is visible (not hidden behind columns)
    const modal = page.locator('#modal-overlay')
    await expect(modal).toBeVisible()

    // Verify modal z-index is higher than columns
    const modalZIndex = await modal.evaluate(el =>
      window.getComputedStyle(el).zIndex
    )

    const columnZIndex = await page.locator('[data-testid="column"]').first().evaluate(el =>
      window.getComputedStyle(el).zIndex
    )

    expect(parseInt(modalZIndex || '0')).toBeGreaterThan(parseInt(columnZIndex || '0'))
  })

  test('Modal overlay covers entire screen', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    // Open modal
    await page.click('[data-testid="add-task-button"]:first-child')
    await page.waitForSelector('#modal-overlay')

    // Screenshot
    await expect(page).toHaveScreenshot('add-task-modal-full-coverage.png', {
      maxDiffPixels: 100,
    })

    // Verify modal overlay covers entire screen
    const overlay = page.locator('#modal-overlay')
    const box = await overlay.boundingBox()

    expect(box?.width).toBeGreaterThanOrEqual(await page.viewportSize().then(v => v?.width || 0))
    expect(box?.height).toBeGreaterThanOrEqual(await page.viewportSize().then(v => v?.height || 0))
  })

  test('Modal backdrop closes modal on click', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    // Open modal
    await page.click('[data-testid="add-task-button"]:first-child')
    await page.waitForSelector('#modal-overlay')

    // Click backdrop (outside modal content)
    const overlay = page.locator('#modal-overlay')
    await overlay.click({ position: { x: 10, y: 10 } })

    // Modal should close
    await expect(overlay).not.toBeVisible()
  })

  test('Modal content is visible and readable', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    // Open modal
    await page.click('[data-testid="add-task-button"]:first-child')
    await page.waitForSelector('#modal-overlay')

    // Check that modal content is visible
    const modalContent = page.locator('#modal-overlay .bg-\\[\\#1c1c24\\]')
    await expect(modalContent).toBeVisible()

    // Check that input field is visible and editable
    const input = page.locator('[data-testid="task-content-input"]')
    await expect(input).toBeVisible()
    await expect(input).toBeEditable()

    // Check that priority buttons are visible
    await expect(page.locator('[data-testid="priority-low"]')).toBeVisible()
    await expect(page.locator('[data-testid="priority-medium"]')).toBeVisible()
    await expect(page.locator('[data-testid="priority-high"]')).toBeVisible()

    // Check that save button is visible
    await expect(page.locator('[data-testid="save-task-button"]')).toBeVisible()
  })

  test('No z-index issues - modal always on top', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 10000 })

    // Open modal
    await page.click('[data-testid="add-task-button"]:first-child')
    await page.waitForSelector('#modal-overlay')

    // Get all z-index values on page
    const zIndexValues = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*')
      const values: number[] = []

      allElements.forEach(el => {
        const styles = window.getComputedStyle(el)
        const zIndex = parseInt(styles.zIndex)
        if (!isNaN(zIndex)) {
          values.push(zIndex)
        }
      })

      return values
    })

    // Modal should have the highest z-index
    const maxZIndex = Math.max(...zIndexValues)
    const modalZIndex = await page.locator('#modal-overlay').evaluate(el =>
      parseInt(window.getComputedStyle(el).zIndex)
    )

    expect(modalZIndex).toBeGreaterThanOrEqual(maxZIndex)
  })
})
