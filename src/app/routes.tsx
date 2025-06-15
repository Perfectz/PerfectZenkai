// src/app/routes.tsx

import { RouteObject } from 'react-router-dom'
import AppLayout from './AppLayout'
import HealthHubPage from '@/modules/health/pages/HealthHubPage'
import TodoPage from '@/modules/tasks/pages/TodoPage'
import NotesPage from '@/modules/notes/pages/NotesPage'
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'
import JournalPage from '@/modules/journal/pages/JournalPage'
import { GoalsPage } from '@/modules/goals'
import { authRoutes, ProtectedRoute } from '@/modules/auth'

export const appRoutes: RouteObject[] = [
  // Authentication routes (public)
  ...authRoutes,

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
      { path: 'notes', element: <NotesPage /> },
    ],
  },
]
