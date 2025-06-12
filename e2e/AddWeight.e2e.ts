import { test, expect } from '@playwright/test'

test.describe('Add Weight', () => {
  test('should add weight entry via FAB and form', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to weight page
    await page.click('text=Weight')
    await expect(page).toHaveURL('/weight')
    
    // Verify FAB is visible
    const fab = page.getByTestId('global-fab')
    await expect(fab).toBeVisible()
    
    // Click FAB to open sheet
    await fab.click()
    
    // Fill form with weight data
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[type="date"]', today)
    await page.fill('input[type="number"]', '75.5')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify entry appears in list
    await expect(page.getByText('75.5 kg')).toBeVisible()
    
    // Verify sheet closes
    await expect(page.getByText('Add Weight Entry')).not.toBeVisible()
  })

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/weight')
    
    // Open FAB sheet
    await page.getByTestId('global-fab').click()
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.getByText('Weight is required')).toBeVisible()
    
    // Try invalid weight
    await page.fill('input[type="number"]', '-5')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Weight must be a positive number')).toBeVisible()
    
    // Try weight too high
    await page.fill('input[type="number"]', '1500')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Weight must be less than 1000 kg')).toBeVisible()
  })
}) 