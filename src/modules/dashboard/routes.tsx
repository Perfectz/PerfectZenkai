import React from 'react'
import { RouteObject } from 'react-router-dom'

const DashboardPage = React.lazy(() => import('./pages/DashboardPage'))

export const dashboardRoutes: RouteObject[] = [
  { index: true, element: <DashboardPage /> },
] 