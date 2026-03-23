import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const assertModuleRegistryIsValid = vi.fn()

vi.mock('../validation', () => ({
  assertModuleRegistryIsValid,
}))

describe('startupAssertions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    const module = await import('../startupAssertions')
    module.resetDevelopmentPlatformInvariantState()
  })

  it('asserts registry validity once in development', async () => {
    assertModuleRegistryIsValid.mockReturnValue({ isValid: true, errors: [], warnings: [] })

    const module = await import('../startupAssertions')

    module.assertDevelopmentPlatformInvariants({ isDev: true, logger: console })
    module.assertDevelopmentPlatformInvariants({ isDev: true, logger: console })

    expect(assertModuleRegistryIsValid).toHaveBeenCalledTimes(1)
  })

  it('skips assertions outside development mode', async () => {
    assertModuleRegistryIsValid.mockReturnValue({ isValid: true, errors: [], warnings: [] })

    const module = await import('../startupAssertions')

    module.assertDevelopmentPlatformInvariants({ isDev: false, logger: console })

    expect(assertModuleRegistryIsValid).not.toHaveBeenCalled()
  })

  it('logs governance warnings when registry is valid but noisy', async () => {
    const logger = { warn: vi.fn() }
    assertModuleRegistryIsValid.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [
        {
          severity: 'warning',
          code: 'nav-order-collision',
          message: 'Navigation order 10 is shared within primary.',
          moduleIds: ['alpha', 'beta'],
        },
      ],
    })

    const module = await import('../startupAssertions')

    module.assertDevelopmentPlatformInvariants({ isDev: true, logger })

    expect(logger.warn).toHaveBeenCalledTimes(1)
  })
})