import { appModuleRegistry } from './registry'
import { validateModuleRegistry } from './validation'
import type { AppModuleManifest, ModuleLifecyclePhase } from './types'

export interface ModuleDiagnosticsEntry {
  id: string
  title: string
  status: AppModuleManifest['status']
  routeIds: string[]
  routePatterns: string[]
  navIds: string[]
  dashboardSurfaces: string[]
  capabilityIds: string[]
  hookNames: string[]
  testRoute?: string
}

export interface ModuleSystemDiagnostics {
  generatedAt: string
  totals: {
    modules: number
    enabledModules: number
    routes: number
    navEntries: number
    dashboardEntries: number
    capabilities: number
    hooks: number
    smokeTests: number
  }
  lifecyclePhases: Array<{
    phase: ModuleLifecyclePhase
    hookCount: number
  }>
  modules: ModuleDiagnosticsEntry[]
  validation: ReturnType<typeof validateModuleRegistry>
}

const lifecyclePhaseOrder: ModuleLifecyclePhase[] = [
  'app-bootstrap',
  'post-auth',
  'module-enabled',
  'logout',
]

const routePattern = (manifest: AppModuleManifest) =>
  manifest.routes.map((entry) => (entry.route.index ? '[index]' : entry.route.path ?? '[pathless]'))

export const getModuleSystemDiagnostics = (
  manifests: AppModuleManifest[] = appModuleRegistry
): ModuleSystemDiagnostics => {
  const enabledModuleIds = new Set(
    manifests.filter((manifest) => manifest.status === 'enabled').map((manifest) => manifest.id)
  )
  const modules = manifests.map((manifest) => ({
    id: manifest.id,
    title: manifest.title,
    status: manifest.status,
    routeIds: manifest.routes.map((entry) => entry.id),
    routePatterns: routePattern(manifest),
    navIds: (manifest.nav ?? []).map((entry) => entry.id),
    dashboardSurfaces: Array.from(new Set((manifest.dashboard ?? []).map((entry) => entry.surface))),
    capabilityIds: (manifest.capabilities ?? []).map((entry) => entry.id),
    hookNames: (manifest.hooks ?? []).map((hook) => `${hook.phase}:${hook.name}`),
    testRoute: manifest.test?.smokeRoute,
  }))

  const lifecyclePhases: ModuleSystemDiagnostics['lifecyclePhases'] = lifecyclePhaseOrder.map((phase) => ({
    phase,
    hookCount: manifests.reduce(
      (count, manifest) => count + (manifest.hooks?.filter((hook) => hook.phase === phase).length ?? 0),
      0
    ),
  }))

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      modules: manifests.length,
      enabledModules: manifests.filter((manifest) => enabledModuleIds.has(manifest.id)).length,
      routes: manifests.reduce((count, manifest) => count + manifest.routes.length, 0),
      navEntries: manifests.reduce((count, manifest) => count + (manifest.nav?.length ?? 0), 0),
      dashboardEntries: manifests.reduce((count, manifest) => count + (manifest.dashboard?.length ?? 0), 0),
      capabilities: manifests.reduce((count, manifest) => count + (manifest.capabilities?.length ?? 0), 0),
      hooks: manifests.reduce((count, manifest) => count + (manifest.hooks?.length ?? 0), 0),
      smokeTests: manifests.filter((manifest) => Boolean(manifest.test)).length,
    },
    lifecyclePhases,
    modules,
    validation: validateModuleRegistry(manifests),
  }
}