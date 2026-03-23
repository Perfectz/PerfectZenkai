import type { RouteObject } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import type { Note } from '@/modules/notes/types'
import type { Todo } from '@/modules/tasks/types'
import type { JournalEntry } from '@/modules/journal/types'
import type { WeightEntry } from '@/modules/weight/types'
import type { User } from '@/modules/auth/types/auth'

export type ModuleStatus = 'enabled' | 'experimental' | 'disabled' | 'deprecated'

export type ModuleLifecyclePhase =
  | 'app-bootstrap'
  | 'post-auth'
  | 'module-enabled'
  | 'logout'

export interface ModulePermissions {
  requiresAuth?: boolean
  roles?: string[]
  dataDomains?: string[]
  sideEffectLevel?: 'read' | 'write' | 'admin' | 'external-network'
}

export interface ModuleRouteContribution {
  id: string
  route: RouteObject
  title?: string
}

export interface ModuleNavContribution {
  id: string
  surface: 'primary'
  label: string
  to: string
  icon: LucideIcon
  order: number
  roles?: string[]
}

export type TileTone = 'emerald' | 'sky' | 'amber' | 'rose' | 'slate'

export interface DashboardContext {
  todayWeight: WeightEntry | null
  latestWeight: WeightEntry | null
  weights: WeightEntry[]
  openTodos: Todo[]
  overdueTodos: Todo[]
  highPriorityTodos: Todo[]
  completedToday: Todo[]
  notes: Note[]
  latestNote: Note | null
  recentEntries: JournalEntry[]
  morningComplete: boolean
  eveningComplete: boolean
  latestJournalDate?: string
  journalStreak: number
}

export interface ModuleDashboardState {
  value: string
  meta: string
  statusLabel: string
  tone: TileTone
  stats: Array<{ label: string; value: string }>
  footer: string
}

export interface ModuleDashboardContribution {
  id: string
  surface: 'dashboard-home' | 'dashboard-tactical'
  order: number
  eyebrow: string
  title: string
  description: string
  to: string
  icon: LucideIcon
  quickActionLabel?: string
  buildState: (context: DashboardContext) => ModuleDashboardState
}

export interface ModuleCapabilityContribution {
  id: string
  label: string
  description: string
  visibility: 'user' | 'agent'
  handlerKey?: string
  legacyFunctionNames?: string[]
  inputSchema?: string
  outputSchema?: string
  permissions?: ModulePermissions
}

export interface AppLifecycleContext {
  user: User | null
  isProd: boolean
  logger: Pick<Console, 'info' | 'warn' | 'error'>
}

export interface ModuleLifecycleHook {
  phase: ModuleLifecyclePhase
  name: string
  order?: number
  run: (context: AppLifecycleContext) => void | Promise<void>
}

export interface ModuleTestMetadata {
  smokeRoute: string
  readinessText?: string
  tags?: string[]
  isPrimaryPillar?: boolean
}

export interface AppModuleManifest {
  id: string
  version: string
  status: ModuleStatus
  title: string
  description: string
  permissions?: ModulePermissions
  routes: ModuleRouteContribution[]
  nav?: ModuleNavContribution[]
  dashboard?: ModuleDashboardContribution[]
  capabilities?: ModuleCapabilityContribution[]
  hooks?: ModuleLifecycleHook[]
  test?: ModuleTestMetadata
}