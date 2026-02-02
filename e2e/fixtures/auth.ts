import { test as base } from '@playwright/test'

export type AuthFixtures = {
  authenticatedPage: typeof test['Page']
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Mock authentication for E2E tests
    await page.goto('/login')

    // Fill in test credentials
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')

    await page.click('button[type="submit"]')

    // Wait for redirect to board
    await page.waitForURL('/', { timeout: 5000 })

    await use(page)
  },
})
