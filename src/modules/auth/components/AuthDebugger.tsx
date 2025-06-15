import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

interface AuthDebugInfo {
  isAuthenticated: boolean
  user: unknown
  token: string | null
  isLoading: boolean
  isCheckingAuth: boolean
  lastAuthCheck: number
  retryCount: number
  timestamp: string
  localStorage: {
    authStorage: unknown
    currentUser: unknown
  }
}

export default function AuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: false,
    lastAuthCheck: 0,
    retryCount: 0,
    timestamp: new Date().toISOString(),
    localStorage: {
      authStorage: null,
      currentUser: null
    }
  })
  
  const { 
    isAuthenticated, 
    user, 
    token,
    isLoading,
    isCheckingAuth,
    lastAuthCheck,
    retryCount,
    checkAuthStatus, 
    forceLogout
  } = useAuthStore()

  useEffect(() => {
    const updateDebugInfo = () => {
      // Get localStorage data
      let authStorage = null
      let currentUser = null
      
      try {
        authStorage = JSON.parse(localStorage.getItem('auth-storage') || 'null')
      } catch (e) {
        authStorage = 'Parse Error'
      }
      
      try {
        currentUser = JSON.parse(localStorage.getItem('zenkai_current_user') || 'null')
      } catch (e) {
        currentUser = 'Parse Error'
      }

      setDebugInfo({
        isAuthenticated,
        user,
        token,
        isLoading,
        isCheckingAuth,
        lastAuthCheck,
        retryCount,
        timestamp: new Date().toISOString(),
        localStorage: {
          authStorage,
          currentUser
        }
      })
    }

    updateDebugInfo()
    const interval = setInterval(updateDebugInfo, 1000) // Update every second

    return () => clearInterval(interval)
  }, [isAuthenticated, user, token, isLoading, isCheckingAuth, lastAuthCheck, retryCount])

  const clearStorage = () => {
    localStorage.clear()
    sessionStorage.clear()
    console.log('🧹 All storage cleared')
  }

  const forceLogoutAction = () => {
    forceLogout()
    console.log('🚨 Force logout executed')
  }

  const forceAuthCheck = () => {
    checkAuthStatus()
    console.log('🔍 Force auth check executed')
  }

  const fixAuthState = () => {
    // Reset auth state to clean slate
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isCheckingAuth: false,
      error: null,
      lastAuthCheck: 0,
      retryCount: 0
    })
    console.log('🔧 Auth state reset to clean slate')
  }

  const timeSinceLastCheck = Date.now() - lastAuthCheck

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-md max-h-96 overflow-y-auto z-50">
      <h3 className="font-bold mb-2 text-yellow-400">🔍 Auth Debug Panel</h3>
      
      {/* Status Indicators */}
      <div className="mb-3 space-y-1">
        <div className={`px-2 py-1 rounded text-xs ${isAuthenticated ? 'bg-green-600' : 'bg-red-600'}`}>
          Auth: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
        </div>
        <div className={`px-2 py-1 rounded text-xs ${isLoading ? 'bg-yellow-600' : 'bg-gray-600'}`}>
          Loading: {isLoading ? '⏳ Yes' : '✅ No'}
        </div>
        <div className={`px-2 py-1 rounded text-xs ${isCheckingAuth ? 'bg-blue-600' : 'bg-gray-600'}`}>
          Checking: {isCheckingAuth ? '🔄 Yes' : '✅ No'}
        </div>
      </div>

      {/* Timing Info */}
      <div className="mb-3 text-xs">
        <div>Last Check: {lastAuthCheck ? `${Math.round(timeSinceLastCheck / 1000)}s ago` : 'Never'}</div>
        <div>Retry Count: {retryCount}/3</div>
      </div>

      {/* Debug Data */}
      <details className="mb-3">
        <summary className="cursor-pointer text-blue-400">📊 Full State</summary>
        <pre className="whitespace-pre-wrap text-xs mt-2 bg-gray-900 p-2 rounded max-h-32 overflow-y-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>

      {/* Action Buttons */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={forceAuthCheck} 
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            🔍 Check Auth
          </button>
          <button 
            onClick={fixAuthState} 
            className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
          >
            🔧 Fix State
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={clearStorage} 
            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            🧹 Clear Storage
          </button>
          <button 
            onClick={forceLogoutAction} 
            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            🚨 Force Logout
          </button>
        </div>
      </div>

      {/* Quick Status */}
      <div className="mt-3 pt-2 border-t border-gray-600 text-xs">
        <div className="text-gray-400">
          Updated: {new Date().toLocaleTimeString()}
        </div>
        {(isCheckingAuth || isLoading) && (
          <div className="text-yellow-400 animate-pulse">
            ⚠️ Auth operation in progress...
          </div>
        )}
      </div>
    </div>
  )
} 