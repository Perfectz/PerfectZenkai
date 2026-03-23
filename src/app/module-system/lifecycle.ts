import { getLifecycleHooks } from './registry'
import type { AppLifecycleContext, ModuleLifecycleHook, ModuleLifecyclePhase } from './types'
import { killRootServiceWorker } from '@/shared/utils/killRootServiceWorker'
import { getSupabaseClient } from '@/lib/supabase-client'

const executedLifecycleKeys = new Set<string>()

const platformLifecycleHooks: ModuleLifecycleHook[] = [
  {
    phase: 'app-bootstrap',
    name: 'warm-supabase-client',
    order: 0,
    run: async ({ logger }) => {
      try {
        await getSupabaseClient()
      } catch (error) {
        logger.warn('Supabase initialization failed, running in offline mode:', error)
      }
    },
  },
  {
    phase: 'app-bootstrap',
    name: 'kill-legacy-root-service-worker',
    order: 10,
    run: async ({ isProd }) => {
      if (isProd) {
        await killRootServiceWorker()
      }
    },
  },
]

const getPhaseHooks = (phase: ModuleLifecyclePhase) => [
  ...platformLifecycleHooks.filter((hook) => hook.phase === phase),
  ...getLifecycleHooks(phase),
].sort((left, right) => (left.order ?? 0) - (right.order ?? 0))

export const runLifecyclePhase = async (
  phase: ModuleLifecyclePhase,
  context: AppLifecycleContext,
  scopeKey = 'global'
) => {
  const hooks = getPhaseHooks(phase)

  for (const hook of hooks) {
    const executionKey = `${scopeKey}:${phase}:${hook.name}`
    if (executedLifecycleKeys.has(executionKey)) {
      continue
    }

    executedLifecycleKeys.add(executionKey)

    try {
      await hook.run(context)
    } catch (error) {
      context.logger.error(`Lifecycle hook failed: ${hook.name}`, error)
    }
  }
}

export const resetLifecycleScope = (scopePrefix: string) => {
  for (const key of Array.from(executedLifecycleKeys)) {
    if (key.startsWith(scopePrefix)) {
      executedLifecycleKeys.delete(key)
    }
  }
}