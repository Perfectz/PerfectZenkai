import React from 'react'
import { RouteObject } from 'react-router-dom'

const SimpleTodoPage = React.lazy(() => import('./pages/SimpleTodoPage'))

export const taskRoutes: RouteObject[] = [
  { path: 'todo', element: <SimpleTodoPage /> },
]
