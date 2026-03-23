import { lazy, Suspense } from 'react'
import type { AppModuleManifest } from '@/app/module-system/types'
import { clearUserDatabases, initializeUserDatabases, sanitizeUserId } from './utils/dataIsolation'

const ModuleRegistryPage = lazy(() => import('@/app/module-system/ModuleRegistryPage'))

export const authModule = {
  id: 'auth',
  version: '1.0.0',
  status: 'enabled',
  title: 'Authentication',
  description: 'Session lifecycle, user isolation, and authentication state orchestration.',
  permissions: {
    requiresAuth: false,
    dataDomains: ['auth'],
    sideEffectLevel: 'write',
  },
  routes: [
    {
      id: 'auth.system-modules',
      title: 'Module inventory',
      route: {
        path: 'system/modules',
        element: (
          <Suspense fallback={<div>Loading module inventory...</div>}>
            <ModuleRegistryPage />
          </Suspense>
        ),
      },
    },
  ],
  hooks: [
    {
      phase: 'post-auth',
      name: 'auth.initialize-user-databases',
      order: 0,
      run: async ({ user }) => {
        if (!user?.id) {
          return
        }

        await initializeUserDatabases(sanitizeUserId(user.id))
      },
    },
    {
      phase: 'logout',
      name: 'auth.clear-user-databases',
      order: 0,
      run: async ({ user, logger }) => {
        if (!user?.id) {
          return
        }

        try {
          await clearUserDatabases(sanitizeUserId(user.id))
        } catch (error) {
          logger.error('Error clearing user databases during logout lifecycle phase:', error)
        }
      },
    },
  ],
  test: {
    smokeRoute: '/login',
    readinessText: 'Sign in',
    tags: ['auth', 'lifecycle'],
  },
} satisfies AppModuleManifest