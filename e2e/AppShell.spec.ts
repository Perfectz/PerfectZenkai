import { test, expect } from '@playwright/test'

test.describe('AppShell', () => {
  test('should render header, navigation, and FAB', async ({ page }) => {
    await page.goto('/')

    // Check header is visible
    await expect(page.getByText('Perfect Zenkai')).toBeVisible()

    // Check navigation bar is visible
    await expect(page.locator('nav')).toBeVisible()

    // Check FAB is visible
    await expect(page.locator('button[class*="fixed bottom-20 right-4"]')).toBeVisible()

    // Check main content
    await expect(page.getByText('Welcome to Perfect Zenkai')).toBeVisible()
  })

  test('should have proper layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Verify elements are positioned correctly
    const fab = page.locator('button[class*="fixed bottom-20 right-4"]')
    const nav = page.locator('nav')

    await expect(fab).toBeVisible()
    await expect(nav).toBeVisible()

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/appshell-mobile.png' })
  })
}) 