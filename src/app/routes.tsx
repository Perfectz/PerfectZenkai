// src/app/routes.tsx
import React from 'react'
import { RouteObject } from 'react-router-dom'
import AppLayout from './AppLayout'
import WeightPage from '@/modules/weight/pages/WeightPage'

// Temporary dashboard component
const Dashboard = React.lazy(() => import('@/app/DashboardPlaceholder'))

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'weight', element: <WeightPage /> },
    ],
  },
] 