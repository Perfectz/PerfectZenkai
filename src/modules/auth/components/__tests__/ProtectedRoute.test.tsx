import React from 'react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
import { useAuthStore } from '../../store/authStore'

// Mock the auth store
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn()
}))

// Mock react-router-dom Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => <div data-testid="navigate-to">{to}</div>)
  }
})

const MockedUseAuthStore = vi.mocked(useAuthStore)

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>

const renderProtectedRoute = () => {
  return render(
    <BrowserRouter>
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    </BrowserRouter>
  )
}

describe('ProtectedRoute - MVP-10 Enhancements', () => {
  const mockCheckAuthStatus = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckAuthStatus.mockClear()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Authentication State Handling', () => {
    it('should render protected content when user is authenticated', async () => {
      MockedUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isCheckingAuth: false,
        checkAuthStatus: mockCheckAuthStatus,
      } as any)

      renderProtectedRoute()

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(mockCheckAuthStatus).toHaveBeenCalledTimes(1)
    })

    it('should redirect to login when user is not authenticated', async () => {
      MockedUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isCheckingAuth: false,
        checkAuthStatus: mockCheckAuthStatus,
      } as any)

      renderProtectedRoute()

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login')
      expect(mockCheckAuthStatus).toHaveBeenCalledTimes(1)
    })

    it('should show loading state during authentication check', async () => {
      MockedUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isCheckingAuth: true,
        checkAuthStatus: mockCheckAuthStatus,
      } as any)

      renderProtectedRoute()

      expect(screen.getByText('Verifying session...')).toBeInTheDocument()
      expect(screen.getByText('Please wait while we verify your authentication status')).toBeInTheDocument()
      expect(mockCheckAuthStatus).toHaveBeenCalledTimes(1)
    })

    it('should show loading state during general loading', async () => {
      MockedUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isCheckingAuth: false,
        checkAuthStatus: mockCheckAuthStatus,
      } as any)

      renderProtectedRoute()

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('Checking your authentication status')).toBeInTheDocument()
      expect(mockCheckAuthStatus).toHaveBeenCalledTimes(1)
    })
  })

  describe('MVP-10: Authentication Loop Prevention', () => {
    it('should only call checkAuthStatus once on mount', async () => {
      MockedUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isCheckingAuth: false,
        checkAuthStatus: mockCheckAuthStatus,
      } as any)

      renderProtectedRoute()

      // Wait for any potential additional calls
      await waitFor(() => {
        expect(mockCheckAuthStatus).toHaveBeenCalledTimes(1)
      })

      // Verify no additional calls after initial mount
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockCheckAuthStatus).toHaveBeenCalledTimes(1)
    })

    it('should not call checkAuthStatus multiple times on re-renders', async () => {
      const { rerender } = render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      MockedUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        isCheckingAuth: false,
        checkAuthStatus: mockCheckAuthStatus,
      } as any)

      // Force re-render
      rerender(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(mockCheckAuthStatus).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle rapid state changes gracefully', async () => {
      let callCount = 0
      const states = [
        { isAuthenticated: false, isLoading: true, isCheckingAuth: false },
        { isAuthenticated: false, isLoading: false, isCheckingAuth: true },
        { isAuthenticated: true, isLoading: false, isCheckingAuth: false },
      ]

      MockedUseAuthStore.mockImplementation(() => {
        const currentState = states[callCount % states.length]
        callCount++
        return {
          ...currentState,
          checkAuthStatus: mockCheckAuthStatus,
        } as any
      })

      const { rerender } = renderProtectedRoute()

      // Simulate rapid state changes
      for (let i = 0; i < 3; i++) {
        rerender(
          <BrowserRouter>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </BrowserRouter>
        )
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Should still only call checkAuthStatus once
      expect(mockCheckAuthStatus).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading State Management', () => {
    it('should prioritize isCheckingAuth over isLoading for loading message', async () => {
      MockedUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        isCheckingAuth: true,
        checkAuthStatus: mockCheckAuthStatus,
      } as any)

      renderProtectedRoute()

      expect(screen.getByText('Verifying session...')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('should show appropriate loading spinner during auth operations', async () => {
      MockedUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isCheckingAuth: true,
        checkAuthStatus: mockCheckAuthStatus,
      } as any)

      renderProtectedRoute()

      const spinner = screen.getByRole('status', { hidden: true })
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })
  })

  describe('Error Recovery', () => {
    it('should handle checkAuthStatus errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      MockedUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isCheckingAuth: false,
        checkAuthStatus: vi.fn().mockRejectedValue(new Error('Auth check failed')),
      } as any)

      expect(() => renderProtectedRoute()).not.toThrow()
      
      consoleErrorSpy.mockRestore()
    })

    it('should maintain stable behavior during auth service failures', async () => {
      MockedUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        isCheckingAuth: false,
        checkAuthStatus: vi.fn().mockImplementation(() => {
          throw new Error('Service unavailable')
        }),
      } as any)

      renderProtectedRoute()

      // Should still redirect to login despite error
      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login')
    })
  })
}) 