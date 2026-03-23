import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/modules/auth'
import { resetLifecycleScope, runLifecyclePhase } from './lifecycle'

export default function AppLifecycleManager() {
  const { isAuthenticated, user } = useAuthStore()
  const hasBootstrapped = useRef(false)
  const previousUserIdRef = useRef<string | null>(null)
  const previousUserRef = useRef<typeof user>(null)

  useEffect(() => {
    if (hasBootstrapped.current) {
      return
    }

    hasBootstrapped.current = true
    void runLifecyclePhase(
      'app-bootstrap',
      {
        user: null,
        isProd: import.meta.env.PROD,
        logger: console,
      },
      'app-bootstrap'
    )
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      if (previousUserIdRef.current) {
        void runLifecyclePhase(
          'logout',
          {
            user: previousUserRef.current,
            isProd: import.meta.env.PROD,
            logger: console,
          },
          `logout:${previousUserIdRef.current}`
        )
        previousUserIdRef.current = null
        previousUserRef.current = null
      }
      return
    }

    if (previousUserIdRef.current === user.id) {
      return
    }

    previousUserIdRef.current = user.id
    previousUserRef.current = user
    resetLifecycleScope(`post-auth:user:${user.id}`)

    void runLifecyclePhase(
      'post-auth',
      {
        user,
        isProd: import.meta.env.PROD,
        logger: console,
      },
      `post-auth:user:${user.id}`
    )
  }, [isAuthenticated, user])

  return null
}