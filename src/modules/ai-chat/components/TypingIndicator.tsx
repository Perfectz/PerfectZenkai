

interface TypingIndicatorProps {
  'data-testid'?: string
}

export function TypingIndicator({ 'data-testid': testId }: TypingIndicatorProps) {
  return (
    <div 
      data-testid={testId}
      className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <div className="text-white text-xs">AI</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <div className="text-sm text-gray-500 dark:text-gray-400 mr-2">
          AI is thinking...
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
} 