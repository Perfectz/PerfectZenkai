import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { authModule as AuthModuleExport } from '../manifest'

const initializeUserDatabases = vi.fn()
const clearUserDatabases = vi.fn()
const sanitizeUserId = vi.fn((value: string) => `safe_${value}`)

vi.mock('../utils/dataIsolation', () => ({
  initializeUserDatabases,
  clearUserDatabases,
  sanitizeUserId,
}))

let authModule: typeof AuthModuleExport

describe('auth module manifest lifecycle hooks', () => {
  beforeAll(async () => {
    ;({ authModule } = await import('../manifest'))
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes the authenticated module inventory route', () => {
    expect(authModule.routes.some((route) => route.id === 'auth.system-modules')).toBe(true)
    expect(authModule.routes.some((route) => route.route.path === 'system/modules')).toBe(true)
  })

  it('initializes isolated user databases on post-auth', async () => {
    const hook = authModule.hooks?.find((entry) => entry.name === 'auth.initialize-user-databases')

    expect(hook).toBeDefined()

    await hook?.run({
      user: { id: 'user-123', username: 'test', email: 'test@example.com', name: 'Test User' },
      isProd: false,
      logger: console,
    })

    expect(sanitizeUserId).toHaveBeenCalledWith('user-123')
    expect(initializeUserDatabases).toHaveBeenCalledWith('safe_user-123')
  })

  it('clears isolated user databases on logout', async () => {
    const hook = authModule.hooks?.find((entry) => entry.name === 'auth.clear-user-databases')

    expect(hook).toBeDefined()

    await hook?.run({
      user: { id: 'user-123', username: 'test', email: 'test@example.com', name: 'Test User' },
      isProd: false,
      logger: console,
    })

    expect(sanitizeUserId).toHaveBeenCalledWith('user-123')
    expect(clearUserDatabases).toHaveBeenCalledWith('safe_user-123')
  })
})