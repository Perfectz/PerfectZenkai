import { lazy, Suspense } from 'react'
import { Bot } from 'lucide-react'
import type { AppModuleManifest } from '@/app/module-system/types'

const ChatPage = lazy(() =>
  import('./pages/ChatPage').then((module) => ({ default: module.ChatPage }))
)

export const aiChatModule = {
  id: 'ai-chat',
  version: '2.0.0',
  status: 'enabled',
  title: 'AI Companion',
  description: 'Local OpenAI-powered analysis across the user data snapshot.',
  permissions: {
    requiresAuth: true,
    dataDomains: ['tasks', 'weight', 'meals', 'workouts', 'journal', 'notes'],
    sideEffectLevel: 'external-network',
  },
  routes: [
    {
      id: 'ai-chat.main',
      title: 'AI Companion',
      route: {
        path: 'assistant',
        element: (
          <Suspense fallback={<div>Loading assistant...</div>}>
            <ChatPage />
          </Suspense>
        ),
      },
    },
  ],
  nav: [
    {
      id: 'ai-chat.primary-nav',
      surface: 'primary',
      label: 'AI',
      to: '/assistant',
      icon: Bot,
      order: 50,
    },
  ],
  capabilities: [
    {
      id: 'ai-chat.local-analysis',
      label: 'Analyze local data snapshot',
      description:
        'Uses a user-provided OpenAI key to analyze local app data and produce personal assistant recommendations.',
      visibility: 'user',
      permissions: {
        requiresAuth: true,
        dataDomains: ['tasks', 'weight', 'meals', 'workouts', 'journal', 'notes'],
        sideEffectLevel: 'external-network',
      },
    },
  ],
  test: {
    smokeRoute: '/assistant',
    readinessText: 'AI Command Companion',
    tags: ['ai', 'assistant', 'local-storage'],
  },
} satisfies AppModuleManifest
