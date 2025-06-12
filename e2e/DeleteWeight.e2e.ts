import { test, expect } from '@playwright/test'

test.describe('Delete Weight', () => {
  test('should delete weight entry via long press', async ({ page }) => {
    await page.goto('/weight')
    
    // Add two weight entries first
    const fab = page.getByTestId('global-fab')
    
    // Add first entry
    await fab.click()
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[type="date"]', today)
    await page.fill('input[type="number"]', '75.0')
    await page.click('button[type="submit"]')
    
    // Add second entry
    await fab.click()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    await page.fill('input[type="date"]', yesterday)
    await page.fill('input[type="number"]', '74.5')
    await page.click('button[type="submit"]')
    
    // Verify both entries exist
    await expect(page.getByText('75.0 kg')).toBeVisible()
    await expect(page.getByText('74.5 kg')).toBeVisible()
    
    // Long press first entry (simulate with mousedown + delay)
    const firstEntry = page.getByText('75.0 kg').locator('..')
    await firstEntry.hover()
    await page.mouse.down()
    await page.waitForTimeout(250) // 200ms + buffer
    await page.mouse.up()
    
    // Accept delete confirmation
    page.on('dialog', dialog => dialog.accept())
    
    // Verify only one entry remains
    await expect(page.getByText('75.0 kg')).not.toBeVisible()
    await expect(page.getByText('74.5 kg')).toBeVisible()
  })

  test('should delete weight entry via swipe left', async ({ page }) => {
    await page.goto('/weight')
    
    // Add one weight entry
    const fab = page.getByTestId('global-fab')
    await fab.click()
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[type="date"]', today)
    await page.fill('input[type="number"]', '76.0')
    await page.click('button[type="submit"]')
    
    // Verify entry exists
    await expect(page.getByText('76.0 kg')).toBeVisible()
    
    // Simulate swipe left on the entry
    const entry = page.getByText('76.0 kg').locator('..')
    const box = await entry.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + 10, box.y + box.height / 2)
      await page.mouse.up()
    }
    
    // Accept delete confirmation
    page.on('dialog', dialog => dialog.accept())
    
    // Verify entry is deleted
    await expect(page.getByText('76.0 kg')).not.toBeVisible()
    await expect(page.getByText('No weights logged yet')).toBeVisible()
  })
}) 