import { test, expect } from '@playwright/test'
import {
  expectCommandCenterReady,
  loginAsBootstrapAdmin,
  openPrimaryNav,
} from './support/auth'

test.describe('App shell smoke', () => {
  test('loads the command center after bootstrap admin login', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /perfect zenkai/i })).toBeVisible()

    await loginAsBootstrapAdmin(page)

    await expectCommandCenterReady(page)
    await expect(page.getByText(/revival mode active|supabase session active/i)).toBeVisible()
  })

  test('navigates from the command center into the health hub', async ({ page }) => {
    await page.goto('/')
    await loginAsBootstrapAdmin(page)

    await openPrimaryNav(page, 'Health', /\/health$/)
    await expect(page.getByText(/health hub/i)).toBeVisible()
    await expect(page.getByRole('tab', { name: /weight tracking tab/i })).toBeVisible()
  })

  test('opens the protected module inventory route without a blank screen', async ({ page }) => {
    await page.goto('/')
    await loginAsBootstrapAdmin(page)

    await page.goto('/system/modules')

    await expect(page.getByRole('heading', { name: /module inventory/i })).toBeVisible()
    await expect(page.getByText(/openclaude module contract/i)).toBeVisible()
    await expect(page.getByText(/registry valid|governance errors/i)).toBeVisible()
  })
})
