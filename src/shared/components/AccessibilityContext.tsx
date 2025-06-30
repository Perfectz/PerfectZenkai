import { createContext, useContext } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

export interface AccessibilityContextType {
  preferences: ReturnType<typeof useAccessibility>['preferences']
  updatePreferences: ReturnType<typeof useAccessibility>['updatePreferences']
  announce: ReturnType<typeof useAccessibility>['announce']
  getAccessibilityClasses: ReturnType<typeof useAccessibility>['getAccessibilityClasses']
  manageFocus: ReturnType<typeof useAccessibility>['manageFocus']
}

export const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider')
  }
  return context
} 