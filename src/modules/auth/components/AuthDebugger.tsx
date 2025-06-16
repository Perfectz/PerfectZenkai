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
  const [isVisible, setIsVisible] = useState(false)
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

  const checkSupabaseAuth = async () => {
    console.log('🔍 Checking Supabase authentication status...')
    const { supabase } = await import('@/lib/supabase')
    if (!supabase) {
      console.log('❌ Supabase not available')
      return
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('📊 Supabase session:', { session: !!session, user: session?.user?.email, error })
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('👤 Supabase user:', { user: !!user, email: user?.email, error: userError })
    } catch (error) {
      console.error('❌ Supabase auth check failed:', error)
    }
  }

  const migrateToSupabaseAuth = async () => {
    console.log('🔄 Starting migration to Supabase auth...')
    
    // Check if user is currently authenticated locally
    const currentUser = user
    if (!currentUser) {
      console.log('❌ No current user to migrate')
      alert('Please log in first before migrating to Supabase auth')
      return
    }

    // Check if user has email (required for Supabase)
    if (!currentUser.email) {
      console.log('❌ Current user has no email')
      alert('Current user has no email. Please log out and register with Supabase auth.')
      return
    }

    try {
      // Try to register the user with Supabase using their existing credentials
      const password = prompt('Please enter your password to migrate to Supabase auth:')
      if (!password) {
        console.log('❌ Migration cancelled - no password provided')
        return
      }

      const { supabaseAuth } = await import('../services/supabaseAuth')
      const result = await supabaseAuth.register(
        currentUser.username || currentUser.name,
        currentUser.email,
        password
      )

      if (result.error) {
        console.error('❌ Supabase registration failed:', result.error)
        alert(`Migration failed: ${result.error.message}`)
        return
      }

      console.log('✅ Successfully registered with Supabase')
      
      // Now try to login with Supabase
      const loginResult = await supabaseAuth.loginWithUsername(
        currentUser.username || currentUser.name,
        password
      )

      if (loginResult.error) {
        console.error('❌ Supabase login failed:', loginResult.error)
        alert(`Login failed: ${loginResult.error.message}`)
        return
      }

      console.log('✅ Successfully logged in with Supabase')
      
      // Update the auth store with the new Supabase user
      if (loginResult.user) {
        await useAuthStore.getState().setUser(loginResult.user, loginResult.user.id)
        console.log('✅ Migration to Supabase auth complete!')
        alert('Successfully migrated to Supabase auth! Your todos will now sync to the cloud.')
      }

    } catch (error) {
      console.error('❌ Migration failed:', error)
      alert(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700"
          title="Show Auth Debug Panel"
        >
          🔧
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Auth Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <strong>Status:</strong>{' '}
          <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </span>
        </div>

        <div>
          <strong>User:</strong>{' '}
          <span className="font-mono text-xs">
            {user ? `${user.username || user.name} (${user.id})` : 'None'}
          </span>
        </div>

        <div>
          <strong>Token:</strong>{' '}
          <span className="font-mono text-xs">
            {token ? `${token.substring(0, 20)}...` : 'None'}
          </span>
        </div>

        <div>
          <strong>Loading:</strong>{' '}
          <span className={isLoading ? 'text-yellow-600' : 'text-gray-600'}>
            {isLoading ? '⏳ Loading' : '✅ Ready'}
          </span>
        </div>

        <div>
          <strong>Checking Auth:</strong>{' '}
          <span className={isCheckingAuth ? 'text-yellow-600' : 'text-gray-600'}>
            {isCheckingAuth ? '🔄 Checking' : '✅ Idle'}
          </span>
        </div>

        <div>
          <strong>Last Check:</strong>{' '}
          <span className="text-xs">
            {lastAuthCheck ? new Date(lastAuthCheck).toLocaleTimeString() : 'Never'}
          </span>
        </div>

        <div>
          <strong>Retry Count:</strong>{' '}
          <span className={retryCount > 0 ? 'text-yellow-600' : 'text-gray-600'}>
            {retryCount}
          </span>
        </div>

        <div>
          <strong>Timestamp:</strong>{' '}
          <span className="text-xs">{debugInfo.timestamp}</span>
        </div>

        <div className="space-y-2 border-t pt-2">
          <button
            onClick={forceAuthCheck}
            className="w-full rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          >
            🔍 Force Auth Check
          </button>
          
          <button
            onClick={checkSupabaseAuth}
            className="w-full rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
          >
            🔍 Check Supabase Auth
          </button>

          <button
            onClick={migrateToSupabaseAuth}
            className="w-full rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-700"
          >
            🔄 Migrate to Supabase Auth
          </button>

          <button
            onClick={clearStorage}
            className="w-full rounded bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-700"
          >
            🧹 Clear Storage
          </button>

          <button
            onClick={forceLogoutAction}
            className="w-full rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
          >
            🚨 Force Logout
          </button>
        </div>

        <details className="border-t pt-2">
          <summary className="cursor-pointer font-medium">Storage Data</summary>
          <div className="mt-2 space-y-2 text-xs">
            <div>
              <strong>Auth Storage:</strong>
              <pre className="mt-1 max-h-20 overflow-auto rounded bg-gray-100 p-2 dark:bg-gray-700">
                {JSON.stringify(debugInfo.localStorage.authStorage, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Current User:</strong>
              <pre className="mt-1 max-h-20 overflow-auto rounded bg-gray-100 p-2 dark:bg-gray-700">
                {JSON.stringify(debugInfo.localStorage.currentUser, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
} 