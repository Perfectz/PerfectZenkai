import { RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const DietHubPage = lazy(() => import('./pages/DietHubPage'))

export const dietRoutes: RouteObject[] = [
  {
    path: 'diet',
    element: <DietHubPage />,
  },
] 