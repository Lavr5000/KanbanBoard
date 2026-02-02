import { test as base } from '@playwright/test'

export type TestBoardFixtures = {
  testBoardPage: typeof test['Page']
}

export const test = base.extend<TestBoardFixtures>({
  testBoardPage: async ({ page }, use) => {
    // Navigate to board
    await page.goto('/')

    // Wait for board to load
    await page.waitForSelector('[data-testid="board-container"]', { timeout: 5000 })

    await use(page)
  },
})

export { expect } from '@playwright/test'
