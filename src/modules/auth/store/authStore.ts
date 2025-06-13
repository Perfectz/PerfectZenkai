import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, User } from '../types/auth'
import { localAuthService } from '../services/localAuth'
import { initializeUserDatabases, clearUserDatabases, sanitizeUserId } from '../utils/dataIsolation'

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterData {
  username: string
  password: string
  email?: string
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
          const { user, token } = await localAuthService.login(credentials)
          
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

          // Note: Navigation will be handled by React Router
          // No need for manual redirect here
        } catch (error) {
          console.error('Login error:', error)
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

          const user = await localAuthService.register(data)
          
          // Auto-login after registration
          const { user: loginUser, token } = await localAuthService.login({
            username: data.username,
            password: data.password
          })
          
          set({
            user: loginUser,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          // Initialize user-specific databases for data isolation
          const sanitizedUserId = sanitizeUserId(loginUser.id)
          initializeUserDatabases(sanitizedUserId)

          // Note: Navigation will be handled by React Router
          // No need for manual redirect here
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
        const { user } = get()
        
        set({ isLoading: true })

        // Clear user-specific databases if user exists
        if (user?.id) {
          try {
            const sanitizedUserId = sanitizeUserId(user.id)
            await clearUserDatabases(sanitizedUserId)
          } catch (error) {
            console.error('Error clearing user databases:', error)
          }
        }

        // Logout from local auth service
        localAuthService.logout()

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

        // Note: Redirect will be handled by ProtectedRoute
        // No need for manual redirect here
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuthStatus: () => {
        const currentSession = localAuthService.getCurrentUser()
        
        if (!currentSession) {
          set({ isAuthenticated: false, user: null, token: null })
          return
        }

        const { user, token } = currentSession

        // Update state with current session
        set({ 
          isAuthenticated: true, 
          user, 
          token 
        })
        
        // Initialize user databases if user exists and is authenticated
        if (user?.id) {
          const sanitizedUserId = sanitizeUserId(user.id)
          initializeUserDatabases(sanitizedUserId)
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

// Initialize auth status check on store creation
useAuthStore.getState().checkAuthStatus() 