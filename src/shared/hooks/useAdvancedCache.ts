import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

interface CacheConfig {
  maxSize?: number
  defaultTtl?: number // milliseconds
  enableLRU?: boolean
  enablePersistence?: boolean
  persistenceKey?: string
}

interface QueryConfig {
  ttl?: number
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
  refetchOnWindowFocus?: boolean
}

export function useAdvancedCache<T = unknown>(config: CacheConfig = {}) {
  const {
    maxSize = 100,
    defaultTtl = 5 * 60 * 1000, // 5 minutes
    enableLRU = true,
    enablePersistence = false,
    persistenceKey = 'app-cache'
  } = config

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  const accessOrderRef = useRef<string[]>([])

  // Load persisted cache on mount
  useEffect(() => {
    if (enablePersistence && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(persistenceKey)
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, CacheEntry<T>>
          Object.entries(parsed).forEach(([key, entry]) => {
            // Check if entry is still valid
            if (Date.now() - entry.timestamp < entry.ttl) {
              cacheRef.current.set(key, entry)
            }
          })
        }
      } catch (error) {
        console.warn('Failed to load cache from persistence:', error)
      }
    }
  }, [enablePersistence, persistenceKey])

  // Persist cache when it changes
  const persistCache = useCallback(() => {
    if (enablePersistence && typeof localStorage !== 'undefined') {
      try {
        const cacheObj = Object.fromEntries(cacheRef.current)
        localStorage.setItem(persistenceKey, JSON.stringify(cacheObj))
      } catch (error) {
        console.warn('Failed to persist cache:', error)
      }
    }
  }, [enablePersistence, persistenceKey])

  const evictExpired = useCallback(() => {
    const now = Date.now()
    const toDelete: string[] = []
    
    cacheRef.current.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key)
      }
    })
    
    toDelete.forEach(key => {
      cacheRef.current.delete(key)
      const index = accessOrderRef.current.indexOf(key)
      if (index > -1) {
        accessOrderRef.current.splice(index, 1)
      }
    })
    
    if (toDelete.length > 0) {
      persistCache()
    }
  }, [persistCache])

  const evictLRU = useCallback(() => {
    if (!enableLRU || cacheRef.current.size <= maxSize) return
    
    const excessCount = cacheRef.current.size - maxSize
    const toEvict = accessOrderRef.current.slice(0, excessCount)
    
    toEvict.forEach(key => {
      cacheRef.current.delete(key)
    })
    
    accessOrderRef.current = accessOrderRef.current.slice(excessCount)
    persistCache()
  }, [enableLRU, maxSize, persistCache])

  const updateAccessOrder = useCallback((key: string) => {
    if (!enableLRU) return
    
    const index = accessOrderRef.current.indexOf(key)
    if (index > -1) {
      accessOrderRef.current.splice(index, 1)
    }
    accessOrderRef.current.push(key)
  }, [enableLRU])

  const set = useCallback((key: string, data: T, ttl = defaultTtl) => {
    evictExpired()
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    }
    
    cacheRef.current.set(key, entry)
    updateAccessOrder(key)
    evictLRU()
    persistCache()
  }, [defaultTtl, evictExpired, updateAccessOrder, evictLRU, persistCache])

  const get = useCallback((key: string): T | undefined => {
    evictExpired()
    
    const entry = cacheRef.current.get(key)
    if (!entry) return undefined
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key)
      persistCache()
      return undefined
    }
    
    entry.hits++
    updateAccessOrder(key)
    return entry.data
  }, [evictExpired, updateAccessOrder, persistCache])

  const has = useCallback((key: string): boolean => {
    evictExpired()
    return cacheRef.current.has(key)
  }, [evictExpired])

  const remove = useCallback((key: string): boolean => {
    const deleted = cacheRef.current.delete(key)
    if (deleted) {
      const index = accessOrderRef.current.indexOf(key)
      if (index > -1) {
        accessOrderRef.current.splice(index, 1)
      }
      persistCache()
    }
    return deleted
  }, [persistCache])

  const clear = useCallback(() => {
    cacheRef.current.clear()
    accessOrderRef.current = []
    persistCache()
  }, [persistCache])

  const getStats = useCallback(() => {
    evictExpired()
    
    const entries = Array.from(cacheRef.current.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const avgHits = entries.length > 0 ? totalHits / entries.length : 0
    
    return {
      size: cacheRef.current.size,
      maxSize,
      totalHits,
      avgHits: Math.round(avgHits * 100) / 100,
      hitRate: totalHits > 0 ? (totalHits / (totalHits + cacheRef.current.size)) : 0
    }
  }, [evictExpired, maxSize])

  return {
    set,
    get,
    has,
    remove,
    clear,
    getStats
  }
}

// Query hook with caching and optimization
export function useCachedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  config: QueryConfig = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    staleTime = 0,
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus = false
  } = config

  const cache = useAdvancedCache<T>({
    defaultTtl: cacheTime,
    enablePersistence: true,
    persistenceKey: 'query-cache'
  })

  const [data, setData] = useState<T | undefined>(() => cache.get(queryKey))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  const isStale = useMemo(() => {
    return Date.now() - lastFetch > staleTime
  }, [lastFetch, staleTime])

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return
    if (isLoading) return
    if (!force && !isStale && data !== undefined) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await queryFn()
      setData(result)
      cache.set(queryKey, result, ttl)
      setLastFetch(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      
      // Use stale data if available on error
      const staleData = cache.get(queryKey)
      if (staleData !== undefined) {
        setData(staleData)
      }
    } finally {
      setIsLoading(false)
    }
  }, [enabled, isLoading, isStale, data, queryFn, cache, queryKey, ttl])

  const refetch = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  const invalidate = useCallback(() => {
    cache.remove(queryKey)
    setLastFetch(0)
  }, [cache, queryKey])

  // Initial fetch or when dependencies change
  useEffect(() => {
    if (enabled && (data === undefined || isStale)) {
      fetchData()
    }
  }, [enabled, queryKey, fetchData, data, isStale])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      if (document.visibilityState === 'visible' && isStale) {
        fetchData()
      }
    }

    document.addEventListener('visibilitychange', handleFocus)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleFocus)
      window.removeEventListener('focus', handleFocus)
    }
  }, [refetchOnWindowFocus, isStale, fetchData])

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch,
    invalidate
  }
}

// Memoization utilities for React optimization
export const withMemo = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  isEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  const MemoizedComponent = React.memo(Component, isEqual)
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`
  return MemoizedComponent
}

// Performance-optimized selector hook
export function useOptimizedSelector<T, R>(
  _selector: (state: T) => R,
  _deps: React.DependencyList,
  _isEqual?: (prev: R, next: R) => boolean
) {
  // This would typically connect to your state management
  // For now, returning a placeholder based on the selector
  return useMemo(() => {
    return {} as R
  }, [])
}