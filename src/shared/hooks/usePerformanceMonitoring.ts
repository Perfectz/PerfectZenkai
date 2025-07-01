import { useEffect, useCallback } from 'react'

interface PerformanceMetrics {
  lcp?: number  // Largest Contentful Paint
  fid?: number  // First Input Delay
  cls?: number  // Cumulative Layout Shift
  fcp?: number  // First Contentful Paint
  ttfb?: number // Time to First Byte
}

interface PerformanceConfig {
  enabled?: boolean
  sampleRate?: number
  debug?: boolean
  endpoint?: string
}

interface NetworkInformation {
  effectiveType?: string
  downlink?: number
  rtt?: number
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
}

interface PerformanceEntryWithValue extends PerformanceEntry {
  value?: number
  hadRecentInput?: boolean
  processingStart?: number
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

declare global {
  interface Window {
    webVitals?: unknown
  }
}

export function usePerformanceMonitoring(config: PerformanceConfig = {}) {
  const {
    enabled = true,
    sampleRate = 1.0,
    debug = false,
    endpoint = '/api/metrics'
  } = config

  const logMetric = useCallback((name: string, value: number, id?: string) => {
    if (!enabled || Math.random() > sampleRate) return

    const metric = {
      name,
      value: Math.round(value),
      id,
      timestamp: Date.now(),
      url: window.location.pathname,
      connection: (navigator as NavigatorWithConnection).connection?.effectiveType || 'unknown',
      userAgent: navigator.userAgent.slice(0, 100)
    }

    if (debug) {
      console.log('📊 Performance Metric:', metric)
    }

    // Store locally for analytics
    const metrics = JSON.parse(localStorage.getItem('performance-metrics') || '[]')
    metrics.push(metric)
    
    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100)
    }
    
    localStorage.setItem('performance-metrics', JSON.stringify(metrics))

    // Send to analytics endpoint if available (disabled in development)
    if (typeof fetch !== 'undefined' && !window.location.hostname.includes('localhost')) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      }).catch(() => {
        // Silently fail - analytics shouldn't break the app
      })
    }
  }, [enabled, sampleRate, debug, endpoint])

  const measureComponentRender = useCallback((componentName: string, startTime?: number) => {
    const time = startTime ? performance.now() - startTime : performance.now()
    logMetric('component-render', time, componentName)
  }, [logMetric])

  const measureAsyncOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    try {
      const result = await operation()
      const duration = performance.now() - startTime
      logMetric('async-operation', duration, operationName)
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      logMetric('async-operation-error', duration, operationName)
      throw error
    }
  }, [logMetric])

  const getStoredMetrics = useCallback((): PerformanceMetrics[] => {
    return JSON.parse(localStorage.getItem('performance-metrics') || '[]')
  }, [])

  const clearStoredMetrics = useCallback(() => {
    localStorage.removeItem('performance-metrics')
  }, [])

  // Web Vitals monitoring
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Core Web Vitals observer
    const observeWebVitals = () => {
      // LCP - Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1] as PerformanceEntryWithValue
            if (lastEntry) {
              logMetric('LCP', lastEntry.startTime, 'core-web-vital')
            }
          })
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

          // FCP - First Contentful Paint
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: PerformanceEntry) => {
              if (entry.name === 'first-contentful-paint') {
                logMetric('FCP', entry.startTime, 'core-web-vital')
              }
            })
          })
          fcpObserver.observe({ type: 'paint', buffered: true })

          // CLS - Cumulative Layout Shift
          let clsValue = 0
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as PerformanceEntryWithValue[]) {
              if (!entry.hadRecentInput && entry.value) {
                clsValue += entry.value
              }
            }
            logMetric('CLS', clsValue, 'core-web-vital')
          })
          clsObserver.observe({ type: 'layout-shift', buffered: true })

          // FID - First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: PerformanceEntryWithValue) => {
              if (entry.processingStart) {
                logMetric('FID', entry.processingStart - entry.startTime, 'core-web-vital')
              }
            })
          })
          fidObserver.observe({ type: 'first-input', buffered: true })

        } catch (error) {
          console.warn('Performance monitoring setup failed:', error)
        }
      }

      // Navigation timing
      if (performance.getEntriesByType) {
        const navigationEntries = performance.getEntriesByType('navigation')
        if (navigationEntries.length > 0) {
          const nav = navigationEntries[0] as PerformanceNavigationTiming
          logMetric('TTFB', nav.responseStart - nav.requestStart, 'navigation')
          logMetric('DOM-Load', nav.domContentLoadedEventEnd - nav.fetchStart, 'navigation')
          logMetric('Window-Load', nav.loadEventEnd - nav.fetchStart, 'navigation')
        }
      }

      // Memory usage (if available)
      const perfWithMemory = performance as PerformanceWithMemory
      if (perfWithMemory.memory) {
        const memory = perfWithMemory.memory
        logMetric('Memory-Used', memory.usedJSHeapSize / (1024 * 1024), 'memory')
        logMetric('Memory-Total', memory.totalJSHeapSize / (1024 * 1024), 'memory')
      }
    }

    // Observe on page load
    if (document.readyState === 'complete') {
      observeWebVitals()
    } else {
      window.addEventListener('load', observeWebVitals)
    }

    return () => {
      window.removeEventListener('load', observeWebVitals)
    }
  }, [enabled, logMetric])

  return {
    logMetric,
    measureComponentRender,
    measureAsyncOperation,
    getStoredMetrics,
    clearStoredMetrics
  }
} 