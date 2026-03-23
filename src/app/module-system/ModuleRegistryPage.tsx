import { ArrowLeft, Blocks } from 'lucide-react'
import { Link } from 'react-router-dom'
import ModuleRegistryDiagnosticsPanel from './ModuleRegistryDiagnosticsPanel'

export default function ModuleRegistryPage() {
  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            System
          </p>
          <div className="space-y-2">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
              <Blocks className="h-8 w-8 text-sky-300" />
              Module Inventory
            </h1>
            <p className="max-w-3xl text-sm text-slate-300">
              Inspect the live shell contract the OpenClaude-facing system can compose: routes, hooks, capabilities, dashboard surfaces, and governance warnings.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      <ModuleRegistryDiagnosticsPanel
        title="OpenClaude Module Contract"
        description="This route exposes the current compile-time module contract outside admin so the shell inventory remains visible during normal product use."
      />
    </div>
  )
}