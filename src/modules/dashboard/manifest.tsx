import { Home } from 'lucide-react'
import DashboardPage from './pages/DashboardPage'
import type { AppModuleManifest } from '@/app/module-system/types'

export const dashboardModule = {
  id: 'dashboard',
  version: '1.0.0',
  status: 'enabled',
  title: 'Home',
  description: 'Primary command center surface for routing attention across modules.',
  permissions: {
    requiresAuth: true,
    dataDomains: ['dashboard'],
    sideEffectLevel: 'read',
  },
  routes: [
    {
      id: 'dashboard.index',
      title: 'Dashboard',
      route: { index: true, element: <DashboardPage /> },
    },
    {
      id: 'dashboard.named',
      title: 'Dashboard',
      route: { path: 'dashboard', element: <DashboardPage /> },
    },
  ],
  nav: [
    {
      id: 'dashboard.primary-nav',
      surface: 'primary',
      label: 'Home',
      to: '/',
      icon: Home,
      order: 0,
    },
  ],
  capabilities: [
    {
      id: 'dashboard.summarize-day',
      label: 'Summarize dashboard state',
      description: 'Expose the current dashboard posture to the OpenClaude control layer.',
      visibility: 'agent',
      handlerKey: 'dashboard.summarize-day',
      legacyFunctionNames: ['getUserInfo', 'getTasksStats', 'getWeightStats'],
      inputSchema: 'dashboard.summary.request',
      outputSchema: 'dashboard.summary.response',
      permissions: {
        requiresAuth: true,
        dataDomains: ['dashboard'],
        sideEffectLevel: 'read',
      },
    },
  ],
  test: {
    smokeRoute: '/',
    readinessText: 'Daily command center',
    tags: ['pillar', 'dashboard'],
    isPrimaryPillar: true,
  },
} satisfies AppModuleManifest