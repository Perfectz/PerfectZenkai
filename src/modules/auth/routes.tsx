import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

// Lazy load auth components
const SimpleLoginPage = lazy(() => import('./components/SimpleLoginPage'))

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <SimpleLoginPage />,
  },
] 