import { describe, expect, it } from 'vitest'
import type { AppModuleManifest } from '../types'
import { appModuleRegistry } from '../registry'
import { validateModuleRegistry } from '../validation'

describe('module registry validation', () => {
  it('accepts the current module registry without governance errors', () => {
    const report = validateModuleRegistry(appModuleRegistry)

    expect(report.isValid).toBe(true)
    expect(report.errors).toHaveLength(0)
  })

  it('flags duplicate route patterns and lifecycle hook names', () => {
    const manifestA = {
      id: 'alpha',
      version: '1.0.0',
      status: 'enabled',
      title: 'Alpha',
      description: 'Alpha module',
      routes: [{ id: 'alpha.home', route: { path: 'shared', element: null } }],
      hooks: [
        {
          phase: 'post-auth',
          name: 'shared-hook',
          run: async () => undefined,
        },
      ],
      test: { smokeRoute: '/alpha' },
    } satisfies AppModuleManifest

    const manifestB = {
      id: 'beta',
      version: '1.0.0',
      status: 'enabled',
      title: 'Beta',
      description: 'Beta module',
      routes: [{ id: 'beta.home', route: { path: 'shared', element: null } }],
      hooks: [
        {
          phase: 'post-auth',
          name: 'shared-hook',
          run: async () => undefined,
        },
      ],
      test: { smokeRoute: '/beta' },
    } satisfies AppModuleManifest

    const report = validateModuleRegistry([manifestA, manifestB])

    expect(report.isValid).toBe(false)
    expect(report.errors.map((issue) => issue.code)).toContain('duplicate-route-path')
    expect(report.errors.map((issue) => issue.code)).toContain('duplicate-hook-name')
  })

  it('warns on navigation order collisions', () => {
    const manifestA = {
      id: 'alpha',
      version: '1.0.0',
      status: 'enabled',
      title: 'Alpha',
      description: 'Alpha module',
      routes: [{ id: 'alpha.home', route: { path: 'alpha', element: null } }],
      nav: [
        {
          id: 'alpha.nav',
          surface: 'primary',
          label: 'Alpha',
          to: '/alpha',
          icon: (() => null) as never,
          order: 10,
        },
      ],
      test: { smokeRoute: '/alpha' },
    } satisfies AppModuleManifest

    const manifestB = {
      id: 'beta',
      version: '1.0.0',
      status: 'enabled',
      title: 'Beta',
      description: 'Beta module',
      routes: [{ id: 'beta.home', route: { path: 'beta', element: null } }],
      nav: [
        {
          id: 'beta.nav',
          surface: 'primary',
          label: 'Beta',
          to: '/beta',
          icon: (() => null) as never,
          order: 10,
        },
      ],
      test: { smokeRoute: '/beta' },
    } satisfies AppModuleManifest

    const report = validateModuleRegistry([manifestA, manifestB])

    expect(report.warnings.map((issue) => issue.code)).toContain('nav-order-collision')
  })
})