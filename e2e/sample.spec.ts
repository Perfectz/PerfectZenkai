import { test, expect } from '@playwright/test'

test.describe('Sample E2E Tests', () => {
  test('should display Perfect Zenkai header and take screenshot', async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto('/')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that the header contains "Perfect Zenkai" - use role selector to be specific
    const header = page.getByRole('heading', { name: 'Perfect Zenkai' })
    await expect(header).toBeVisible()

    // Take a screenshot for visual verification
    await page.screenshot({
      path: 'e2e/screenshots/sample.png',
      fullPage: true,
    })
  })

  test('should have mobile viewport dimensions', async ({ page }) => {
    await page.goto('/')

    // Verify mobile viewport is being used
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(375)
    expect(viewport?.height).toBe(667)
  })

  test('should display navigation bar at bottom', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that navigation bar exists
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()

    // Verify it contains navigation items
    await expect(nav).toContainText('Dashboard')
    await expect(nav).toContainText('Weight')
    await expect(nav).toContainText('Tasks')
  })

  test('should display floating action button', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that FAB exists and is visible
    const fab = page.locator('[data-testid="global-fab"]')
    await expect(fab).toBeVisible()
  })
})
