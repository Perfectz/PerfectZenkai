import React, { useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'
import { AccessibilityContext } from './AccessibilityContext'
import type { AccessibilityContextType } from './AccessibilityContext'

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const accessibility = useAccessibility()
  const {
    preferences,
    updatePreferences,
    announce,
    getAccessibilityClasses,
    manageFocus,
    getLiveRegionProps
  } = accessibility

  // Apply accessibility classes to document body
  useEffect(() => {
    const classes = getAccessibilityClasses()
    const bodyClasses = document.body.className.split(' ')
    
    // Remove old accessibility classes
    const accessibilityClassesToRemove = bodyClasses.filter(cls => 
      ['high-contrast', 'reduced-motion', 'large-text', 'screen-reader-enabled'].includes(cls)
    )
    accessibilityClassesToRemove.forEach(cls => {
      document.body.classList.remove(cls)
    })
    
    // Add new accessibility classes
    if (classes) {
      classes.split(' ').forEach(cls => {
        if (cls.trim()) {
          document.body.classList.add(cls.trim())
        }
      })
    }
  }, [getAccessibilityClasses])

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyboard = (e: KeyboardEvent) => {
      // Alt/Cmd + Shift + H = Toggle High Contrast
      if ((e.altKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        updatePreferences({ highContrast: !preferences.highContrast })
        announce(
          `High contrast mode ${!preferences.highContrast ? 'enabled' : 'disabled'}`,
          'assertive'
        )
      }

      // Alt/Cmd + Shift + M = Toggle Reduced Motion
      if ((e.altKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        updatePreferences({ reducedMotion: !preferences.reducedMotion })
        announce(
          `Reduced motion ${!preferences.reducedMotion ? 'enabled' : 'disabled'}`,
          'assertive'
        )
      }

      // Alt/Cmd + Shift + T = Toggle Large Text
      if ((e.altKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        updatePreferences({ largeText: !preferences.largeText })
        announce(
          `Large text mode ${!preferences.largeText ? 'enabled' : 'disabled'}`,
          'assertive'
        )
      }

      // Alt/Cmd + Shift + S = Toggle Screen Reader Mode
      if ((e.altKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        updatePreferences({ screenReaderEnabled: !preferences.screenReaderEnabled })
        announce(
          `Screen reader optimizations ${!preferences.screenReaderEnabled ? 'enabled' : 'disabled'}`,
          'assertive'
        )
      }
    }

    document.addEventListener('keydown', handleGlobalKeyboard)
    return () => document.removeEventListener('keydown', handleGlobalKeyboard)
  }, [preferences, updatePreferences, announce])

  const contextValue: AccessibilityContextType = {
    preferences,
    updatePreferences,
    announce,
    getAccessibilityClasses,
    manageFocus
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Skip Links */}
      <a 
        href="#main-content" 
        className="skip-link"
        onFocus={() => announce('Skip to main content link focused', 'polite')}
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="skip-link"
        onFocus={() => announce('Skip to navigation link focused', 'polite')}
      >
        Skip to navigation
      </a>

      {/* Live Regions for Screen Reader Announcements */}
      <div {...getLiveRegionProps('polite')} data-testid="live-region-polite" />
      <div {...getLiveRegionProps('assertive')} data-testid="live-region-assertive" />

      {/* Main Content Wrapper */}
      <div 
        id="main-content" 
        role="main"
        tabIndex={-1}
        className="focus:outline-none"
      >
        {children}
      </div>

      {/* Accessibility Help Modal Trigger (Hidden) */}
      <button
        id="accessibility-help-trigger"
        className="sr-only"
        onClick={() => {
          announce(
            'Accessibility shortcuts: Alt+Shift+H for high contrast, Alt+Shift+M for reduced motion, Alt+Shift+T for large text, Alt+Shift+S for screen reader mode',
            'assertive'
          )
        }}
        aria-label="Get accessibility help and keyboard shortcuts"
      >
        Accessibility Help
      </button>
    </AccessibilityContext.Provider>
  )
} 