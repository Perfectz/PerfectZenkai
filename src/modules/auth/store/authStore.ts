import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, User } from '../types/auth'
import { googleAuthService } from '../services/googleAuth'

interface AuthStore extends AuthState {
  // Actions
  login: () => void
  handleCallback: (code: string) => Promise<void>
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
      login: () => {
        set({ isLoading: true, error: null })
        try {
          googleAuthService.login()
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          })
        }
      },

      handleCallback: async (code: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Exchange code for tokens
          const tokens = await googleAuthService.handleCallback(code)
          
          // Decode ID token to get user info
          const decodedToken = googleAuthService.decodeToken(tokens.id_token)
          
          // Create user object
          const user: User = {
            id: decodedToken.sub,
            email: decodedToken.email,
            name: decodedToken.name,
            picture: decodedToken.picture,
            given_name: decodedToken.given_name,
            family_name: decodedToken.family_name,
          }

          set({
            user,
            token: tokens.id_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          // Redirect to dashboard after successful login
          window.location.href = '/dashboard'
        } catch (error) {
          console.error('Authentication callback error:', error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
            user: null,
            token: null,
            isAuthenticated: false,
          })
        }
      },

      logout: async () => {
        const { token } = get()
        
        set({ isLoading: true })

        try {
          // Revoke token with Google
          if (token) {
            await googleAuthService.revokeToken(token)
          }
        } catch (error) {
          console.error('Token revocation error:', error)
          // Continue with local logout even if revocation fails
        }

        // Clear local state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })

        // Clear all user data from localStorage and IndexedDB
        localStorage.clear()
        
        // Clear IndexedDB databases
        try {
          const databases = await indexedDB.databases()
          await Promise.all(
            databases.map(db => {
              if (db.name) {
                return new Promise<void>((resolve, reject) => {
                  const deleteReq = indexedDB.deleteDatabase(db.name!)
                  deleteReq.onsuccess = () => resolve()
                  deleteReq.onerror = () => reject(deleteReq.error)
                })
              }
            })
          )
        } catch (error) {
          console.error('Error clearing IndexedDB:', error)
        }

        // Redirect to login
        window.location.href = '/login'
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuthStatus: () => {
        const { token } = get()
        
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        // Check if token is still valid
        if (!googleAuthService.isTokenValid(token)) {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            error: 'Session expired. Please log in again.',
          })
          return
        }

        // Token is valid, user remains authenticated
        set({ isAuthenticated: true })
      },

      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
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