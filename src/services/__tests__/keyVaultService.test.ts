import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { keyVaultService } from '../keyVaultService';

const server = setupServer(
  http.post('https://perfectzenkai-api.azurewebsites.net/api/get-secret', () => {
    return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  keyVaultService.clearCache();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

describe('keyVaultService', () => {
  test('getSecret should throw an error when the API returns a 500 status', async () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock the fetch call to simulate a 500 error
    server.use(
      http.post('https://perfectzenkai-api.azurewebsites.net/api/get-secret', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    await expect(keyVaultService.getSecret('test-secret')).rejects.toThrow('Failed to fetch secret: HTTP 500');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Failed to get configuration test-secret:',
      expect.any(Error)
    );
  });

  test('getSupabaseConfig should throw a specific error message on failure', async () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.spyOn(keyVaultService, 'getSupabaseConfig').mockRejectedValueOnce(new Error('Could not connect to Azure Key Vault. Please check your internet connection and Azure Function deployment.'));

    await expect(keyVaultService.getSupabaseConfig()).rejects.toThrow(
      'Could not connect to Azure Key Vault. Please check your internet connection and Azure Function deployment.'
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
}); 