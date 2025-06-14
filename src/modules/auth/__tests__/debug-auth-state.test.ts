// src/modules/auth/__tests__/debug-auth-state.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuthStore } from '../store/authStore'
import { localAuthService } from '../services/localAuth'

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

vi.mock('../utils/dataIsolation', () => ({
  initializeUserDatabases: vi.fn(),
  clearUserDatabases: vi.fn(),
  sanitizeUserId: vi.fn((id) => id)
}))

describe('🔍 Debug Authentication State', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show current localStorage state', () => {
    console.log('🔍 Current localStorage contents:')
    
    // Check for auth-related keys
    const authKeys = [
      'auth-storage',
      'zenkai_users', 
      'zenkai_current_user'
    ]
    
    authKeys.forEach(key => {
      const value = localStorage.getItem(key)
      console.log(`  ${key}:`, value ? JSON.parse(value) : null)
    })
  })

  it('should show current auth store state', () => {
    const { result } = renderHook(() => useAuthStore())
    
    console.log('🔍 Current auth store state:')
    console.log('  isAuthenticated:', result.current.isAuthenticated)
    console.log('  isLoading:', result.current.isLoading)
    console.log('  isCheckingAuth:', result.current.isCheckingAuth)
    console.log('  user:', result.current.user)
    console.log('  token:', result.current.token)
    console.log('  error:', result.current.error)
    console.log('  lastAuthCheck:', result.current.lastAuthCheck)
    console.log('  retryCount:', result.current.retryCount)
  })

  it('should check localAuthService directly', () => {
    console.log('🔍 Direct localAuthService check:')
    
    try {
      const session = localAuthService.getCurrentUser()
      console.log('  getCurrentUser result:', session)
      
      if (session) {
        console.log('  User ID:', session.user.id)
        console.log('  Username:', session.user.username)
        console.log('  Token:', session.token)
      } else {
        console.log('  No session found')
      }
    } catch (error) {
      console.log('  Error:', error)
    }
  })

  it('should test auth check timing', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    console.log('🔍 Testing auth check timing...')
    
    const startTime = Date.now()
    
    try {
      await result.current.checkAuthStatus()
      const endTime = Date.now()
      const duration = endTime - startTime
      
      console.log(`  Auth check completed in ${duration}ms`)
      console.log('  Final state:')
      console.log('    isAuthenticated:', result.current.isAuthenticated)
      console.log('    isCheckingAuth:', result.current.isCheckingAuth)
      console.log('    user:', result.current.user?.username || 'none')
      
      expect(duration).toBeLessThan(5000) // Should not take more than 5 seconds
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      console.log(`  Auth check failed after ${duration}ms:`, error)
      throw error
    }
  })
}) 