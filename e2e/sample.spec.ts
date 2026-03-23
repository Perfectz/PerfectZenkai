import { test, expect } from '@playwright/test'
import { loginAsBootstrapAdmin } from './support/auth'

test.describe('Mobile command center smoke', () => {
  test('renders the shell cleanly on a mobile viewport', async ({ page }) => {
    await page.goto('/')
    await loginAsBootstrapAdmin(page)

    await expect(page.getByText(/daily command center/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /^journal$/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /^notes$/i })).toBeVisible()

    await page.screenshot({
      path: 'output/playwright/command-center-mobile.png',
      fullPage: true,
    })
  })

  test('shows live queue panels on the home page', async ({ page }) => {
    await page.goto('/')
    await loginAsBootstrapAdmin(page)

    await expect(page.getByText(/current task shortlist/i)).toBeVisible()
    await expect(page.getByText(/recent notes and journal momentum/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /export data/i })).toBeVisible()
  })
})
