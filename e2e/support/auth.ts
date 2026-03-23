import { expect, type Page } from '@playwright/test'

export async function loginAsBootstrapAdmin(page: Page) {
  await expect(page.getByRole('button', { name: /use admin login/i })).toBeVisible()
  await page.getByRole('button', { name: /use admin login/i }).click()

  await page.getByLabel(/username/i).fill('admin')
  await page.getByLabel(/^password$/i).fill('revive-admin-123')
  await page.getByRole('button', { name: /^sign in$/i }).click()

  await expect(page).toHaveURL(/\/(|dashboard)$/, { timeout: 15000 })
  await expect(page.getByText(/daily command center/i)).toBeVisible({ timeout: 15000 })
}

export async function expectCommandCenterReady(page: Page) {
  await expect(page.getByText(/daily command center/i)).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('link', { name: /^home$/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /^health$/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /^todo$/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /^journal$/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /^notes$/i })).toBeVisible()
}

export async function openPrimaryNav(
  page: Page,
  label: 'Home' | 'Health' | 'Todo' | 'Journal' | 'Notes',
  urlPattern: RegExp
) {
  const link = page.getByRole('link', { name: new RegExp(`^${label}$`, 'i') })
  await expect(link).toBeVisible()
  await link.click()
  await expect(page).toHaveURL(urlPattern)
}
