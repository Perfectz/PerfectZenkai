import { useState, useEffect, useCallback } from 'react'

interface AccessibilityPreferences {
  highContrast: boolean
  reducedMotion: boolean
  screenReaderEnabled: boolean
  largeText: boolean
  preferredColorScheme: 'light' | 'dark' | 'auto'
}

interface AccessibilityAnnouncement {
  message: string
  priority: 'polite' | 'assertive'
  timestamp: number
}

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    highContrast: false,
    reducedMotion: false,
    screenReaderEnabled: false,
    largeText: false,
    preferredColorScheme: 'auto'
  })

  const [announcements, setAnnouncements] = useState<AccessibilityAnnouncement[]>([])

  // Detect user accessibility preferences
  useEffect(() => {
    const detectPreferences = () => {
      if (typeof window === 'undefined') return

      setPreferences(prev => ({
        ...prev,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        largeText: window.matchMedia('(prefers-reduced-data: reduce)').matches,
        preferredColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }))
    }

    detectPreferences()

    // Listen for preference changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)')
    ]

    mediaQueries.forEach(mq => mq.addEventListener('change', detectPreferences))

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', detectPreferences))
    }
  }, [])

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('accessibility-preferences')
      if (saved) {
        const savedPrefs = JSON.parse(saved) as Partial<AccessibilityPreferences>
        setPreferences(prev => ({ ...prev, ...savedPrefs }))
      }
    } catch (error) {
      console.warn('Failed to load accessibility preferences:', error)
    }
  }, [])

  // Save preferences when they change
  const updatePreferences = useCallback((updates: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, ...updates }
      try {
        localStorage.setItem('accessibility-preferences', JSON.stringify(newPrefs))
      } catch (error) {
        console.warn('Failed to save accessibility preferences:', error)
      }
      return newPrefs
    })
  }, [])

  // Screen reader announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement: AccessibilityAnnouncement = {
      message,
      priority,
      timestamp: Date.now()
    }

    setAnnouncements(prev => {
      const newAnnouncements = [...prev, announcement]
      // Keep only last 10 announcements
      return newAnnouncements.slice(-10)
    })

    // Also dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('accessibility-announce', {
      detail: { message, priority }
    }))
  }, [])

  // Enhanced keyboard navigation
  const handleKeyboardNavigation = useCallback((element: HTMLElement, options?: {
    trapFocus?: boolean
    autoFocus?: boolean
    skipLinks?: boolean
  }) => {
    const { trapFocus = false, autoFocus = false, skipLinks = false } = options || {}

    if (autoFocus) {
      element.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip links (Accessibility shortcut)
      if (skipLinks && e.key === 'Tab' && e.shiftKey && e.ctrlKey) {
        e.preventDefault()
        const mainContent = document.querySelector('main, [role="main"]') as HTMLElement
        if (mainContent) {
          mainContent.focus()
          announce('Skipped to main content', 'polite')
        }
      }

      // Focus trap
      if (trapFocus && e.key === 'Tab') {
        const focusableElements = element.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>

        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    element.addEventListener('keydown', handleKeyDown)
    return () => element.removeEventListener('keydown', handleKeyDown)
  }, [announce])

  // Get CSS classes for accessibility preferences
  const getAccessibilityClasses = useCallback(() => {
    const classes: string[] = []

    if (preferences.highContrast) {
      classes.push('high-contrast')
    }

    if (preferences.reducedMotion) {
      classes.push('reduced-motion')
    }

    if (preferences.largeText) {
      classes.push('large-text')
    }

    if (preferences.screenReaderEnabled) {
      classes.push('screen-reader-enabled')
    }

    return classes.join(' ')
  }, [preferences])

  // Enhanced focus management
  const manageFocus = useCallback((action: 'save' | 'restore' | 'clear') => {
    const FOCUS_KEY = 'accessibility-focus-history'

    switch (action) {
      case 'save':
        if (document.activeElement && document.activeElement !== document.body) {
          const element = document.activeElement as HTMLElement
          const selector = element.tagName.toLowerCase() + 
            (element.id ? `#${element.id}` : '') +
            (element.className ? `.${element.className.split(' ').join('.')}` : '')
          sessionStorage.setItem(FOCUS_KEY, selector)
        }
        break

      case 'restore':
        try {
          const selector = sessionStorage.getItem(FOCUS_KEY)
          if (selector) {
            const element = document.querySelector(selector) as HTMLElement
            if (element) {
              element.focus()
              announce('Focus restored', 'polite')
            }
          }
        } catch (error) {
          console.warn('Failed to restore focus:', error)
        }
        break

      case 'clear':
        sessionStorage.removeItem(FOCUS_KEY)
        break
    }
  }, [announce])

  // Get live region props for external components
  const getLiveRegionProps = useCallback((priority: 'polite' | 'assertive' = 'polite') => {
    const relevantAnnouncements = announcements.filter(a => a.priority === priority)
    const latestAnnouncement = relevantAnnouncements[relevantAnnouncements.length - 1]

    return {
      'aria-live': priority,
      'aria-atomic': true,
      className: 'sr-only',
      role: 'status' as const,
      children: latestAnnouncement?.message || ''
    }
  }, [announcements])

  return {
    preferences,
    updatePreferences,
    announce,
    handleKeyboardNavigation,
    getAccessibilityClasses,
    manageFocus,
    getLiveRegionProps,
    announcements: announcements.slice(-5) // Return recent announcements
  }
} 