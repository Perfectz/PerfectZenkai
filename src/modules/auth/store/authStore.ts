import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, User } from '../types/auth'
import { supabaseAuth } from '../services/supabaseAuth'
import { initializeUserDatabases, clearUserDatabases, sanitizeUserId } from '../utils/dataIsolation'

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
          
          const { user, error } = await supabaseAuth.loginWithUsername(
            credentials.username, 
            credentials.password
          )
          
          console.log('🔍 Login result:', { user, error })
          
          if (error) {
            console.error('❌ Login error from service:', error)
            throw new Error(error.message)
          }

          if (!user) {
            console.error('❌ No user returned from login')
            throw new Error('Login failed - no user returned')
          }
          
          console.log('✅ Login successful, setting user state')
          
          set({
            user,
            token: user.id, // Use user ID as token for simplicity
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
            error: error instanceof Error ? error.message : 'Registration failed',
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

        // Logout from Supabase
        await supabaseAuth.logout()

        // Clear local state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })

        // Clear localStorage
        localStorage.clear()
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuthStatus: async () => {
        try {
          const user = await supabaseAuth.getCurrentUser()
          
          if (!user) {
            set({ isAuthenticated: false, user: null, token: null })
            return
          }

          // Update state with current session
          set({ 
            isAuthenticated: true, 
            user, 
            token: user.id
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