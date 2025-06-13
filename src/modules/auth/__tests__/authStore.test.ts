import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../store/authStore'
import { googleAuthService } from '../services/googleAuth'

// Mock the Google Auth Service
vi.mock('../services/googleAuth', () => ({
  googleAuthService: {
    login: vi.fn(),
    handleCallback: vi.fn(),
    decodeToken: vi.fn(),
    revokeToken: vi.fn(),
    isTokenValid: vi.fn(),
  },
}))

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
})

// Mock confirm dialog
global.confirm = vi.fn(() => true)

// Mock IndexedDB
global.indexedDB = {
  databases: vi.fn(() => Promise.resolve([])),
  deleteDatabase: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
  })),
} as any

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
    })
    
    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()
      
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.token).toBeNull()
    })
  })

  describe('Login', () => {
    it('should set loading state and call Google auth service', () => {
      const { login } = useAuthStore.getState()
      
      login()
      
      const state = useAuthStore.getState()
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
      expect(googleAuthService.login).toHaveBeenCalled()
    })

    it('should handle login errors', () => {
      const mockError = new Error('Login failed')
      vi.mocked(googleAuthService.login).mockImplementation(() => {
        throw mockError
      })
      
      const { login } = useAuthStore.getState()
      login()
      
      const state = useAuthStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Login failed')
    })
  })

  describe('Handle Callback', () => {
    const mockTokens = {
      access_token: 'access_token',
      id_token: 'id_token',
      scope: 'openid email profile',
      token_type: 'Bearer',
      expires_in: 3600,
    }

    const mockDecodedToken = {
      sub: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      given_name: 'Test',
      family_name: 'User',
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600,
      aud: 'client_id',
      iss: 'https://accounts.google.com',
    }

    it('should handle successful callback', async () => {
      vi.mocked(googleAuthService.handleCallback).mockResolvedValue(mockTokens)
      vi.mocked(googleAuthService.decodeToken).mockReturnValue(mockDecodedToken)
      
      const { handleCallback } = useAuthStore.getState()
      await handleCallback('auth_code')
      
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
        given_name: 'Test',
        family_name: 'User',
      })
      expect(state.token).toBe('id_token')
      expect(window.location.href).toBe('/dashboard')
    })

    it('should handle callback errors', async () => {
      const mockError = new Error('Callback failed')
      vi.mocked(googleAuthService.handleCallback).mockRejectedValue(mockError)
      
      const { handleCallback } = useAuthStore.getState()
      await handleCallback('invalid_code')
      
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Callback failed')
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
    })
  })

  describe('Logout', () => {
    beforeEach(() => {
      // Set authenticated state
      useAuthStore.setState({
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
        isAuthenticated: true,
        token: 'valid_token',
      })
    })

    it('should handle successful logout', async () => {
      vi.mocked(googleAuthService.revokeToken).mockResolvedValue()
      
      const { logout } = useAuthStore.getState()
      await logout()
      
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.token).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(googleAuthService.revokeToken).toHaveBeenCalledWith('valid_token')
      expect(window.location.href).toBe('/login')
    })

    it('should handle logout even if token revocation fails', async () => {
      vi.mocked(googleAuthService.revokeToken).mockRejectedValue(new Error('Revocation failed'))
      
      const { logout } = useAuthStore.getState()
      await logout()
      
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.token).toBeNull()
      expect(window.location.href).toBe('/login')
    })
  })

  describe('Check Auth Status', () => {
    it('should set unauthenticated if no token', () => {
      const { checkAuthStatus } = useAuthStore.getState()
      checkAuthStatus()
      
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
    })

    it('should set unauthenticated if token is invalid', () => {
      useAuthStore.setState({ token: 'invalid_token' })
      vi.mocked(googleAuthService.isTokenValid).mockReturnValue(false)
      
      const { checkAuthStatus } = useAuthStore.getState()
      checkAuthStatus()
      
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.error).toBe('Session expired. Please log in again.')
    })

    it('should remain authenticated if token is valid', () => {
      useAuthStore.setState({ token: 'valid_token' })
      vi.mocked(googleAuthService.isTokenValid).mockReturnValue(true)
      
      const { checkAuthStatus } = useAuthStore.getState()
      checkAuthStatus()
      
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
    })
  })

  describe('Clear Error', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' })
      
      const { clearError } = useAuthStore.getState()
      clearError()
      
      const state = useAuthStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('Set User', () => {
    it('should set user and authentication state', () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      }
      const mockToken = 'valid_token'
      
      const { setUser } = useAuthStore.getState()
      setUser(mockUser, mockToken)
      
      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })
}) 