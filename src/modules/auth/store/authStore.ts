import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, User } from '../types/auth'
import { supabaseAuth } from '../services/supabaseAuth'
import { offlineSyncService } from '@/shared/services/OfflineSyncService'
import { initializeWeightStore } from '@/modules/weight'
import { initializeNotesStore } from '@/modules/notes'
import { ttsService } from '@/modules/ai-chat/services/TextToSpeechService'

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
  setUser: (user: User, token: string) => Promise<void>
  
  // MVP-10 Enhancements
  isCheckingAuth: boolean
  lastAuthCheck: number
  retryCount: number

  // MVP-10: Force logout from all auth services
  forceLogout: () => Promise<void>
}

// Helper function to determine which auth service to use


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

// Helper function to sanitize user IDs for use in paths or keys
const sanitizeUserId = (userId: string): string => {
  // Replace non-alphanumeric characters with underscores
  return userId.replace(/[^a-zA-Z0-9]/g, '_')
}

// Helper function to initialize user-specific databases
const initializeUserDatabases = (sanitizedUserId: string) => {
  // This function would contain logic to initialize or switch to user-specific databases
  // For now, it's a placeholder to demonstrate the concept.
  console.log(`Initializing databases for user: ${sanitizedUserId}`)
  // Example: initializeWeightStore(sanitizedUserId), initializeNotesStore(sanitizedUserId)
}

// Helper function to clear user-specific databases
const clearUserDatabases = async (sanitizedUserId: string) => {
  console.log(`Clearing databases for user: ${sanitizedUserId}`)
  // Example: await clearWeightStore(sanitizedUserId), await clearNotesStore(sanitizedUserId)
}

// Global flag to track if auth state change has provided user info
let authStateChangeProvidedUser = false

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
          let user: User | null = null
          let token: string = ''

          try {
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
          } catch (supabaseError) {
            console.error('❌ Supabase login failed:', supabaseError)
            const errorMessage = supabaseError instanceof Error ? supabaseError.message : 'Authentication failed'
            throw new Error(`Authentication failed: ${errorMessage}`)
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

          // Trigger full sync after successful login
          offlineSyncService.fullSync()

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

          console.log('🔧 Using Supabase for registration')

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
          await supabaseAuth.logout()

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

          // Clear localStorage
          localStorage.clear()

          // Clear offline sync errors and queue
          offlineSyncService.clearErrors()
          // Assuming a clearQueue method exists or will be added to OfflineSyncService
          // offlineSyncService.clearQueue()

          // Clear TTS cache
          ttsService.clearCache()
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
          let user: User | null = null
          let token: string = ''

          console.log('🔍 Checking Supabase auth status...')
          
          // If auth state change already provided user, skip the potentially hanging Supabase call
          const state = get()
          if (authStateChangeProvidedUser && state.user) {
            console.log('✅ Using user from auth state change, skipping Supabase call')
            user = state.user
            token = state.token || user.id
          } else {
            try {
              // Add timeout for Supabase operations (increased to 8 seconds)
              const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Supabase auth timeout')), 8000)
              })
              
              // Try to get session directly (faster, no profile fetch)
              user = await Promise.race([
                supabaseAuth.getSession(),
                timeoutPromise
              ])
              token = user?.id || ''
              console.log('✅ Supabase auth check successful:', user?.email)
            } catch (error) {
              console.error('❌ Supabase auth check failed:', error)
              
              // Force logout from Supabase to clean up
              try {
                await supabaseAuth.logout()
                console.log('🔄 Logged out from Supabase after failure')
              } catch (logoutError) {
                console.error('Failed to logout from Supabase:', logoutError)
              }
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
            
            // Initialize tasks store after auth is confirmed
            try {
              const { initializeTasksStore } = await import('@/modules/tasks')
              await initializeTasksStore()
            } catch (error) {
              console.error('Failed to initialize tasks store:', error)
            }
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

      setUser: async (user: User, token: string) => {
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
        
        // Initialize module stores after user is set
        try {
          await initializeWeightStore()
          await initializeNotesStore()
          const { initializeTasksStore } = await import('@/modules/tasks')
          await initializeTasksStore()
        } catch (error) {
          console.error('Failed to initialize module stores in setUser:', error)
        }
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
        // Only persist user and token, not isAuthenticated
        // This forces a fresh auth check on app reload
        user: state.user,
        token: state.token,
      }),
      // Add onRehydrateStorage to handle state restoration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Force auth check when state is rehydrated
          console.log('🔄 Auth state rehydrated, forcing auth check')
          // Don't set isAuthenticated to true immediately
          // Let checkAuthStatus determine the actual auth state
          state.isAuthenticated = false
          state.isCheckingAuth = false
          state.lastAuthCheck = 0
          state.retryCount = 0
          
          // Trigger auth check after a short delay
          setTimeout(() => {
            useAuthStore.getState().checkAuthStatus()
          }, 100)
        }
      },
    }
  )
)

// MVP-10: Enhanced auth state listener with loop prevention
let isAuthStateChangeInProgress = false

supabaseAuth.onAuthStateChange(async (user) => {
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
      authStateChangeProvidedUser = true
      await store.setUser(user, user.id)
    } else if (!user && store.isAuthenticated) {
      console.log('🔄 Auth state change: user logged out')
      authStateChangeProvidedUser = false
      await store.logout()
    }
  } catch (error) {
    console.error('Auth state change error:', error)
  } finally {
    isAuthStateChangeInProgress = false
  }
})
