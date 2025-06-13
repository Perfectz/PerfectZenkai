import { test, expect } from '@playwright/test'

test.describe('Navigate to Weight', () => {
  test('should navigate to weight page via bottom nav', async ({ page }) => {
    // Start on dashboard
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Click Weight nav icon
    const weightNav = page.getByRole('link', { name: /weight/i })
    await expect(weightNav).toBeVisible()
    await weightNav.click()

    // Verify navigation to weight page
    await expect(page).toHaveURL('/weight')

    // Verify nav item shows active state
    await expect(weightNav).toHaveClass(/text-primary/)

    // Verify WeightPage content is visible
    await expect(page.getByText('Weight History')).toBeVisible()
    await expect(page.getByText('No weights logged yet')).toBeVisible()

    // Verify FAB is visible on weight page
    await expect(page.getByTestId('global-fab')).toBeVisible()
  })

  test('should show active state when on weight pages', async ({ page }) => {
    // Navigate directly to weight page
    await page.goto('/weight')

    // Verify active state styling
    const weightNav = page.getByRole('link', { name: /weight/i })
    await expect(weightNav).toHaveClass(/text-primary/)

    // Verify icon and text are properly aligned
    await expect(weightNav.locator('svg')).toBeVisible() // BarChart3 icon
    await expect(weightNav.getByText('Weight')).toBeVisible()
  })

  test('should maintain navigation state across page interactions', async ({
    page,
  }) => {
    await page.goto('/')

    // Navigate to weight
    await page.click('text=Weight')
    await expect(page).toHaveURL('/weight')

    // Add a weight entry
    await page.getByTestId('global-fab').click()
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[type="date"]', today)
    await page.fill('input[type="number"]', '75.0')
    await page.click('button[type="submit"]')

    // Verify still on weight page with active nav
    await expect(page).toHaveURL('/weight')
    const weightNav = page.getByRole('link', { name: /weight/i })
    await expect(weightNav).toHaveClass(/text-primary/)

    // Verify content updated
    await expect(page.getByText('75.0 kg')).toBeVisible()
  })
})
