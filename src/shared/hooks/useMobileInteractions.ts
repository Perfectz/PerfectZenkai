import { useEffect, useRef, useState } from 'react'

export interface TouchFeedbackOptions {
  haptic?: boolean
  scale?: number
  duration?: number
  disabled?: boolean
}

export interface SwipeGestureOptions {
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

/**
 * Hook for enhanced mobile touch interactions
 */
export function useMobileInteractions() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobile = window.matchMedia('(max-width: 768px)').matches
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsMobile(mobile)
      setIsTouch(touch)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile, isTouch }
}

/**
 * Hook for touch feedback on interactive elements
 */
export function useTouchFeedback<T extends HTMLElement = HTMLElement>(options: TouchFeedbackOptions = {}) {
  const {
    haptic = true,
    scale = 0.98,
    duration = 100,
    disabled = false
  } = options

  const elementRef = useRef<T>(null)
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element || disabled) return

    const handleTouchStart = () => {
      setIsPressed(true)
      
      // Haptic feedback (if supported)
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }

      // Scale animation
      element.style.transform = `scale(${scale})`
      element.style.transition = `transform ${duration}ms ease`
    }

    const handleTouchEnd = () => {
      setIsPressed(false)
      element.style.transform = 'scale(1)'
      
      // Reset after animation
      setTimeout(() => {
        element.style.transition = ''
      }, duration)
    }

    const handleTouchCancel = () => {
      setIsPressed(false)
      element.style.transform = 'scale(1)'
      element.style.transition = ''
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    // Also handle mouse events for desktop testing
    element.addEventListener('mousedown', handleTouchStart)
    element.addEventListener('mouseup', handleTouchEnd)
    element.addEventListener('mouseleave', handleTouchCancel)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
      element.removeEventListener('mousedown', handleTouchStart)
      element.removeEventListener('mouseup', handleTouchEnd)
      element.removeEventListener('mouseleave', handleTouchCancel)
    }
  }, [scale, duration, haptic, disabled])

  return { elementRef, isPressed }
}

/**
 * Hook for swipe gesture detection
 */
export function useSwipeGesture(options: SwipeGestureOptions = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Determine swipe direction
      if (Math.max(absDeltaX, absDeltaY) > threshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.()
          } else {
            onSwipeUp?.()
          }
        }
      }

      touchStartRef.current = null
    }

    const handleTouchCancel = () => {
      touchStartRef.current = null
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return { elementRef }
}

/**
 * Hook for responsive breakpoint detection
 */
export function useResponsiveBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isGalaxyS24Ultra, setIsGalaxyS24Ultra] = useState(false)

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width <= 412) {
        setBreakpoint('mobile')
        setIsGalaxyS24Ultra(true)
      } else if (width <= 768) {
        setBreakpoint('mobile')
        setIsGalaxyS24Ultra(false)
      } else if (width <= 1024) {
        setBreakpoint('tablet')
        setIsGalaxyS24Ultra(false)
      } else {
        setBreakpoint('desktop')
        setIsGalaxyS24Ultra(false)
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return { 
    breakpoint, 
    isGalaxyS24Ultra,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  }
}

/**
 * Hook for safe area insets (notch support)
 */
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  useEffect(() => {
    const updateInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      
      setInsets({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0')
      })
    }

    updateInsets()
    window.addEventListener('resize', updateInsets)
    window.addEventListener('orientationchange', updateInsets)
    
    return () => {
      window.removeEventListener('resize', updateInsets)
      window.removeEventListener('orientationchange', updateInsets)
    }
  }, [])

  return insets
} 