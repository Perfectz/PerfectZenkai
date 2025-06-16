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

  // Debug component disabled
  return null
} 