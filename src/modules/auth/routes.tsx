import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

// Lazy load auth components
const LoginPage = lazy(() => import('./components/LoginPage'))
const AuthCallback = lazy(() => import('./components/AuthCallback'))

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
] 