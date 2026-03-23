import { appModuleRegistry } from './registry'
import type {
  AppModuleManifest,
  ModuleDashboardContribution,
  ModuleLifecycleHook,
  ModuleNavContribution,
  ModuleRouteContribution,
} from './types'

export type ModuleRegistryIssueSeverity = 'error' | 'warning'

export interface ModuleRegistryValidationIssue {
  severity: ModuleRegistryIssueSeverity
  code:
    | 'duplicate-module-id'
    | 'duplicate-route-id'
    | 'duplicate-route-path'
    | 'duplicate-nav-id'
    | 'nav-order-collision'
    | 'duplicate-dashboard-id'
    | 'dashboard-order-collision'
    | 'duplicate-capability-id'
    | 'duplicate-handler-key'
    | 'legacy-function-overlap'
    | 'duplicate-hook-name'
    | 'hook-order-collision'
    | 'missing-test-metadata'
  message: string
  moduleIds: string[]
}

export interface ModuleRegistryValidationReport {
  isValid: boolean
  errors: ModuleRegistryValidationIssue[]
  warnings: ModuleRegistryValidationIssue[]
}

const isGovernedModule = (module: AppModuleManifest) => module.status !== 'disabled'

const buildDuplicateIssue = (
  severity: ModuleRegistryIssueSeverity,
  code: ModuleRegistryValidationIssue['code'],
  message: string,
  moduleIds: string[]
): ModuleRegistryValidationIssue => ({
  severity,
  code,
  message,
  moduleIds: Array.from(new Set(moduleIds)).sort(),
})

const routePattern = (route: ModuleRouteContribution['route']) => {
  if (route.index) {
    return '[index]'
  }

  return route.path ?? '[pathless]'
}

const collectCollisions = <TContribution>(
  manifests: AppModuleManifest[],
  select: (manifest: AppModuleManifest) => TContribution[] | undefined,
  keyOf: (contribution: TContribution) => string | undefined,
  emit: (key: string, moduleIds: string[]) => ModuleRegistryValidationIssue | null
) => {
  const seen = new Map<string, string[]>()

  manifests.forEach((manifest) => {
    select(manifest)?.forEach((contribution) => {
      const key = keyOf(contribution)
      if (!key) {
        return
      }

      seen.set(key, [...(seen.get(key) ?? []), manifest.id])
    })
  })

  return Array.from(seen.entries())
    .filter(([, moduleIds]) => moduleIds.length > 1)
    .map(([key, moduleIds]) => emit(key, moduleIds))
    .filter((issue): issue is ModuleRegistryValidationIssue => issue !== null)
}

const collectOrderCollisions = <TContribution extends { order: number }>(
  manifests: AppModuleManifest[],
  select: (manifest: AppModuleManifest) => TContribution[] | undefined,
  groupOf: (contribution: TContribution) => string,
  label: string,
  code: Extract<ModuleRegistryValidationIssue['code'], 'nav-order-collision' | 'dashboard-order-collision' | 'hook-order-collision'>
) => {
  const seen = new Map<string, string[]>()

  manifests.forEach((manifest) => {
    select(manifest)?.forEach((contribution) => {
      const collisionKey = `${groupOf(contribution)}:${contribution.order}`
      seen.set(collisionKey, [...(seen.get(collisionKey) ?? []), manifest.id])
    })
  })

  return Array.from(seen.entries())
    .filter(([, moduleIds]) => moduleIds.length > 1)
    .map(([collisionKey, moduleIds]) => {
      const [group, order] = collisionKey.split(':')
      return buildDuplicateIssue(
        'warning',
        code,
        `${label} order ${order} is shared within ${group}.`,
        moduleIds
      )
    })
}

const validateModulesHaveTests = (manifests: AppModuleManifest[]) =>
  manifests
    .filter((manifest) => !manifest.test)
    .map((manifest) =>
      buildDuplicateIssue(
        'warning',
        'missing-test-metadata',
        `Module ${manifest.id} does not declare smoke-test metadata.`,
        [manifest.id]
      )
    )

const collectLegacyFunctionOverlaps = (manifests: AppModuleManifest[]) => {
  const seen = new Map<string, string[]>()

  manifests.forEach((manifest) => {
    manifest.capabilities?.forEach((capability) => {
      capability.legacyFunctionNames?.forEach((functionName) => {
        seen.set(functionName, [...(seen.get(functionName) ?? []), manifest.id])
      })
    })
  })

  return Array.from(seen.entries())
    .filter(([, moduleIds]) => moduleIds.length > 1)
    .map(([functionName, moduleIds]) =>
      buildDuplicateIssue(
        'warning',
        'legacy-function-overlap',
        `Legacy function ${functionName} is bound by multiple modules. Confirm that overlap is intentional.`,
        moduleIds
      )
    )
}

export const validateModuleRegistry = (
  manifests: AppModuleManifest[] = appModuleRegistry
): ModuleRegistryValidationReport => {
  const governedModules = manifests.filter(isGovernedModule)

  const errors = [
    ...collectCollisions(
      governedModules,
      (manifest) => [manifest],
      (manifest) => manifest.id,
      (moduleId, moduleIds) =>
        buildDuplicateIssue('error', 'duplicate-module-id', `Module id ${moduleId} is declared more than once.`, moduleIds)
    ),
    ...collectCollisions(
      governedModules,
      (manifest) => manifest.routes,
      (route) => route.id,
      (routeId, moduleIds) =>
        buildDuplicateIssue('error', 'duplicate-route-id', `Route id ${routeId} is declared more than once.`, moduleIds)
    ),
    ...collectCollisions(
      governedModules,
      (manifest) => manifest.routes,
      (route) => routePattern(route.route),
      (pattern, moduleIds) =>
        pattern === '[pathless]'
          ? null
          : buildDuplicateIssue('error', 'duplicate-route-path', `Route pattern ${pattern} is declared more than once.`, moduleIds)
    ),
    ...collectCollisions(
      governedModules,
      (manifest) => manifest.nav,
      (nav) => nav.id,
      (navId, moduleIds) =>
        buildDuplicateIssue('error', 'duplicate-nav-id', `Navigation id ${navId} is declared more than once.`, moduleIds)
    ),
    ...collectCollisions(
      governedModules,
      (manifest) => manifest.dashboard,
      (card) => card.id,
      (cardId, moduleIds) =>
        buildDuplicateIssue('error', 'duplicate-dashboard-id', `Dashboard contribution ${cardId} is declared more than once.`, moduleIds)
    ),
    ...collectCollisions(
      governedModules,
      (manifest) => manifest.capabilities,
      (capability) => capability.id,
      (capabilityId, moduleIds) =>
        buildDuplicateIssue('error', 'duplicate-capability-id', `Capability ${capabilityId} is declared more than once.`, moduleIds)
    ),
    ...collectCollisions(
      governedModules,
      (manifest) => manifest.capabilities,
      (capability) => capability.handlerKey,
      (handlerKey, moduleIds) =>
        buildDuplicateIssue('error', 'duplicate-handler-key', `Handler key ${handlerKey} is declared more than once.`, moduleIds)
    ),
    ...collectCollisions(
      governedModules,
      (manifest) => manifest.hooks,
      (hook) => `${hook.phase}:${hook.name}`,
      (hookKey, moduleIds) =>
        buildDuplicateIssue('error', 'duplicate-hook-name', `Lifecycle hook ${hookKey} is declared more than once.`, moduleIds)
    ),
  ]

  const warnings = [
    ...collectOrderCollisions<ModuleNavContribution>(
      governedModules,
      (manifest) => manifest.nav,
      (nav) => nav.surface,
      'Navigation',
      'nav-order-collision'
    ),
    ...collectOrderCollisions<ModuleDashboardContribution>(
      governedModules,
      (manifest) => manifest.dashboard,
      (card) => card.surface,
      'Dashboard surface',
      'dashboard-order-collision'
    ),
    ...collectOrderCollisions<ModuleLifecycleHook & { order: number }>(
      governedModules,
      (manifest) => manifest.hooks?.filter((hook) => typeof hook.order === 'number') as Array<ModuleLifecycleHook & { order: number }> | undefined,
      (hook) => hook.phase,
      'Lifecycle phase',
      'hook-order-collision'
    ),
    ...collectLegacyFunctionOverlaps(governedModules),
    ...validateModulesHaveTests(governedModules),
  ]

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export const assertModuleRegistryIsValid = (manifests: AppModuleManifest[] = appModuleRegistry) => {
  const report = validateModuleRegistry(manifests)

  if (!report.isValid) {
    throw new Error(report.errors.map((issue) => issue.message).join('\n'))
  }

  return report
}