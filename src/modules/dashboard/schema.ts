import type { Note } from '@/modules/notes/types'
import type { Todo } from '@/modules/tasks/types'
import type {
  DashboardContext,
  ModuleDashboardContribution,
  ModuleDashboardState,
  TileTone,
} from '@/app/module-system/types'
import { getAgentCapabilities, getDashboardSurface } from '@/app/module-system/registry'

export type { DashboardContext, TileTone } from '@/app/module-system/types'

export interface ModuleCardConfig {
  id: string
  eyebrow: string
  title: string
  description: string
  to: string
  icon: ModuleDashboardContribution['icon']
  value: string
  meta: string
  statusLabel: string
  tone: TileTone
  stats: Array<{ label: string; value: string }>
  footer: string
}

export interface CommandCenterQuickAction {
  id: string
  to: string
  label: string
}

const priorityRank = {
  high: 0,
  medium: 1,
  low: 2,
}

const getDueValue = (todo: Todo) => todo.dueDateTime || todo.dueDate || '9999-12-31'

const buildModuleCard = (
  item: ModuleDashboardContribution,
  state: ModuleDashboardState
): ModuleCardConfig => ({
  id: item.id,
  eyebrow: item.eyebrow,
  title: item.title,
  description: item.description,
  to: item.to,
  icon: item.icon,
  ...state,
})

export const buildRegistryCards = (
  registry: ModuleDashboardContribution[],
  context: DashboardContext
): ModuleCardConfig[] => registry.map((item) => buildModuleCard(item, item.buildState(context)))

export const getPrimaryDashboardCards = (context: DashboardContext): ModuleCardConfig[] =>
  buildRegistryCards(getDashboardSurface('dashboard-home'), context)

export const getTacticalDashboardCards = (context: DashboardContext): ModuleCardConfig[] =>
  buildRegistryCards(getDashboardSurface('dashboard-tactical'), context)

export const buildHeroQuickActions = (): CommandCenterQuickAction[] =>
  getDashboardSurface('dashboard-home')
    .filter((item) => item.quickActionLabel)
    .map((item) => ({
      id: item.id,
      to: item.to,
      label: item.quickActionLabel as string,
    }))

export const getRegisteredAgentCapabilities = () => getAgentCapabilities()

export const getTopFocusTodos = (todos: Todo[], limit = 3) =>
  [...todos]
    .sort((left, right) => {
      const priorityDelta = priorityRank[left.priority] - priorityRank[right.priority]
      if (priorityDelta !== 0) {
        return priorityDelta
      }

      const dueDelta = getDueValue(left).localeCompare(getDueValue(right))
      if (dueDelta !== 0) {
        return dueDelta
      }

      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    })
    .slice(0, limit)

export const getRecentCaptureNotes = (notes: Note[], limit = 3) =>
  [...notes]
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    )
    .slice(0, limit)