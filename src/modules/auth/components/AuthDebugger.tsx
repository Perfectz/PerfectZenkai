import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { User } from '../types/auth'

interface AuthDebugInfo {
  isAuthenticated: boolean
  user: User | null
  timestamp: string
}

export default function AuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo>({
    isAuthenticated: false,
    user: null,
    timestamp: new Date().toISOString()
  })
  
  const { isAuthenticated, user, checkAuthStatus, logout } = useAuthStore()

  useEffect(() => {
    setDebugInfo({
      isAuthenticated,
      user,
      timestamp: new Date().toISOString()
    })
  }, [isAuthenticated, user])

  const clearStorage = () => {
    localStorage.clear()
    sessionStorage.clear()
  }

  const forceLogout = () => {
    logout()
  }

  const forceAuthCheck = () => {
    checkAuthStatus()
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-md">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <div className="mt-4">
        <button onClick={forceAuthCheck} className="px-2 py-1 bg-blue-500 text-white rounded mr-2">
          Force Check
        </button>
        <button onClick={clearStorage} className="px-2 py-1 bg-gray-500 text-white rounded mr-2">
          Clear Storage
        </button>
        <button onClick={forceLogout} className="px-2 py-1 bg-red-500 text-white rounded">
          Force Logout
        </button>
      </div>
    </div>
  )
} 