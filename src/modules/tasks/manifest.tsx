import { Activity, CheckSquare, CheckSquare2 } from 'lucide-react'
import TodoPage from './pages/TodoPage'
import type { AppModuleManifest } from '@/app/module-system/types'

export const tasksModule = {
  id: 'tasks',
  version: '1.0.0',
  status: 'enabled',
  title: 'Todo',
  description: 'Execution queue for tasks, focus lanes, and due work.',
  permissions: {
    requiresAuth: true,
    dataDomains: ['tasks'],
    sideEffectLevel: 'write',
  },
  routes: [
    {
      id: 'tasks.todo',
      title: 'Tasks',
      route: { path: 'todo', element: <TodoPage /> },
    },
  ],
  nav: [
    {
      id: 'tasks.primary-nav',
      surface: 'primary',
      label: 'Todo',
      to: '/todo',
      icon: CheckSquare,
      order: 20,
    },
  ],
  dashboard: [
    {
      id: 'tasks.dashboard-card',
      surface: 'dashboard-home',
      order: 20,
      eyebrow: 'Todo',
      title: 'Execution queue',
      description:
        'Keep the day focused with one live view of open work, overdue tasks, and priority load.',
      to: '/todo',
      icon: CheckSquare2,
      quickActionLabel: 'Review tasks',
      buildState: ({ openTodos, overdueTodos, highPriorityTodos, completedToday }) => ({
        value: `${openTodos.length} open`,
        meta:
          completedToday.length > 0
            ? `${completedToday.length} finished today`
            : 'No tasks completed yet today.',
        statusLabel: overdueTodos.length > 0 ? 'Needs cleanup' : 'Stable',
        tone: overdueTodos.length > 0 ? 'amber' : 'sky',
        stats: [
          { label: 'Overdue', value: `${overdueTodos.length}` },
          { label: 'High priority', value: `${highPriorityTodos.length}` },
        ],
        footer:
          overdueTodos.length > 0
            ? 'Clear the overdue list before adding more complexity.'
            : 'Your task queue is contained and ready to work from.',
      }),
    },
    {
      id: 'tasks.focus-card',
      surface: 'dashboard-tactical',
      order: 20,
      eyebrow: 'Focus lane',
      title: 'Reduce task sprawl',
      description:
        'The queue stays useful only when today has a small, current set of active commitments.',
      to: '/todo',
      icon: Activity,
      buildState: ({ openTodos, completedToday }) => ({
        value: `${Math.min(openTodos.length, 3)} top slots`,
        meta:
          openTodos.length > 3
            ? 'More than three active tasks suggests fragmentation.'
            : 'The current open load is in a workable range.',
        statusLabel: openTodos.length > 3 ? 'Trim list' : 'Focused',
        tone: openTodos.length > 3 ? 'amber' : 'sky',
        stats: [
          { label: 'Open', value: `${openTodos.length}` },
          { label: 'Done today', value: `${completedToday.length}` },
        ],
        footer: 'Use the todo module as an execution surface, not long-term storage.',
      }),
    },
  ],
  capabilities: [
    {
      id: 'tasks.manage-queue',
      label: 'Manage task queue',
      description: 'Create, reprioritize, and complete task queue items.',
      visibility: 'agent',
      handlerKey: 'tasks.manage-queue',
      legacyFunctionNames: ['addTodo', 'updateTodo', 'deleteTodo', 'toggleTodo', 'getTodos', 'clearAllTasks', 'getTasksStats'],
      inputSchema: 'tasks.manage.request',
      outputSchema: 'tasks.manage.response',
      permissions: {
        requiresAuth: true,
        dataDomains: ['tasks'],
        sideEffectLevel: 'write',
      },
    },
  ],
  test: {
    smokeRoute: '/todo',
    readinessText: 'Tasks',
    tags: ['pillar', 'tasks'],
    isPrimaryPillar: true,
  },
} satisfies AppModuleManifest