import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User } from '../types/auth'
import { localAuthService } from '../services/localAuth'
import { supabaseAuth } from '../services/supabaseAuth'
import { isLocalOnlyMode } from '@/lib/supabase-client'
import { offlineSyncService } from '@/shared/services/OfflineSyncService'
import { ttsService } from '@/modules/ai-chat/services/TextToSpeechService'

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
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  checkAuthStatus: () => Promise<void>
  setUser: (user: User, token: string) => Promise<void>
  forceLogout: () => Promise<void>
  isCheckingAuth: boolean
  lastAuthCheck: number
  retryCount: number
}

const AUTH_CHECK_DEBOUNCE_MS = 500

const emptyAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isCheckingAuth: false,
  lastAuthCheck: 0,
  retryCount: 0,
}

const getLocalSession = () => localAuthService.getCurrentUser()

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...emptyAuthState,

      login: async (credentials) => {
        set({ isLoading: true, error: null })

        try {
          const localSession = await localAuthService.login(credentials)

          set({
            user: localSession.user,
            token: localSession.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            retryCount: 0,
          })
        } catch (localError) {
          if (!isLocalOnlyMode) {
            try {
              const { user, error } = await supabaseAuth.loginWithUsername(
                credentials.username,
                credentials.password
              )

              if (error || !user) {
                throw new Error(error?.message || 'Authentication failed')
              }

              set({
                user,
                token: user.id,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                retryCount: 0,
              })

              void offlineSyncService.fullSync()
              return
            } catch (supabaseError) {
              set({
                ...emptyAuthState,
                error:
                  supabaseError instanceof Error
                    ? supabaseError.message
                    : 'Login failed',
              })
              return
            }
          }

          set({
            ...emptyAuthState,
            error:
              localError instanceof Error
                ? localError.message
                : 'Invalid username or password',
          })
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })

        try {
          if (data.password.length < 6) {
            throw new Error('Password must be at least 6 characters long')
          }

          if (isLocalOnlyMode) {
            await localAuthService.register(data)
          } else {
            const { user, error } = await supabaseAuth.register(
              data.username,
              data.email || `${data.username}@perfectzenkai.local`,
              data.password
            )

            if (error || !user) {
              await localAuthService.register(data)
            }
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            ...emptyAuthState,
            error: error instanceof Error ? error.message : 'Registration failed',
          })
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          if (!isLocalOnlyMode) {
            await supabaseAuth.logout()
          }
        } catch (error) {
          console.warn('Remote logout failed; local session will still close.', error)
        } finally {
          localAuthService.logout()
          offlineSyncService.clearErrors()
          ttsService.clearCache()
          set(emptyAuthState)
        }
      },

      clearError: () => set({ error: null }),

      checkAuthStatus: async () => {
        const state = get()
        const now = Date.now()

        if (
          state.isCheckingAuth ||
          now - state.lastAuthCheck < AUTH_CHECK_DEBOUNCE_MS
        ) {
          return
        }

        set({ isCheckingAuth: true, lastAuthCheck: now })

        const localSession = getLocalSession()
        if (localSession) {
          set({
            user: localSession.user,
            token: localSession.token,
            isAuthenticated: true,
            isCheckingAuth: false,
            retryCount: 0,
            error: null,
          })
          return
        }

        if (isLocalOnlyMode) {
          set(emptyAuthState)
          return
        }

        try {
          const user = await supabaseAuth.getSession()
          set(
            user
              ? {
                  user,
                  token: user.id,
                  isAuthenticated: true,
                  isCheckingAuth: false,
                  retryCount: 0,
                  error: null,
                }
              : emptyAuthState
          )
        } catch {
          set(emptyAuthState)
        }
      },

      setUser: async (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isCheckingAuth: false,
          error: null,
          retryCount: 0,
        })
      },

      forceLogout: async () => {
        localAuthService.logout()
        if (!isLocalOnlyMode) {
          try {
            await supabaseAuth.logout()
          } catch {
            // Local reset is the important part for this control.
          }
        }
        set(emptyAuthState)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }

        state.isAuthenticated = false
        state.isCheckingAuth = false
        state.lastAuthCheck = 0
        state.retryCount = 0

        setTimeout(() => {
          void useAuthStore.getState().checkAuthStatus()
        }, 50)
      },
    }
  )
)

if (!isLocalOnlyMode) {
  supabaseAuth.onAuthStateChange(async (user) => {
    const store = useAuthStore.getState()

    if (store.user?.authProvider === 'local') {
      return
    }

    if (user && !store.isAuthenticated) {
      await store.setUser(user, user.id)
    } else if (!user && store.isAuthenticated) {
      await store.logout()
    }
  })
}
