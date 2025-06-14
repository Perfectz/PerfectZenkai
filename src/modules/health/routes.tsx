import { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const HealthHubPage = lazy(() => import('./pages/HealthHubPage'))

export const healthRoutes: RouteObject[] = [
  {
    path: 'health',
    element: <HealthHubPage />,
  },
] 