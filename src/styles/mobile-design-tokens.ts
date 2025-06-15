export type TouchTargetSize = 'minimum' | 'comfortable' | 'large'
export type SpacingContext = 'mobile' | 'desktop'

export interface SpacingScale {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

export interface MobileSpacing extends SpacingScale {
  touchPadding: number
  formSpacing: number
  cardPadding: number
}

export interface Breakpoints {
  galaxyS24Ultra: number
  mobile: number
  tablet: number
  isMobile: (width: number) => boolean
  isGalaxyS24Ultra: (width: number) => boolean
}

export interface TypographyStyle {
  fontSize: number
  lineHeight: number
}

export interface Typography {
  body: TypographyStyle
  small: TypographyStyle
  large: TypographyStyle
  heading: TypographyStyle
  caption: TypographyStyle
}

/**
 * Get touch target size based on comfort level
 * Follows iOS Human Interface Guidelines (44px) and Material Design (48dp)
 */
export function getTouchTargetSize(size: TouchTargetSize): number {
  const sizes = {
    minimum: 44,     // iOS minimum
    comfortable: 48, // Material Design standard
    large: 56        // Large touch targets for accessibility
  }
  return sizes[size]
}

/**
 * Validate if a touch target meets minimum accessibility requirements
 */
export function validateTouchTarget(size: number): boolean {
  return size >= 44
}

/**
 * Get responsive spacing system
 */
export function getResponsiveSpacing(context?: SpacingContext): SpacingScale | MobileSpacing {
  const baseSpacing: SpacingScale = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  }

  if (context === 'mobile') {
    return {
      ...baseSpacing,
      touchPadding: 12,
      formSpacing: 20,
      cardPadding: 16
    }
  }

  return baseSpacing
}

/**
 * Get mobile breakpoints with utility functions
 */
export function getMobileBreakpoints(): Breakpoints {
  return {
    galaxyS24Ultra: 412,
    mobile: 768,
    tablet: 1024,
    isMobile: (width: number) => width < 768,
    isGalaxyS24Ultra: (width: number) => width <= 412
  }
}

/**
 * Get mobile-optimized typography scale
 */
export function getMobileTypography(): Typography {
  return {
    body: {
      fontSize: 16,
      lineHeight: 1.5
    },
    small: {
      fontSize: 14,
      lineHeight: 1.4
    },
    large: {
      fontSize: 18,
      lineHeight: 1.5
    },
    heading: {
      fontSize: 20,
      lineHeight: 1.4
    },
    caption: {
      fontSize: 12,
      lineHeight: 1.4
    }
  }
}

/**
 * CSS Custom Properties for mobile design tokens
 */
export const mobileDesignTokens = {
  // Touch targets
  '--touch-target-min': `${getTouchTargetSize('minimum')}px`,
  '--touch-target-comfortable': `${getTouchTargetSize('comfortable')}px`,
  '--touch-target-large': `${getTouchTargetSize('large')}px`,
  
  // Spacing
  '--spacing-xs': `${getResponsiveSpacing().xs}px`,
  '--spacing-sm': `${getResponsiveSpacing().sm}px`,
  '--spacing-md': `${getResponsiveSpacing().md}px`,
  '--spacing-lg': `${getResponsiveSpacing().lg}px`,
  '--spacing-xl': `${getResponsiveSpacing().xl}px`,
  '--spacing-xxl': `${getResponsiveSpacing().xxl}px`,
  
  // Mobile-specific spacing
  '--mobile-touch-padding': `${(getResponsiveSpacing('mobile') as MobileSpacing).touchPadding}px`,
  '--mobile-form-spacing': `${(getResponsiveSpacing('mobile') as MobileSpacing).formSpacing}px`,
  '--mobile-card-padding': `${(getResponsiveSpacing('mobile') as MobileSpacing).cardPadding}px`,
  
  // Breakpoints
  '--breakpoint-galaxy-s24-ultra': `${getMobileBreakpoints().galaxyS24Ultra}px`,
  '--breakpoint-mobile': `${getMobileBreakpoints().mobile}px`,
  '--breakpoint-tablet': `${getMobileBreakpoints().tablet}px`,
  
  // Typography
  '--font-size-body': `${getMobileTypography().body.fontSize}px`,
  '--font-size-small': `${getMobileTypography().small.fontSize}px`,
  '--font-size-large': `${getMobileTypography().large.fontSize}px`,
  '--font-size-heading': `${getMobileTypography().heading.fontSize}px`,
  '--font-size-caption': `${getMobileTypography().caption.fontSize}px`,
  
  '--line-height-body': getMobileTypography().body.lineHeight,
  '--line-height-small': getMobileTypography().small.lineHeight,
  '--line-height-large': getMobileTypography().large.lineHeight,
  '--line-height-heading': getMobileTypography().heading.lineHeight,
  '--line-height-caption': getMobileTypography().caption.lineHeight,
} 