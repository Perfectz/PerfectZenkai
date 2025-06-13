import { describe, it, expect, beforeEach, afterEach, vi, type SpyInstance } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnline } from './useOnline'

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

describe('useOnline', () => {
  let addEventListenerSpy: SpyInstance
  let removeEventListenerSpy: SpyInstance

  beforeEach(() => {
    // Reset navigator.onLine to true before each test
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })

    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial online state', () => {
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(true)
  })

  it('should return false when navigator.onLine is false initially', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(false)
  })

  it('should add event listeners on mount', () => {
    renderHook(() => useOnline())

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('should update state when going offline', () => {
    const { result } = renderHook(() => useOnline())
    
    expect(result.current).toBe(true)

    // Simulate offline event
    act(() => {
      const offlineEvent = new Event('offline')
      window.dispatchEvent(offlineEvent)
    })

    expect(result.current).toBe(false)
  })

  it('should update state when going online', () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(false)

    // Simulate online event
    act(() => {
      const onlineEvent = new Event('online')
      window.dispatchEvent(onlineEvent)
    })

    expect(result.current).toBe(true)
  })

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOnline())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('should handle multiple online/offline transitions', () => {
    const { result } = renderHook(() => useOnline())
    
    expect(result.current).toBe(true)

    // Go offline
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(false)

    // Go online
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current).toBe(true)

    // Go offline again
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(false)
  })
}) 