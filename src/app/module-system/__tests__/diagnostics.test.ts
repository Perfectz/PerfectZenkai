import { describe, expect, it } from 'vitest'
import { getModuleSystemDiagnostics } from '../diagnostics'

describe('module system diagnostics', () => {
  it('summarizes current module inventory', () => {
    const diagnostics = getModuleSystemDiagnostics()

    expect(diagnostics.totals.modules).toBeGreaterThan(0)
    expect(diagnostics.totals.enabledModules).toBeGreaterThan(0)
    expect(diagnostics.modules.some((module) => module.id === 'auth')).toBe(true)
    expect(diagnostics.modules.some((module) => module.id === 'dashboard')).toBe(true)
    expect(diagnostics.modules.some((module) => module.id === 'health')).toBe(true)
    expect(diagnostics.validation.isValid).toBe(true)
  })
})