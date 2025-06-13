import { test, expect } from '@playwright/test'

test.describe('AppShell', () => {
  test('should render header, navigation, and FAB', async ({ page }) => {
    await page.goto('/')

    // Check header is visible
    await expect(page.getByText('Cyber Warrior')).toBeVisible()
    await expect(page.getByText('Training Mode')).toBeVisible()

    // Check navigation bar is visible - look for navigation items instead
    await expect(page.getByText('HQ')).toBeVisible()
    await expect(page.getByText('Weight')).toBeVisible()
    await expect(page.getByText('Quests')).toBeVisible()
    await expect(page.getByText('Intel')).toBeVisible()

    // Check FAB is visible
    await expect(
      page.locator('button[class*="fixed bottom-20 right-4"]')
    ).toBeVisible()

    // Check main content - look for dashboard content
    await expect(page.getByText('CONTROL NEXUS')).toBeVisible()
  })

  test('should have proper layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Verify elements are positioned correctly
    const fab = page.locator('button[class*="fixed bottom-20 right-4"]')

    await expect(fab).toBeVisible()

    // Check navigation items are visible
    await expect(page.getByText('HQ')).toBeVisible()
    await expect(page.getByText('Weight')).toBeVisible()

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/appshell-mobile.png' })
  })
})
