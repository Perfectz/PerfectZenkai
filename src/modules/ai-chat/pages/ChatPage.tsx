
import { ChatInterface } from '../components/ChatInterface'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ChatPage() {
  const navigate = useNavigate()

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