// src/app/routes.tsx

import { RouteObject } from 'react-router-dom'
import AppLayout from './AppLayout'
import WeightPage from '@/modules/weight/pages/WeightPage'
import TodoPage from '@/modules/tasks/pages/TodoPage'
import NotesPage from '@/modules/notes/pages/NotesPage'
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'weight', element: <WeightPage /> },
      { path: 'todo', element: <TodoPage /> },
      { path: 'notes', element: <NotesPage /> },
    ],
  },
] 