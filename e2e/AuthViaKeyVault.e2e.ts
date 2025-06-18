import { test, expect } from '@playwright/test';

test.describe('E2E Authentication Flow via Azure Key Vault', () => {
  
  test('should NOT show offline banner when Key Vault secrets are retrieved successfully', async ({ page }) => {
    // In this GREEN test, we remove the interception.
    // We expect the call to the real (or locally emulated) API to succeed.
    // The dev server will run the function, which should now work locally
    // if the developer is logged into Azure CLI or VS Code.

    await page.goto('/');

    // The application should now successfully retrieve secrets and proceed with
    // normal authentication. The offline banner should not be present.
    const offlineBanner = page.getByTestId('offline-banner');
    
    // The banner should be hidden.
    await expect(offlineBanner).toBeHidden({ timeout: 10000 });
  });

}); 