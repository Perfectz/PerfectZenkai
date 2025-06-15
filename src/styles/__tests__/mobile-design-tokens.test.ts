import { describe, test, expect } from 'vitest'
import { 
  getTouchTargetSize, 
  getResponsiveSpacing, 
  validateTouchTarget,
  getMobileBreakpoints,
  getMobileTypography 
} from '../mobile-design-tokens'

describe('Mobile Design Tokens', () => {
  describe('Touch Target Standards', () => {
    test('should return minimum 44px touch target size', () => {
      const minSize = getTouchTargetSize('minimum')
      expect(minSize).toBe(44)
    })

    test('should return comfortable 48px touch target size', () => {
      const comfortableSize = getTouchTargetSize('comfortable')
      expect(comfortableSize).toBe(48)
    })

    test('should return large 56px touch target size', () => {
      const largeSize = getTouchTargetSize('large')
      expect(largeSize).toBe(56)
    })

    test('should validate touch target meets minimum requirements', () => {
      expect(validateTouchTarget(44)).toBe(true)
      expect(validateTouchTarget(48)).toBe(true)
      expect(validateTouchTarget(43)).toBe(false)
      expect(validateTouchTarget(32)).toBe(false)
    })
  })

  describe('Responsive Spacing System', () => {
    test('should provide consistent spacing scale', () => {
      const spacing = getResponsiveSpacing()
      expect(spacing).toHaveProperty('xs', 4)
      expect(spacing).toHaveProperty('sm', 8)
      expect(spacing).toHaveProperty('md', 16)
      expect(spacing).toHaveProperty('lg', 24)
      expect(spacing).toHaveProperty('xl', 32)
      expect(spacing).toHaveProperty('xxl', 48)
    })

    test('should provide mobile-specific spacing adjustments', () => {
      const mobileSpacing = getResponsiveSpacing('mobile')
      expect(mobileSpacing.touchPadding).toBe(12)
      expect(mobileSpacing.formSpacing).toBe(20)
      expect(mobileSpacing.cardPadding).toBe(16)
    })
  })

  describe('Mobile Breakpoints', () => {
    test('should define Galaxy S24 Ultra breakpoint', () => {
      const breakpoints = getMobileBreakpoints()
      expect(breakpoints.galaxyS24Ultra).toBe(412)
      expect(breakpoints.mobile).toBe(768)
      expect(breakpoints.tablet).toBe(1024)
    })

    test('should provide breakpoint utilities', () => {
      const breakpoints = getMobileBreakpoints()
      expect(breakpoints.isMobile(400)).toBe(true)
      expect(breakpoints.isMobile(800)).toBe(false)
      expect(breakpoints.isGalaxyS24Ultra(412)).toBe(true)
    })
  })

  describe('Mobile Typography', () => {
    test('should provide mobile-optimized font sizes', () => {
      const typography = getMobileTypography()
      expect(typography.body.fontSize).toBe(16)
      expect(typography.body.lineHeight).toBe(1.5)
      expect(typography.small.fontSize).toBe(14)
      expect(typography.large.fontSize).toBe(18)
    })

    test('should ensure minimum readable font sizes', () => {
      const typography = getMobileTypography()
      Object.values(typography).forEach(style => {
        expect(style.fontSize).toBeGreaterThanOrEqual(12)
      })
    })

    test('should provide touch-friendly line heights', () => {
      const typography = getMobileTypography()
      Object.values(typography).forEach(style => {
        expect(style.lineHeight).toBeGreaterThanOrEqual(1.4)
      })
    })
  })
}) 