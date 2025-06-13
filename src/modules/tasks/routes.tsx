import React from 'react'
import { RouteObject } from 'react-router-dom'

const TodoPage = React.lazy(() => import('./pages/TodoPage'))

export const taskRoutes: RouteObject[] = [
  { path: 'todo', element: <TodoPage /> },
] 