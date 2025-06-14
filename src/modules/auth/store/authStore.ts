import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, User } from '../types/auth'
import { supabaseAuth } from '../services/supabaseAuth'
import { localAuthService } from '../services/localAuth'
import { supabase } from '@/lib/supabase'
import {
  initializeUserDatabases,
  clearUserDatabases,
  sanitizeUserId,
} from '../utils/dataIsolation'

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterData {
  username: string
  password: string
  email: string // Required for Supabase
  name?: string
}

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  checkAuthStatus: () => Promise<void>
  setUser: (user: User, token: string) => void
  
  // MVP-10 Enhancements
  isCheckingAuth: boolean
  lastAuthCheck: number
  retryCount: number

  // MVP-10: Force logout from all auth services
  forceLogout: () => Promise<void>
}

// Helper function to determine which auth service to use
const getAuthService = () => {
  return supabase !== null ? 'supabase' : 'local'
}

// MVP-10: Debounce configuration
const AUTH_CHECK_DEBOUNCE_MS = 500
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000

// MVP-10: Session validation helper
const validateSessionIntegrity = (state: AuthState): boolean => {
  if (state.isAuthenticated && (!state.user || !state.token)) {
    console.warn('🔍 Session integrity check failed: authenticated but missing user/token')
    return false
  }
  if (!state.isAuthenticated && (state.user || state.token)) {
    console.warn('🔍 Session integrity check failed: not authenticated but has user/token')
    return false
  }
  return true
}

// MVP-10: Retry helper with exponential backoff
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY_MS
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.warn(`🔄 Retry attempt ${attempt}/${maxAttempts} failed:`, error)
      
      if (attempt === maxAttempts) {
        break
      }
      
      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, backoffDelay))
    }
  }
  
  throw lastError!
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      
      // MVP-10: Enhanced state
      isCheckingAuth: false,
      lastAuthCheck: 0,
      retryCount: 0,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })

        try {
          console.log('🚀 Starting login process for:', credentials.username)
          const authService = getAuthService()
          console.log('🔧 Using auth service:', authService)

          let user: User | null = null
          let token: string = ''

          if (authService === 'supabase') {
            const { user: supabaseUser, error } =
              await supabaseAuth.loginWithUsername(
                credentials.username,
                credentials.password
              )

            if (error) {
              console.error('❌ Supabase login error:', error)
              throw new Error(error.message)
            }

            user = supabaseUser
            token = user?.id || ''
          } else {
            // Use local auth service with retry logic
            const result = await withRetry(() => localAuthService.login(credentials))
            user = result.user
            token = result.token
          }

          console.log('🔍 Login result:', { user, token })

          if (!user) {
            console.error('❌ No user returned from login')
            throw new Error('Login failed - no user returned')
          }

          console.log('✅ Login successful, setting user state')

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            retryCount: 0, // Reset retry count on success
          })

          // Initialize user-specific databases for data isolation
          const sanitizedUserId = sanitizeUserId(user.id)
          initializeUserDatabases(sanitizedUserId)

          console.log('🎉 Login process completed successfully')
        } catch (error) {
          console.error('💥 Login error in store:', error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
            user: null,
            token: null,
            isAuthenticated: false,
          })
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })

        try {
          // Validate password length
          if (data.password.length < 6) {
            throw new Error('Password must be at least 6 characters long')
          }

          const authService = getAuthService()
          console.log('🔧 Using auth service for registration:', authService)

          if (authService === 'supabase') {
            const { user, error } = await supabaseAuth.register(
              data.username,
              data.email,
              data.password
            )

            if (error) {
              throw new Error(error.message)
            }

            if (!user) {
              throw new Error('Registration failed')
            }
          } else {
            // Use local auth service with retry logic
            await withRetry(() => localAuthService.register(data))
          }

          // For registration, we'll just set loading to false and not authenticate
          // This allows the UI to handle the success state and redirect to login
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error('Registration error:', error)
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : 'Registration failed',
            user: null,
            token: null,
            isAuthenticated: false,
          })
        }
      },

      logout: async () => {
        const state = get()

        set({ isLoading: true })

        try {
          // Clear user-specific databases if user exists
          if (state.user?.id) {
            try {
              const sanitizedUserId = sanitizeUserId(state.user.id)
              await clearUserDatabases(sanitizedUserId)
            } catch (error) {
              console.error('Error clearing user databases:', error)
            }
          }

          // Logout from appropriate service
          const authService = getAuthService()
          if (authService === 'supabase') {
            await supabaseAuth.logout()
          } else {
            localAuthService.logout()
          }

          // Clear local state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isCheckingAuth: false,
            lastAuthCheck: 0,
            retryCount: 0,
          })

          // Clear localStorage (but preserve local auth data if using local service)
          if (authService === 'supabase') {
            localStorage.clear()
          }
        } catch (error) {
          console.error('Logout error:', error)
          // Even if logout fails, clear local state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isCheckingAuth: false,
            lastAuthCheck: 0,
            retryCount: 0,
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      // MVP-10: Enhanced checkAuthStatus with debouncing and retry logic
      checkAuthStatus: async () => {
        const state = get()
        const now = Date.now()
        
        // MVP-10: Prevent rapid successive calls (debouncing)
        if (state.isCheckingAuth || (now - state.lastAuthCheck) < AUTH_CHECK_DEBOUNCE_MS) {
          console.log('🔄 Auth check skipped - too recent or already in progress')
          return
        }

        // MVP-10: Validate current session integrity first
        if (!validateSessionIntegrity(state)) {
          console.log('🔧 Fixing corrupted session state')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          })
          return
        }

        console.log('🔍 Starting auth status check...')
        set({ isCheckingAuth: true, lastAuthCheck: now })

        try {
          const authService = getAuthService()
          let user: User | null = null
          let token: string = ''

          console.log('🔧 Using auth service:', authService)

          // MVP-10: Use retry logic for auth service calls
          if (authService === 'supabase') {
            console.log('🔍 Checking Supabase auth status...')
            try {
              // Add timeout for Supabase operations
              const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Supabase auth timeout')), 3000)
              })
              
              user = await Promise.race([
                withRetry(() => supabaseAuth.getCurrentUser()),
                timeoutPromise
              ])
              token = user?.id || ''
              console.log('✅ Supabase auth check successful:', user?.email)
            } catch (error) {
              console.error('❌ Supabase auth check failed:', error)
              // Force logout from Supabase and switch to local auth
              try {
                await supabaseAuth.logout()
                console.log('🔄 Logged out from Supabase, switching to local auth')
              } catch (logoutError) {
                console.error('Failed to logout from Supabase:', logoutError)
              }
              user = null
              token = ''
            }
          } else {
            // Use local auth service (no retry needed for synchronous call)
            const session = localAuthService.getCurrentUser()
            if (session) {
              user = session.user
              token = session.token
              console.log('✅ Found existing session for user:', user.username)
            } else {
              console.log('ℹ️ No existing session found')
            }
          }

          if (!user) {
            console.log('🔄 No user found, setting unauthenticated state')
            set({ 
              isAuthenticated: false, 
              user: null, 
              token: null,
              isCheckingAuth: false,
              retryCount: 0,
            })
            return
          }

          // Update state with current session
          console.log('✅ Auth check successful, user authenticated:', user.username)
          set({
            isAuthenticated: true,
            user,
            token,
            isCheckingAuth: false,
            retryCount: 0,
          })

          // Initialize user databases if user exists and is authenticated
          if (user?.id) {
            const sanitizedUserId = sanitizeUserId(user.id)
            initializeUserDatabases(sanitizedUserId)
          }
        } catch (error) {
          console.error('Check auth status error:', error)
          
          const currentState = get()
          const newRetryCount = currentState.retryCount + 1
          
          // MVP-10: Only clear auth state if we've exhausted retries
          if (newRetryCount >= MAX_RETRY_ATTEMPTS) {
            console.error('🚨 Max auth check retries exceeded, clearing auth state')
            set({ 
              isAuthenticated: false, 
              user: null, 
              token: null,
              isCheckingAuth: false,
              retryCount: 0,
            })
          } else {
            console.log(`🔄 Auth check retry ${newRetryCount}/${MAX_RETRY_ATTEMPTS}`)
            set({ 
              isCheckingAuth: false,
              retryCount: newRetryCount,
            })
          }
        }
      },

      setUser: (user: User, token: string) => {
        // MVP-10: Validate inputs
        if (!user || !token) {
          console.error('🚨 setUser called with invalid parameters')
          return
        }

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          retryCount: 0,
        })

        // Initialize user-specific databases
        const sanitizedUserId = sanitizeUserId(user.id)
        initializeUserDatabases(sanitizedUserId)
      },

      // MVP-10: Force logout from all auth services
      forceLogout: async () => {
        console.log('🔄 Force logout initiated...')
        
        try {
          // Clear Supabase session
          await supabaseAuth.logout()
          console.log('✅ Supabase logout completed')
        } catch (error) {
          console.error('❌ Supabase logout failed:', error)
        }

        try {
          // Clear local auth session
          localAuthService.logout()
          console.log('✅ Local auth logout completed')
        } catch (error) {
          console.error('❌ Local auth logout failed:', error)
        }

        // Clear all localStorage
        try {
          localStorage.clear()
          console.log('✅ localStorage cleared')
        } catch (error) {
          console.error('❌ localStorage clear failed:', error)
        }

        // Reset store state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isCheckingAuth: false,
          lastAuthCheck: 0,
          retryCount: 0,
        })

        console.log('✅ Force logout completed')
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// MVP-10: Enhanced auth state listener with loop prevention
let isAuthStateChangeInProgress = false

supabaseAuth.onAuthStateChange((user) => {
  // Prevent recursive calls
  if (isAuthStateChangeInProgress) {
    console.log('🔄 Auth state change already in progress, skipping')
    return
  }

  isAuthStateChangeInProgress = true
  
  try {
    const store = useAuthStore.getState()
    
    if (user && !store.isAuthenticated) {
      console.log('🔄 Auth state change: user logged in')
      store.setUser(user, user.id)
    } else if (!user && store.isAuthenticated) {
      console.log('🔄 Auth state change: user logged out')
      store.logout()
    }
  } catch (error) {
    console.error('Auth state change error:', error)
  } finally {
    isAuthStateChangeInProgress = false
  }
})
