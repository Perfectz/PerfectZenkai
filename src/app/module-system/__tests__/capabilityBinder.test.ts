import { describe, expect, it } from 'vitest'
import {
  getBoundAgentCapabilities,
  getEnabledLegacyFunctionNames,
} from '../capabilityBinder'

describe('capabilityBinder', () => {
  it('binds enabled module capabilities to legacy AI functions', () => {
    const capabilities = getBoundAgentCapabilities()
    const functionNames = getEnabledLegacyFunctionNames()

    expect(capabilities.length).toBeGreaterThan(0)
    expect(capabilities.some((capability) => capability.id === 'tasks.manage-queue')).toBe(true)
    expect(functionNames).toContain('addTodo')
    expect(functionNames).toContain('addWeight')
    expect(functionNames).toContain('fillStandupForm')
    expect(functionNames).toContain('searchNotes')
  })
})