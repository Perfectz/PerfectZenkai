import { useEffect, useCallback, useRef, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import type { AuthRole } from '../types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: AuthRole | AuthRole[]
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { 
    isAuthenticated, 
    isLoading, 
    isCheckingAuth, 
    checkAuthStatus,
    user,
    token
  } = useAuthStore()
  
  // MVP-10: Prevent multiple auth checks with ref
  const hasCheckedAuth = useRef(false)
  const [authCheckTimeout, setAuthCheckTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // MVP-10: Memoize checkAuthStatus to prevent unnecessary re-renders
  const stableCheckAuthStatus = useCallback(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      checkAuthStatus()
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.warn('⚠️ Auth check timeout - forcing unauthenticated state')
        useAuthStore.setState({
          isAuthenticated: false,
          isCheckingAuth: false,
          isLoading: false,
          user: null,
          token: null
        })
      }, 10000) // 10 second timeout
      
      setAuthCheckTimeout(timeout)
    }
  }, [checkAuthStatus])

  useEffect(() => {
    stableCheckAuthStatus()
    
    // Cleanup timeout on unmount
    return () => {
      if (authCheckTimeout) {
        clearTimeout(authCheckTimeout)
      }
    }
  }, [stableCheckAuthStatus, authCheckTimeout])

  // Clear timeout when auth check completes
  useEffect(() => {
    if (!isCheckingAuth && authCheckTimeout) {
      clearTimeout(authCheckTimeout)
      setAuthCheckTimeout(null)
    }
  }, [isCheckingAuth, authCheckTimeout])

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
          
          {/* Emergency escape button after 5 seconds */}
          {(isCheckingAuth || isLoading) && (
            <button
              onClick={() => {
                console.log('🚨 Emergency logout triggered by user')
                useAuthStore.getState().forceLogout()
              }}
              className="mt-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Having trouble? Click here to reset
            </button>
          )}
        </div>
      </div>
    )
  }

  // Additional validation: if we have persisted user/token but not authenticated,
  // and we're not checking auth, something went wrong
  if (!isAuthenticated && (user || token) && !isCheckingAuth) {
    console.warn('⚠️ Inconsistent auth state detected, clearing...')
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    })
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requiredRoles) {
    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  // Render protected content
  return <>{children}</>
}

export { ProtectedRoute }
