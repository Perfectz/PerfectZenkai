import { useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    isCheckingAuth, 
    checkAuthStatus 
  } = useAuthStore()
  
  // MVP-10: Prevent multiple auth checks with ref
  const hasCheckedAuth = useRef(false)
  
  // MVP-10: Memoize checkAuthStatus to prevent unnecessary re-renders
  const stableCheckAuthStatus = useCallback(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      checkAuthStatus()
    }
  }, [checkAuthStatus])

  useEffect(() => {
    stableCheckAuthStatus()
  }, [stableCheckAuthStatus])

  // MVP-10: Show loading while checking authentication or during auth operations
  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isCheckingAuth ? 'Verifying session...' : 'Loading...'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isCheckingAuth 
                ? 'Please wait while we verify your authentication status'
                : 'Checking your authentication status'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Render protected content
  return <>{children}</>
}

export { ProtectedRoute }
