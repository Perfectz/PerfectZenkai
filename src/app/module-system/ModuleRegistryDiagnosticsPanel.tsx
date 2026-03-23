import { AlertTriangle, Blocks, GitBranch } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { getModuleSystemDiagnostics } from './diagnostics'

interface ModuleRegistryDiagnosticsPanelProps {
  title?: string
  description?: string
}

export default function ModuleRegistryDiagnosticsPanel({
  title = 'Module Registry Diagnostics',
  description =
    'Compile-time inventory for the OpenClaude-facing module system. Use this to inspect what the shell can currently compose.',
}: ModuleRegistryDiagnosticsPanelProps) {
  const diagnostics = getModuleSystemDiagnostics()

  return (
    <Card className="border-sky-400/20 bg-gray-900/80 text-white">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Blocks className="h-5 w-5 text-sky-300" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={diagnostics.validation.errors.length > 0 ? 'destructive' : 'default'}
              className={diagnostics.validation.errors.length > 0 ? '' : 'bg-emerald-500/20 text-emerald-100'}
            >
              {diagnostics.validation.errors.length > 0
                ? `${diagnostics.validation.errors.length} governance errors`
                : 'Registry valid'}
            </Badge>
            <Badge variant="outline" className="border-amber-300/40 text-amber-100">
              {diagnostics.validation.warnings.length} warnings
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-sky-400/20 bg-sky-500/5 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-200/70">Modules</div>
            <div className="mt-2 text-3xl font-semibold text-white">{diagnostics.totals.enabledModules}</div>
            <div className="mt-1 text-sm text-gray-400">{diagnostics.totals.modules} declared in registry</div>
          </div>
          <div className="rounded-xl border border-sky-400/20 bg-sky-500/5 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-200/70">Routes</div>
            <div className="mt-2 text-3xl font-semibold text-white">{diagnostics.totals.routes}</div>
            <div className="mt-1 text-sm text-gray-400">{diagnostics.totals.navEntries} nav entries active</div>
          </div>
          <div className="rounded-xl border border-sky-400/20 bg-sky-500/5 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-200/70">Capabilities</div>
            <div className="mt-2 text-3xl font-semibold text-white">{diagnostics.totals.capabilities}</div>
            <div className="mt-1 text-sm text-gray-400">{diagnostics.totals.dashboardEntries} dashboard contributions</div>
          </div>
          <div className="rounded-xl border border-sky-400/20 bg-sky-500/5 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-200/70">Lifecycle</div>
            <div className="mt-2 text-3xl font-semibold text-white">{diagnostics.totals.hooks}</div>
            <div className="mt-1 text-sm text-gray-400">{diagnostics.totals.smokeTests} modules declare smoke routes</div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            {diagnostics.modules.map((module) => (
              <div key={module.id} className="rounded-xl border border-gray-700 bg-black/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                      <Badge variant="outline" className="border-sky-300/40 text-sky-100">
                        {module.id}
                      </Badge>
                      <Badge variant="outline" className="border-gray-500/40 text-gray-200 capitalize">
                        {module.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      Routes: {module.routePatterns.join(', ')}
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm text-gray-300 sm:grid-cols-2 xl:min-w-[440px]">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Navigation</div>
                      <div className="mt-1">{module.navIds.length > 0 ? module.navIds.join(', ') : 'None'}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Dashboard</div>
                      <div className="mt-1">{module.dashboardSurfaces.length > 0 ? module.dashboardSurfaces.join(', ') : 'None'}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Capabilities</div>
                      <div className="mt-1">{module.capabilityIds.length > 0 ? module.capabilityIds.join(', ') : 'None'}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Hooks</div>
                      <div className="mt-1">{module.hookNames.length > 0 ? module.hookNames.join(', ') : 'None'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-700 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                <GitBranch className="h-4 w-4 text-sky-300" />
                Lifecycle Phases
              </div>
              <div className="mt-4 space-y-3">
                {diagnostics.lifecyclePhases.map((phase) => (
                  <div key={phase.phase} className="flex items-center justify-between rounded-lg border border-gray-800 px-3 py-2">
                    <span className="text-sm text-gray-300">{phase.phase}</span>
                    <Badge variant="outline" className="border-sky-300/30 text-sky-100">
                      {phase.hookCount}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                Governance Warnings
              </div>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                {diagnostics.validation.warnings.length > 0 ? (
                  diagnostics.validation.warnings.map((warning) => (
                    <div key={`${warning.code}:${warning.message}`} className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-3">
                      <div className="font-medium text-amber-100">{warning.code}</div>
                      <div className="mt-1 text-gray-300">{warning.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-3 text-emerald-100">
                    No governance warnings in the current registry.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}