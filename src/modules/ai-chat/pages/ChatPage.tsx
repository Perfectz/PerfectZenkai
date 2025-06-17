
import { ChatInterface } from '../components/ChatInterface'
import { MessageCircle, ArrowLeft, Shield, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export function ChatPage() {
  const navigate = useNavigate()
  const [showSecurityNotice, setShowSecurityNotice] = useState(true)

  // Check if AI chat is available (API key configured securely)
  const isAiChatAvailable = import.meta.env.VITE_AI_CHAT_ENABLED === 'true' && 
                           import.meta.env.VITE_OPENAI_API_KEY && 
                           import.meta.env.VITE_APP_ENV !== 'production'

  if (!isAiChatAvailable) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-500" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Chat - Security Notice
              </h1>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI Chat Temporarily Disabled
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                For security reasons, AI chat functionality has been disabled in this public deployment. 
                API keys cannot be safely exposed in client-side applications.
              </p>
              
              <div className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
                <p>✅ All other app features are fully functional</p>
                <p>✅ Your data remains private and secure</p>
                <p>✅ Todo lists, weight tracking, and notes work offline</p>
              </div>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Fitness Coach
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  )
} 