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
  checkAuthStatus: () => void
  setUser: (user: User, token: string) => void
}

// Helper function to determine which auth service to use
const getAuthService = () => {
  return supabase !== null ? 'supabase' : 'local'
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
            // Use local auth service
            const result = await localAuthService.login(credentials)
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
            // Use local auth service
            await localAuthService.register(data)
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
        })

        // Clear localStorage (but preserve local auth data if using local service)
        if (authService === 'supabase') {
          localStorage.clear()
        }
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuthStatus: async () => {
        try {
          const authService = getAuthService()
          let user: User | null = null
          let token: string = ''

          if (authService === 'supabase') {
            user = await supabaseAuth.getCurrentUser()
            token = user?.id || ''
          } else {
            // Use local auth service
            const session = localAuthService.getCurrentUser()
            if (session) {
              user = session.user
              token = session.token
            }
          }

          if (!user) {
            set({ isAuthenticated: false, user: null, token: null })
            return
          }

          // Update state with current session
          set({
            isAuthenticated: true,
            user,
            token,
          })

          // Initialize user databases if user exists and is authenticated
          if (user?.id) {
            const sanitizedUserId = sanitizeUserId(user.id)
            initializeUserDatabases(sanitizedUserId)
          }
        } catch (error) {
          console.error('Check auth status error:', error)
          set({ isAuthenticated: false, user: null, token: null })
        }
      },

      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        // Initialize user-specific databases
        const sanitizedUserId = sanitizeUserId(user.id)
        initializeUserDatabases(sanitizedUserId)
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

// Set up auth state listener
supabaseAuth.onAuthStateChange((user) => {
  const store = useAuthStore.getState()
  if (user && !store.isAuthenticated) {
    store.setUser(user, user.id)
  } else if (!user && store.isAuthenticated) {
    store.logout()
  }
})
