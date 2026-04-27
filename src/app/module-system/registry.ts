import type { RouteObject } from 'react-router-dom'
import type {
  AppModuleManifest,
  ModuleLifecycleHook,
  ModuleCapabilityContribution,
  ModuleDashboardContribution,
  ModuleNavContribution,
} from './types'
import { authModule } from '@/modules/auth/manifest'
import { dashboardModule } from '@/modules/dashboard/manifest'
import { healthModule } from '@/modules/health/manifest'
import { tasksModule } from '@/modules/tasks/manifest'
import { journalModule } from '@/modules/journal/manifest'
import { notesModule } from '@/modules/notes/manifest'
import { aiChatModule } from '@/modules/ai-chat/manifest'

export const appModuleRegistry: AppModuleManifest[] = [
  authModule,
  dashboardModule,
  healthModule,
  tasksModule,
  journalModule,
  notesModule,
  aiChatModule,
]

export const getEnabledModules = () =>
  appModuleRegistry.filter((module) => module.status === 'enabled')

export const getProtectedModuleRoutes = (): RouteObject[] =>
  getEnabledModules().flatMap((module) => module.routes.map((entry) => entry.route))

export const getPrimaryNavigation = (role?: string): ModuleNavContribution[] =>
  getEnabledModules()
    .flatMap((module) => module.nav ?? [])
    .filter((item) => !item.roles || (role ? item.roles.includes(role) : false))
    .sort((left, right) => left.order - right.order)

export const getDashboardSurface = (
  surface: ModuleDashboardContribution['surface']
): ModuleDashboardContribution[] =>
  getEnabledModules()
    .flatMap((module) => module.dashboard ?? [])
    .filter((item) => item.surface === surface)
    .sort((left, right) => left.order - right.order)

export const getAgentCapabilities = (): ModuleCapabilityContribution[] =>
  getEnabledModules()
    .flatMap((module) => module.capabilities ?? [])
    .filter((capability) => capability.visibility === 'agent')

export const getLifecycleHooks = (
  phase: ModuleLifecycleHook['phase']
): ModuleLifecycleHook[] =>
  getEnabledModules()
    .flatMap((module) => module.hooks ?? [])
    .filter((hook) => hook.phase === phase)
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
