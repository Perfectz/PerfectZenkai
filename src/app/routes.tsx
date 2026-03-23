// src/app/routes.tsx

import React, { lazy, Suspense } from 'react'
import { Navigate, RouteObject } from 'react-router-dom'
import AppLayout from './AppLayout'
import { authRoutes, ProtectedRoute } from '@/modules/auth'
import AdminPage from '@/modules/auth/pages/AdminPage'
import UseCaseOverviewPage from '@/components/UseCaseOverviewPage'
import { getProtectedModuleRoutes } from './module-system/registry'

const ChatPage = lazy(() => import('@/modules/ai-chat/pages/ChatPage').then(module => ({ default: module.ChatPage })))

export const appRoutes: RouteObject[] = [
  // Authentication routes (public)
  ...authRoutes,
  
  // Public portfolio routes
  {
    path: '/use-case-overview',
    element: <UseCaseOverviewPage />,
  },

  // Protected app routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      ...getProtectedModuleRoutes(),
      { path: 'daily-standup', element: <Navigate to="/journal" replace /> },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRoles="admin">
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      { 
        path: 'chat', 
        element: (
          <Suspense fallback={<div>Loading AI Chat...</div>}>
            <ChatPage />
          </Suspense>
        ) 
      },
    ],
  },
]
