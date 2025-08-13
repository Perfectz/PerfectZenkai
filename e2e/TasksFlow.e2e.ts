// e2e/TasksFlow.e2e.ts
import { test, expect } from '@playwright/test'

test('user can add a one-time task and see it in Active list', async ({ page }) => {
  await page.goto('https://localhost:5173')
  await page.getByRole('link', { name: /tasks/i }).click()

  await page.getByPlaceholder('What do you need to do?').fill('Playwright Task')
  await page.getByRole('button', { name: /add task/i }).click()

  await expect(page.getByText('Playwright Task')).toBeVisible()
})


