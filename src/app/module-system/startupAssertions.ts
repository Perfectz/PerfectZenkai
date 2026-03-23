import { assertModuleRegistryIsValid } from './validation'

interface StartupAssertionOptions {
  isDev?: boolean
  logger?: Pick<Console, 'warn'>
}

let hasValidatedDevelopmentInvariants = false

export const assertDevelopmentPlatformInvariants = ({
  isDev = import.meta.env.DEV,
  logger = console,
}: StartupAssertionOptions = {}) => {
  if (!isDev || hasValidatedDevelopmentInvariants) {
    return
  }

  const report = assertModuleRegistryIsValid()

  hasValidatedDevelopmentInvariants = true

  if (report.warnings.length > 0) {
    logger.warn('Module registry governance warnings detected during startup:', report.warnings)
  }
}

export const resetDevelopmentPlatformInvariantState = () => {
  hasValidatedDevelopmentInvariants = false
}