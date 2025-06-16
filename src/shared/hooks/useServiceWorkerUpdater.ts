/// <filename>useServiceWorkerUpdater.ts</filename>
/// <reference types="vite-plugin-pwa/client" />
import { useEffect, useState, useCallback, useRef } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { useToast } from './useToast'

/**
 * Hook that registers the service worker and exposes update & offlineReady flags.
 */
export function useServiceWorkerUpdater() {
  const { toast } = useToast()
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [updateFn, setUpdateFn] = useState<(() => void) | null>(null)
  const hasRegistered = useRef(false)

  // const showOfflineToast = useCallback(() => {
  //   toast({
  //     title: 'App ready for offline use',
  //     variant: 'success',
  //   })
  // }, [toast]) // Unused function

  useEffect(() => {
    // Prevent multiple registrations
    if (hasRegistered.current) return

    hasRegistered.current = true
    
    // Register and capture update function
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true)
        // Show update banner instead of toast
      },
      onOfflineReady() {
        setOfflineReady(true)
        // Call the toast function directly to avoid dependency issues
        toast({
          title: 'App ready for offline use',
          variant: 'success',
        })
      },
    })
    setUpdateFn(() => updateSW)
  }, [toast]) // Include toast in dependencies

  const updateApp = useCallback(() => {
    if (updateFn) {
      updateFn()
    }
  }, [updateFn])

  return {
    needRefresh,
    offlineReady,
    updateApp,
  }
} 