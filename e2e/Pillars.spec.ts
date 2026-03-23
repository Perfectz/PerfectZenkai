import { test, expect } from '@playwright/test'
import {
  expectCommandCenterReady,
  loginAsBootstrapAdmin,
  openPrimaryNav,
} from './support/auth'

test.describe('Primary pillar smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await loginAsBootstrapAdmin(page)
    await expectCommandCenterReady(page)
  })

  test('opens the todo pillar', async ({ page }) => {
    await openPrimaryNav(page, 'Todo', /\/todo$/)

    await expect(page.getByRole('heading', { name: /^tasks$/i })).toBeVisible()
    await expect(page.getByText(/focus queue/i)).toBeVisible()
  })

  test('opens the journal pillar', async ({ page }) => {
    await openPrimaryNav(page, 'Journal', /\/journal$/)

    await expect(page.getByRole('heading', { name: /daily journal/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /morning standup/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /evening reflection/i })).toBeVisible()
  })

  test('opens the notes pillar', async ({ page }) => {
    await openPrimaryNav(page, 'Notes', /\/notes$/)

    await expect(page.getByRole('heading', { name: /^notes$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /add new note/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search notes/i)).toBeVisible()
  })
})