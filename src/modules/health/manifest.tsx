import { BarChart3, HeartPulse } from 'lucide-react'
import HealthHubPage from './pages/HealthHubPage'
import type { AppModuleManifest } from '@/app/module-system/types'
import { kgToLbs } from '@/modules/weight/types'
import { initializeWeightStore } from '@/modules/weight'

export const healthModule = {
  id: 'health',
  version: '1.0.0',
  status: 'enabled',
  title: 'Health',
  description: 'Weight and body-state tracking for the recovery and health lane.',
  permissions: {
    requiresAuth: true,
    dataDomains: ['health', 'weight'],
    sideEffectLevel: 'write',
  },
  routes: [
    {
      id: 'health.hub',
      title: 'Health Hub',
      route: { path: 'health', element: <HealthHubPage /> },
    },
  ],
  nav: [
    {
      id: 'health.primary-nav',
      surface: 'primary',
      label: 'Health',
      to: '/health',
      icon: BarChart3,
      order: 10,
    },
  ],
  dashboard: [
    {
      id: 'health.dashboard-card',
      surface: 'dashboard-home',
      order: 10,
      eyebrow: 'Health',
      title: 'Body and recovery',
      description:
        'Track weight, review trends, and keep the health lane current without leaving the dashboard.',
      to: '/health',
      icon: HeartPulse,
      quickActionLabel: 'Log health',
      buildState: ({ todayWeight, latestWeight, weights }) => ({
        value: todayWeight ? `${kgToLbs(todayWeight.kg).toFixed(1)} lb` : 'No log today',
        meta: latestWeight
          ? `Latest entry ${new Date(latestWeight.dateISO).toLocaleDateString()}`
          : 'Start by logging your first weight entry.',
        statusLabel: todayWeight ? 'On track' : 'Needs check-in',
        tone: 'emerald',
        stats: [
          { label: 'Entries', value: `${weights.length}` },
          { label: 'Today', value: todayWeight ? 'Logged' : 'Missing' },
        ],
        footer: todayWeight
          ? 'Health logging is active for today.'
          : 'A single weight log keeps the trend reliable.',
      }),
    },
  ],
  capabilities: [
    {
      id: 'health.log-weight',
      label: 'Log weight entry',
      description: 'Create or update a weight log entry through the health lane.',
      visibility: 'agent',
      handlerKey: 'health.log-weight',
      legacyFunctionNames: ['addWeight', 'updateWeight', 'deleteWeight', 'getWeights', 'setWeightGoal', 'getWeightStats'],
      inputSchema: 'health.log-weight.request',
      outputSchema: 'health.log-weight.response',
      permissions: {
        requiresAuth: true,
        dataDomains: ['health', 'weight'],
        sideEffectLevel: 'write',
      },
    },
  ],
  hooks: [
    {
      phase: 'post-auth',
      name: 'health.initialize-weight-store',
      order: 10,
      run: async () => {
        await initializeWeightStore()
      },
    },
  ],
  test: {
    smokeRoute: '/health',
    readinessText: 'Health Hub',
    tags: ['pillar', 'health'],
    isPrimaryPillar: true,
  },
} satisfies AppModuleManifest