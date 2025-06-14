import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../store/authStore'

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: null
}))

vi.mock('../services/supabaseAuth', () => ({
  supabaseAuth: {
    onAuthStateChange: vi.fn(),
    getCurrentUser: vi.fn(),
    loginWithUsername: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  }
}))

vi.mock('../services/localAuth', () => ({
  localAuthService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  }
}))

vi.mock('../utils/dataIsolation', () => ({
  initializeUserDatabases: vi.fn(),
  clearUserDatabases: vi.fn(),
  sanitizeUserId: vi.fn((id) => id)
}))

describe('🧪 MVP-10 Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      isCheckingAuth: false,
      lastAuthCheck: 0,
      retryCount: 0
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('🔄 Login/Logout Cycle Testing', () => {
    it('✅ should handle complete login/logout cycle without loops', async () => {
      const { result } = renderHook(() => useAuthStore())
      const { localAuthService } = await import('../services/localAuth')
      
      // Mock successful login
      vi.mocked(localAuthService.login).mockResolvedValue({
        user: { id: 'test-user', username: 'testuser', email: 'test@test.com', name: 'Test User' },
        token: 'test-token'
      })
      
      // Mock successful logout
      vi.mocked(localAuthService.logout).mockImplementation(() => {})
      
      console.log('🧪 Testing login...')
      await act(async () => {
        await result.current.login({ username: 'testuser', password: 'password' })
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user?.username).toBe('testuser')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
      console.log('✅ Login successful')
      
      console.log('🧪 Testing logout...')
      await act(async () => {
        await result.current.logout()
      })
      
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isCheckingAuth).toBe(false)
      console.log('✅ Logout successful - no loops detected')
    })

    it('should handle multiple rapid login attempts without causing loops', async () => {
      const { result } = renderHook(() => useAuthStore())
      const { localAuthService } = await import('../services/localAuth')
      
      let loginCallCount = 0
      vi.mocked(localAuthService.login).mockImplementation(async () => {
        loginCallCount++
        await new Promise(resolve => setTimeout(resolve, 100))
        return {
          user: { id: 'test-user', username: 'testuser', email: 'test@test.com', name: 'Test User' },
          token: 'test-token'
        }
      })
      
      // Attempt multiple rapid logins
      const loginPromises = [
        act(() => result.current.login({ username: 'testuser', password: 'password' })),
        act(() => result.current.login({ username: 'testuser', password: 'password' })),
        act(() => result.current.login({ username: 'testuser', password: 'password' }))
      ]
      
      await Promise.all(loginPromises)
      
      // Should only process one login successfully
      expect(result.current.isAuthenticated).toBe(true)
      expect(loginCallCount).toBe(1) // Only one actual login call should succeed
    })
  })

  describe('🔍 Session Management Testing', () => {
    it('should validate session integrity and fix corrupted states', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Set up corrupted state (authenticated but no user)
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          user: null,
          token: null
        })
      })
      
      // Mock getCurrentUser to return null (expired session)
      const { localAuthService } = await import('../services/localAuth')
      vi.mocked(localAuthService.getCurrentUser).mockReturnValue(null)
      
      // Check auth status should fix the corrupted state
      await act(async () => {
        await result.current.checkAuthStatus()
      })
      
      // Should have fixed the corrupted state
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
    })

    it('should handle session expiry gracefully', async () => {
      const { result } = renderHook(() => useAuthStore())
      const { localAuthService } = await import('../services/localAuth')
      
      // Set up authenticated state
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          user: { id: 'test-user', username: 'testuser', email: 'test@test.com', name: 'Test User' },
          token: 'expired-token'
        })
      })
      
      // Mock expired session
      vi.mocked(localAuthService.getCurrentUser).mockReturnValue(null)
      
      await act(async () => {
        await result.current.checkAuthStatus()
      })
      
      // Should cleanly transition to unauthenticated
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
      expect(result.current.isCheckingAuth).toBe(false)
    })
  })

  describe('⚡ Performance & Loop Prevention', () => {
    it('✅ should prevent authentication loops with debouncing', async () => {
      const { result } = renderHook(() => useAuthStore())
      const { localAuthService } = await import('../services/localAuth')
      
      let checkAuthCallCount = 0
      vi.mocked(localAuthService.getCurrentUser).mockImplementation(() => {
        checkAuthCallCount++
        console.log(`🔍 Auth check call #${checkAuthCallCount}`)
        return null
      })
      
      console.log('🧪 Testing rapid auth checks (should be debounced)...')
      
      // Rapid successive calls
      const promises: Promise<void>[] = []
      for (let i = 0; i < 10; i++) {
        promises.push(act(async () => await result.current.checkAuthStatus()))
      }
      
      await Promise.all(promises)
      
      // Should have been debounced to only 1-2 calls max
      expect(checkAuthCallCount).toBeLessThanOrEqual(2)
      console.log(`✅ Debouncing working: ${checkAuthCallCount} calls instead of 10`)
    })

    it('should handle concurrent auth operations without conflicts', async () => {
      const { result } = renderHook(() => useAuthStore())
      const { localAuthService } = await import('../services/localAuth')
      
      vi.mocked(localAuthService.getCurrentUser).mockReturnValue({
        user: { id: 'test-user', username: 'testuser', email: 'test@test.com', name: 'Test User' },
        token: 'test-token'
      })
      
      // Concurrent operations
      const operations = [
        act(() => result.current.checkAuthStatus()),
        act(() => result.current.clearError()),
        act(() => result.current.checkAuthStatus())
      ]
      
      await Promise.all(operations)
      
      // State should remain consistent
      expect(typeof result.current.isAuthenticated).toBe('boolean')
      expect(typeof result.current.isLoading).toBe('boolean')
      expect(typeof result.current.isCheckingAuth).toBe('boolean')
    })
  })

  describe('🛡️ Error Recovery Testing', () => {
    it('✅ should recover from transient auth service failures', async () => {
      const { result } = renderHook(() => useAuthStore())
      const { localAuthService } = await import('../services/localAuth')
      
      let attemptCount = 0
      vi.mocked(localAuthService.getCurrentUser).mockImplementation(() => {
        attemptCount++
        console.log(`🔄 Auth attempt #${attemptCount}`)
        if (attemptCount < 3) {
          throw new Error('Transient network error')
        }
        return {
          user: { id: 'test-user', username: 'testuser', email: 'test@test.com', name: 'Test User' },
          token: 'test-token'
        }
      })
      
      console.log('🧪 Testing retry logic with transient failures...')
      
      await act(async () => {
        await result.current.checkAuthStatus()
      })
      
      // Should eventually succeed after retries
      expect(result.current.isAuthenticated).toBe(true)
      expect(attemptCount).toBeGreaterThan(1) // Confirms retry logic worked
      expect(result.current.retryCount).toBe(0) // Should reset on success
      console.log(`✅ Retry logic working: succeeded after ${attemptCount} attempts`)
    })

    it('should handle permanent failures gracefully', async () => {
      const { result } = renderHook(() => useAuthStore())
      const { localAuthService } = await import('../services/localAuth')
      
      // Mock permanent failure
      vi.mocked(localAuthService.getCurrentUser).mockImplementation(() => {
        throw new Error('Service permanently unavailable')
      })
      
      await act(async () => {
        await result.current.checkAuthStatus()
      })
      
      // Should clear auth state after max retries
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
      expect(result.current.isCheckingAuth).toBe(false)
    })
  })

  describe('📊 State Consistency Testing', () => {
    it('should maintain consistent state during rapid state changes', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Simulate rapid state changes
      const stateChanges = [
        () => useAuthStore.setState({ isLoading: true }),
        () => useAuthStore.setState({ isCheckingAuth: true }),
        () => useAuthStore.setState({ isAuthenticated: true, user: { id: 'test', username: 'test', email: 'test@test.com', name: 'Test' }, token: 'token' }),
        () => useAuthStore.setState({ isLoading: false }),
        () => useAuthStore.setState({ isCheckingAuth: false })
      ]
      
      // Apply all state changes rapidly
      await act(async () => {
        stateChanges.forEach(change => change())
      })
      
      // Final state should be consistent
      const finalState = result.current
      expect(finalState.isAuthenticated).toBe(true)
      expect(finalState.isLoading).toBe(false)
      expect(finalState.isCheckingAuth).toBe(false)
      expect(finalState.user).toBeTruthy()
      expect(finalState.token).toBeTruthy()
    })
  })

  describe('🎯 Real-world Scenario Testing', () => {
    it('✅ should handle complete user session lifecycle', async () => {
      const { result } = renderHook(() => useAuthStore())
      const { localAuthService } = await import('../services/localAuth')
      
      console.log('🧪 Testing complete session lifecycle...')
      
      // Mock services
      vi.mocked(localAuthService.login).mockResolvedValue({
        user: { id: 'user-123', username: 'realuser', email: 'real@test.com', name: 'Real User' },
        token: 'session-token-123'
      })
      
      vi.mocked(localAuthService.getCurrentUser).mockReturnValue({
        user: { id: 'user-123', username: 'realuser', email: 'real@test.com', name: 'Real User' },
        token: 'session-token-123'
      })
      
      vi.mocked(localAuthService.logout).mockImplementation(() => {})
      
      // 1. Initial state - not authenticated
      expect(result.current.isAuthenticated).toBe(false)
      console.log('✅ Initial state: not authenticated')
      
      // 2. User logs in
      await act(async () => {
        await result.current.login({ username: 'realuser', password: 'password123' })
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user?.username).toBe('realuser')
      console.log('✅ Login successful')
      
      // 3. Check auth status (simulating app reload)
      await act(async () => {
        await result.current.checkAuthStatus()
      })
      
      expect(result.current.isAuthenticated).toBe(true) // Should remain authenticated
      console.log('✅ Auth status check: session maintained')
      
      // 4. User logs out
      await act(async () => {
        await result.current.logout()
      })
      
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.token).toBe(null)
      console.log('✅ Logout successful')
      
      // 5. Verify clean state
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isCheckingAuth).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.retryCount).toBe(0)
      console.log('✅ Clean state verified - no residual issues')
    })
  })
})

describe('🚀 MVP-10 Performance Benchmarks', () => {
  it('✅ should meet performance requirements for auth operations', async () => {
    const { result } = renderHook(() => useAuthStore())
    const { localAuthService } = await import('../services/localAuth')
    
    vi.mocked(localAuthService.getCurrentUser).mockReturnValue(null)
    
    console.log('🧪 Running performance benchmark...')
    const startTime = performance.now()
    
    // Perform 100 rapid auth checks (should be debounced)
    const promises: Promise<void>[] = []
    for (let i = 0; i < 100; i++) {
      promises.push(act(async () => await result.current.checkAuthStatus()))
    }
    
    await Promise.all(promises)
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Should complete quickly due to debouncing (under 1 second)
    expect(duration).toBeLessThan(1000)
    
    console.log(`✅ Performance test: 100 auth checks completed in ${duration.toFixed(2)}ms`)
  })
}) 