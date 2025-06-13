import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const { handleCallback, error } = useAuthStore()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const errorParam = urlParams.get('error')

    if (errorParam) {
      console.error('OAuth error:', errorParam)
      window.location.href = '/login?error=oauth_error'
      return
    }

    if (code) {
      handleCallback(code)
    } else {
      console.error('No authorization code received')
      window.location.href = '/login?error=no_code'
    }
  }, [handleCallback])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="text-red-600 dark:text-red-400">
            <h2 className="text-xl font-semibold">Authentication Failed</h2>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Completing sign in...
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Please wait while we verify your account
          </p>
        </div>
      </div>
    </div>
  )
} 