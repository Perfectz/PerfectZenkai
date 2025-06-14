/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SupabaseAuthService } from '../services/supabaseAuth'

// Mock the supabase import at the top level for proper hoisting
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
    })),
  },
}))

describe('SupabaseAuthService', () => {
  let authService: SupabaseAuthService
  
  // Test user accounts
  const testUser1 = {
    username: 'testuser1',
    email: 'testuser1@perfectzenkai.test',
    password: 'TestPassword123!',
    id: 'test-user-1-id',
  }
  
  const testUser2 = {
    username: 'testuser2', 
    email: 'testuser2@perfectzenkai.test',
    password: 'TestPassword456!',
    id: 'test-user-2-id',
  }

  beforeEach(async () => {
    authService = new SupabaseAuthService()
    vi.clearAllMocks()
    
    // Get the mocked supabase client
    const { supabase } = await import('@/lib/supabase')
    
    // Reset all mocks to ensure clean state
    vi.mocked(supabase!.auth.signUp).mockReset()
    vi.mocked(supabase!.auth.signInWithPassword).mockReset()
    vi.mocked(supabase!.auth.getUser).mockReset()
    vi.mocked(supabase!.auth.signOut).mockReset()
    vi.mocked(supabase!.from).mockReset()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('User Registration', () => {
    it('should successfully register test user 1', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      // Mock successful username check (no existing user)
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ 
        select: mockSelect,
        insert: vi.fn(),
      })
      
      vi.mocked(supabase!.from).mockImplementation(mockFrom)

      // Mock successful auth registration
      vi.mocked(supabase!.auth.signUp).mockResolvedValue({
        data: {
          user: {
            id: testUser1.id,
            email: testUser1.email,
            user_metadata: { username: testUser1.username },
          },
        },
        error: null,
      } as any)

      const result = await authService.register(
        testUser1.username,
        testUser1.email,
        testUser1.password
      )

      expect(result.error).toBeNull()
      expect(result.user).toEqual({
        id: testUser1.id,
        name: testUser1.username,
        email: testUser1.email,
      })
      expect(supabase!.auth.signUp).toHaveBeenCalledWith({
        email: testUser1.email,
        password: testUser1.password,
        options: {
          data: { username: testUser1.username },
          emailRedirectTo: undefined,
        },
      })
    })

    it('should successfully register test user 2', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      // Mock successful username check (no existing user)
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ 
        select: mockSelect,
        insert: vi.fn(),
      })
      
      vi.mocked(supabase!.from).mockImplementation(mockFrom)

      // Mock successful auth registration
      vi.mocked(supabase!.auth.signUp).mockResolvedValue({
        data: {
          user: {
            id: testUser2.id,
            email: testUser2.email,
            user_metadata: { username: testUser2.username },
          },
        },
        error: null,
      } as any)

      const result = await authService.register(
        testUser2.username,
        testUser2.email,
        testUser2.password
      )

      expect(result.error).toBeNull()
      expect(result.user).toEqual({
        id: testUser2.id,
        name: testUser2.username,
        email: testUser2.email,
      })
    })

    it('should fail registration when username is already taken', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      // Mock existing username
      const mockSingle = vi.fn().mockResolvedValue({
        data: { username: testUser1.username },
        error: null,
      })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ 
        select: mockSelect,
        insert: vi.fn(),
      })
      
      vi.mocked(supabase!.from).mockImplementation(mockFrom)

      const result = await authService.register(
        testUser1.username,
        'different@email.com',
        'password123'
      )

      expect(result.user).toBeNull()
      expect(result.error).toEqual({
        code: 'USERNAME_TAKEN',
        message: 'Username already taken',
      })
    })

    it('should fail registration with weak password', async () => {
      // Mock username check (no existing user)
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
        insert: vi.fn(),
      }))
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase!.from).mockImplementation(mockFrom)

      // Mock auth error for weak password
      vi.mocked(supabase!.auth.signUp).mockResolvedValue({
        data: { user: null },
        error: { message: 'Password is too weak' },
      } as any)

      const result = await authService.register(
        'newuser',
        'newuser@test.com',
        '123' // weak password
      )

      expect(result.user).toBeNull()
      expect(result.error).toEqual({
        code: 'SIGNUP_ERROR',
        message: 'Password is too weak',
      })
    })
  })

  describe('User Login', () => {
    it('should successfully login test user 1 with email', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      // Mock successful profile fetch
      const mockSingle = vi.fn().mockResolvedValue({
        data: { username: testUser1.username },
        error: null,
      })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ 
        select: mockSelect,
        insert: vi.fn(),
      })
      
      vi.mocked(supabase!.from).mockImplementation(mockFrom)

      // Mock successful auth login
      vi.mocked(supabase!.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: {
            id: testUser1.id,
            email: testUser1.email,
            user_metadata: { username: testUser1.username },
          },
        },
        error: null,
      } as any)

      const result = await authService.login(testUser1.email, testUser1.password)

      expect(result.error).toBeNull()
      expect(result.user).toEqual({
        id: testUser1.id,
        name: testUser1.username,
        email: testUser1.email,
      })
      expect(supabase!.auth.signInWithPassword).toHaveBeenCalledWith({
        email: testUser1.email,
        password: testUser1.password,
      })
    })

    it('should successfully login test user 2 with email', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      // Mock successful profile fetch
      const mockSingle = vi.fn().mockResolvedValue({
        data: { username: testUser2.username },
        error: null,
      })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ 
        select: mockSelect,
        insert: vi.fn(),
      })
      
      vi.mocked(supabase!.from).mockImplementation(mockFrom)

      // Mock successful auth login
      vi.mocked(supabase!.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: {
            id: testUser2.id,
            email: testUser2.email,
            user_metadata: { username: testUser2.username },
          },
        },
        error: null,
      } as any)

      const result = await authService.login(testUser2.email, testUser2.password)

      expect(result.error).toBeNull()
      expect(result.user).toEqual({
        id: testUser2.id,
        name: testUser2.username,
        email: testUser2.email,
      })
    })

    it('should fail login with invalid credentials', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      // Mock auth error for invalid credentials
      vi.mocked(supabase!.auth.signInWithPassword).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      } as any)

      const result = await authService.login('wrong@email.com', 'wrongpassword')

      expect(result.user).toBeNull()
      expect(result.error).toEqual({
        code: 'LOGIN_ERROR',
        message: 'Invalid login credentials',
      })
    })
  })

  describe('Username Login', () => {
    it('should successfully login test user 1 with username', async () => {
      // Mock user lookup
      const mockUserLookup = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: testUser1.id,
                username: testUser1.username,
                email: testUser1.email,
              },
              error: null,
            }),
          })),
        })),
        insert: vi.fn(),
      }))
      
      // Mock profile lookup for login
      const mockProfileLookup = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { username: testUser1.username },
              error: null,
            }),
          })),
        })),
        insert: vi.fn(),
      }))

      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase!.from)
        .mockImplementationOnce(mockUserLookup) // First call for user lookup
        .mockImplementationOnce(mockProfileLookup) // Second call for profile lookup

      // Mock successful auth login
      vi.mocked(supabase!.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: {
            id: testUser1.id,
            email: testUser1.email,
            user_metadata: { username: testUser1.username },
          },
        },
        error: null,
      })

      const result = await authService.loginWithUsername(
        testUser1.username,
        testUser1.password
      )

      expect(result.error).toBeNull()
      expect(result.user).toEqual({
        id: testUser1.id,
        name: testUser1.username,
        email: testUser1.email,
      })
    })

    it('should fail username login when user not found', async () => {
      // Mock user lookup failure
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'No rows returned' },
            }),
          })),
        })),
        insert: vi.fn(),
      }))
      
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase!.from).mockImplementation(mockFrom)

      const result = await authService.loginWithUsername(
        'nonexistentuser',
        'password123'
      )

      expect(result.user).toBeNull()
      expect(result.error).toEqual({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      })
    })
  })

  describe('Session Management', () => {
    it('should get current user when session exists', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      // Mock current user session
      vi.mocked(supabase!.auth.getUser).mockResolvedValue({
        data: {
          user: {
            id: testUser1.id,
            email: testUser1.email,
            user_metadata: { username: testUser1.username },
          },
        },
        error: null,
      } as any)

      // Mock profile fetch
      const mockSingle = vi.fn().mockResolvedValue({
        data: { username: testUser1.username },
        error: null,
      })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ 
        select: mockSelect,
        insert: vi.fn(),
      })
      
      vi.mocked(supabase!.from).mockImplementation(mockFrom)

      const user = await authService.getCurrentUser()

      expect(user).toEqual({
        id: testUser1.id,
        name: testUser1.username,
        email: testUser1.email,
      })
    })

    it('should return null when no session exists', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      vi.mocked(supabase!.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      const user = await authService.getCurrentUser()

      expect(user).toBeNull()
    })

    it('should successfully logout', async () => {
      const { supabase } = await import('@/lib/supabase')
      
      vi.mocked(supabase!.auth.signOut).mockResolvedValue({ error: null } as any)

      await expect(authService.logout()).resolves.not.toThrow()
      expect(supabase!.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('Service Availability', () => {
    it('should handle service unavailable gracefully', async () => {
      // Create a service instance that simulates unavailable Supabase
      const unavailableService = new SupabaseAuthService()
      
      // Mock isSupabaseAvailable to return false
      vi.spyOn(unavailableService as any, 'isSupabaseAvailable').mockReturnValue(false)

      const registerResult = await unavailableService.register('test', 'test@test.com', 'password')
      expect(registerResult.user).toBeNull()
      expect(registerResult.error).toEqual({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Authentication service is not available',
      })

      const loginResult = await unavailableService.login('test@test.com', 'password')
      expect(loginResult.user).toBeNull()
      expect(loginResult.error).toEqual({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Authentication service is not available',
      })

      const currentUser = await unavailableService.getCurrentUser()
      expect(currentUser).toBeNull()
    })
  })
}) 