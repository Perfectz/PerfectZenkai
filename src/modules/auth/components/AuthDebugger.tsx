import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { localAuthService } from '../services/localAuth'

export default function AuthDebugger() {
  const authState = useAuthStore()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const updateDebugInfo = () => {
      try {
        const localSession = localAuthService.getCurrentUser()
        const authStorage = localStorage.getItem('auth-storage')
        
        setDebugInfo({
          timestamp: new Date().toISOString(),
          localSession,
          authStorage: authStorage ? JSON.parse(authStorage) : null,
          storeState: {
            isAuthenticated: authState.isAuthenticated,
            isLoading: authState.isLoading,
            isCheckingAuth: authState.isCheckingAuth,
            user: authState.user,
            token: authState.token,
            error: authState.error,
            lastAuthCheck: authState.lastAuthCheck,
            retryCount: authState.retryCount
          }
        })
      } catch (error) {
        setDebugInfo({ error: error instanceof Error ? error.message : String(error) })
      }
    }

    updateDebugInfo()
    const interval = setInterval(updateDebugInfo, 1000)
    
    return () => clearInterval(interval)
  }, [authState])

  const clearStorage = () => {
    localStorage.removeItem('auth-storage')
    localStorage.removeItem('zenkai_users')
    localStorage.removeItem('zenkai_current_user')
    console.log('🧹 Cleared auth storage')
    window.location.reload()
  }

  const forceAuthCheck = async () => {
    console.log('🔍 Forcing auth check...')
    try {
      await authState.checkAuthStatus()
      console.log('✅ Auth check completed')
    } catch (error) {
      console.error('❌ Auth check failed:', error)
    }
  }

  const forceLogout = async () => {
    console.log('🔄 Forcing complete logout...')
    try {
      await authState.forceLogout()
      console.log('✅ Force logout completed')
      window.location.reload()
    } catch (error) {
      console.error('❌ Force logout failed:', error)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>🔍 Auth Debug Info</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {authState.isCheckingAuth ? '🔄 Checking...' : '✅ Ready'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Authenticated:</strong> {authState.isAuthenticated ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>User:</strong> {authState.user?.username || 'None'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Last Check:</strong> {authState.lastAuthCheck ? new Date(authState.lastAuthCheck).toLocaleTimeString() : 'Never'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Retry Count:</strong> {authState.retryCount}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={forceAuthCheck} style={{ marginRight: '5px', padding: '2px 5px', fontSize: '10px' }}>
          Force Check
        </button>
        <button onClick={clearStorage} style={{ marginRight: '5px', padding: '2px 5px', fontSize: '10px' }}>
          Clear Storage
        </button>
        <button onClick={forceLogout} style={{ padding: '2px 5px', fontSize: '10px', backgroundColor: '#ff4444' }}>
          Force Logout
        </button>
      </div>
      
      <details>
        <summary>Raw Debug Data</summary>
        <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  )
} 