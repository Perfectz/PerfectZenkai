// src/modules/weight/routes.tsx
import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'

const WeightPage = lazy(() => import('./pages/WeightPage'))

export const weightRoutes: RouteObject[] = [
  {
    path: '/weight',
    element: <WeightPage />,
  },
] 