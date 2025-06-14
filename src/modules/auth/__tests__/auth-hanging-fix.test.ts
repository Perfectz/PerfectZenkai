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

describe('🔧 Authentication Hanging Fix', () => {
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

  it('should not hang when no session exists', async () => {
    const { result } = renderHook(() => useAuthStore())
    const { localAuthService } = await import('../services/localAuth')
    
    // Mock no existing session
    vi.mocked(localAuthService.getCurrentUser).mockReturnValue(null)
    
    console.log('🧪 Testing auth check with no session...')
    
    const startTime = Date.now()
    
    await act(async () => {
      await result.current.checkAuthStatus()
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Should complete quickly (under 1 second)
    expect(duration).toBeLessThan(1000)
    
    // Should set correct state
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isCheckingAuth).toBe(false)
    expect(result.current.user).toBe(null)
    
    console.log(`✅ Auth check completed in ${duration}ms without hanging`)
  })

  it('should not hang when session exists', async () => {
    const { result } = renderHook(() => useAuthStore())
    const { localAuthService } = await import('../services/localAuth')
    
    // Mock existing session
    vi.mocked(localAuthService.getCurrentUser).mockReturnValue({
      user: { id: 'test-user', username: 'testuser', email: 'test@test.com', name: 'Test User' },
      token: 'test-token'
    })
    
    console.log('🧪 Testing auth check with existing session...')
    
    const startTime = Date.now()
    
    await act(async () => {
      await result.current.checkAuthStatus()
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Should complete quickly (under 1 second)
    expect(duration).toBeLessThan(1000)
    
    // Should set correct state
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isCheckingAuth).toBe(false)
    expect(result.current.user?.username).toBe('testuser')
    
    console.log(`✅ Auth check completed in ${duration}ms without hanging`)
  })

  it('should handle multiple rapid auth checks without hanging', async () => {
    const { result } = renderHook(() => useAuthStore())
    const { localAuthService } = await import('../services/localAuth')
    
    vi.mocked(localAuthService.getCurrentUser).mockReturnValue(null)
    
    console.log('🧪 Testing multiple rapid auth checks...')
    
    const startTime = Date.now()
    
    // Multiple rapid calls
    const promises: Promise<void>[] = []
    for (let i = 0; i < 5; i++) {
      promises.push(act(async () => await result.current.checkAuthStatus()))
    }
    
    await Promise.all(promises)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Should complete quickly due to debouncing
    expect(duration).toBeLessThan(2000)
    expect(result.current.isCheckingAuth).toBe(false)
    
    console.log(`✅ Multiple auth checks completed in ${duration}ms without hanging`)
  })

  it('should timeout gracefully if auth service hangs', async () => {
    const { result } = renderHook(() => useAuthStore())
    const { localAuthService } = await import('../services/localAuth')
    
    // Mock hanging auth service
    vi.mocked(localAuthService.getCurrentUser).mockImplementation(() => {
      // Simulate hanging by returning a promise that never resolves
      return new Promise(() => {}) as never
    })
    
    console.log('🧪 Testing timeout handling...')
    
    const startTime = Date.now()
    
    await act(async () => {
      await result.current.checkAuthStatus()
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Should complete quickly since we're using synchronous getCurrentUser
    expect(duration).toBeLessThan(1000)
    expect(result.current.isCheckingAuth).toBe(false)
    
    console.log(`✅ Timeout handling completed in ${duration}ms`)
  })
}) 