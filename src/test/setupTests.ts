import { expect, vi, beforeEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Setup test environment variables
if (!import.meta.env.VITE_SUPABASE_URL) {
  Object.defineProperty(import.meta.env, 'VITE_SUPABASE_URL', {
    value: 'https://test.supabase.co',
    writable: true,
  })
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  Object.defineProperty(import.meta.env, 'VITE_SUPABASE_ANON_KEY', {
    value: 'test_anon_key_1234567890abcdef',
    writable: true,
  })
}

// Global test setup
beforeEach(() => {
  // Clear any mocks between tests
  vi.clearAllMocks()
})

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver for components that use it
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) 