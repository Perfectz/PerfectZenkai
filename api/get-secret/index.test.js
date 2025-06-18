const { describe, test, expect, vi, beforeEach } = require('vitest');

// Mock Azure SDK modules
const getSecretMock = vi.fn();
vi.mock('@azure/identity', () => ({
  DefaultAzureCredential: vi.fn(),
}));
vi.mock('@azure/keyvault-secrets', () => ({
  SecretClient: vi.fn().mockImplementation(() => ({
    getSecret: getSecretMock,
  })),
}));

const getSecretFunction = require('./index.js');

describe('get-secret Azure Function', () => {
  let context;

  beforeEach(() => {
    // Reset mocks and context before each test
    vi.clearAllMocks();
    getSecretMock.mockClear();
    context = {
      log: vi.fn(),
      res: {},
    };
  });

  test('should return 500 with auth error on credential failure', async () => {
    // Arrange: Mock credential failure
    const authError = new Error('Authentication failed.');
    getSecretMock.mockRejectedValue(authError);
    
    const req = {
      method: 'POST',
      body: { secretName: 'supabase-url' },
    };

    // Act
    await getSecretFunction(context, req);

    // Assert
    expect(context.log).toHaveBeenCalledWith(expect.stringContaining('Error retrieving secret: Authentication failed.'));
    expect(context.res.status).toBe(500);
    const body = JSON.parse(context.res.body);
    expect(body.error).toBe('Authentication failed - check managed identity permissions');
  });

  test('should return 403 for disallowed secret', async () => {
    const req = {
        method: 'POST',
        body: { secretName: 'some-random-secret' }
    };

    await getSecretFunction(context, req);

    expect(context.res.status).toBe(403);
    const body = JSON.parse(context.res.body);
    expect(body.error).toBe('Access to this secret is not allowed');
  });
}); 