// src/app/routes.tsx

import { RouteObject } from 'react-router-dom'
import AppLayout from './AppLayout'
import HealthHubPage from '@/modules/health/pages/HealthHubPage'
import TodoPage from '@/modules/tasks/pages/TodoPage'
import NotesPage from '@/modules/notes/pages/NotesPage'
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'
import JournalPage from '@/modules/journal/pages/JournalPage'
import { DailyJournalPage } from '@/modules/daily-journal'
import { GoalsPage } from '@/modules/goals'
import { ChatPage } from '@/modules/ai-chat'
import { authRoutes, ProtectedRoute } from '@/modules/auth'
import UseCaseOverviewPage from '@/components/UseCaseOverviewPage'

export const appRoutes: RouteObject[] = [
  // Authentication routes (public)
  ...authRoutes,
  
  // Public portfolio routes
  {
    path: '/use-case-overview',
    element: <UseCaseOverviewPage />,
  },

  // Protected app routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'health', element: <HealthHubPage /> },
      { path: 'todo', element: <TodoPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'daily-standup', element: <DailyJournalPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'chat', element: <ChatPage /> },
    ],
  },
]
