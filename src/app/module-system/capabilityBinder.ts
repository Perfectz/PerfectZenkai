import { getAgentCapabilities } from './registry'

export const getBoundAgentCapabilities = () => getAgentCapabilities()

export const getEnabledLegacyFunctionNames = (): string[] => {
  const names = new Set<string>()

  getBoundAgentCapabilities().forEach((capability) => {
    capability.legacyFunctionNames?.forEach((name) => {
      names.add(name)
    })
  })

  return Array.from(names)
}

export const getCapabilitySystemPrompt = () => {
  const capabilities = getBoundAgentCapabilities()

  if (capabilities.length === 0) {
    return 'No module-declared agent capabilities are currently enabled.'
  }

  return capabilities
    .map((capability) => {
      const functions = capability.legacyFunctionNames?.length
        ? ` Functions: ${capability.legacyFunctionNames.join(', ')}.`
        : ''

      return `- ${capability.label}: ${capability.description}.${functions}`
    })
    .join('\n')
}