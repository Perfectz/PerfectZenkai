// src/app/routes.tsx

import { RouteObject } from 'react-router-dom'
import AppLayout from './AppLayout'
import WeightPage from '@/modules/weight/pages/WeightPage'
import TodoPage from '@/modules/tasks/pages/TodoPage'
import NotesPage from '@/modules/notes/pages/NotesPage'
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'
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
      { path: 'weight', element: <WeightPage /> },
      { path: 'todo', element: <TodoPage /> },
      { path: 'notes', element: <NotesPage /> },
    ],
  },
]
