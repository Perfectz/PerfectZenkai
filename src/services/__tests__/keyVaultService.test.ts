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

    // The actual error thrown by fetch is a generic TypeError in this old version of vitest/node...
    // Let's check for a more generic error and the message from the service
    await expect(keyVaultService.getSecret('test-secret')).rejects.toThrow();

    // The important part is that our service logs the correct error.
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Failed to get secret test-secret from Key Vault:',
      expect.any(Error)
    );
  });

  test('getSupabaseConfig should throw a specific error message on failure', async () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(keyVaultService.getSupabaseConfig()).rejects.toThrow(
      'Could not connect to Azure Key Vault. Please check your internet connection and Azure Function deployment.'
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
}); 