
import React, { useState } from 'react'
import { Bot, User, RotateCcw, Volume2, VolumeX, Loader } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ChatMessage } from '../types/chat.types'
import { ttsService } from '../services/TextToSpeechService'

interface MessageBubbleProps {
  message: ChatMessage & { 
    isStreaming?: boolean
    error?: string 
  }
  showTimestamp?: boolean
  showMetadata?: boolean
  enableMarkdown?: boolean
  animate?: boolean
  onRetry?: () => void
}

export function MessageBubble({
  message,
  showTimestamp = false,
  showMetadata = false,
  enableMarkdown = false,
  animate = false,
  onRetry
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsError, setTtsError] = useState<string | null>(null)

  const handleSpeak = async () => {
    if (isSpeaking) {
      // Stop current speech
      ttsService.stop()
      setIsSpeaking(false)
      return
    }

    if (!message.content.trim()) {
      setTtsError('No content to speak')
      return
    }

    setIsSpeaking(true)
    setTtsError(null)

    try {
      const result = await ttsService.speak(message.content)
      
      if (!result.success) {
        setTtsError(result.error || 'Speech generation failed')
      }
    } catch (error) {
      setTtsError(error instanceof Error ? error.message : 'Speech error')
    } finally {
      setIsSpeaking(false)
    }
  }

  return (
    <div
      data-testid={`message-${message.id}`}
      className={`
        flex gap-3 p-4 rounded-lg transition-all duration-200
        ${isUser ? 'user-message bg-blue-500 text-white ml-12' : ''}
        ${isAssistant ? 'assistant-message bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700' : ''}
        ${animate ? 'animate-fade-in-up' : ''}
        ${message.error ? 'border-red-300 dark:border-red-700' : ''}
      `}
      role="listitem"
      aria-label={`${message.role} message`}
    >
      {/* Avatar for assistant messages */}
      {isAssistant && (
        <div data-testid="assistant-avatar" className="flex-shrink-0">
          <Bot className="w-6 h-6 text-blue-500" />
        </div>
      )}

      <div className="flex-1 space-y-1">
        {/* Message content with TTS button for assistant */}
        <div className="flex items-start gap-2">
          <div 
            data-testid="message-content"
            className="break-words flex-1"
          >
            {enableMarkdown ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: formatMarkdown(message.content) 
                }} 
              />
            ) : (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}
          </div>

          {/* TTS Button for Assistant Messages */}
          {isAssistant && !message.isStreaming && message.content.trim() && (
            <button
              onClick={handleSpeak}
              disabled={isSpeaking}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-500 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label={isSpeaking ? "Stop speech" : "Read message aloud"}
              title={isSpeaking ? "Stop speech" : "Read message aloud"}
            >
              {isSpeaking ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : ttsService.isPlaying() ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Streaming indicator */}
        {message.isStreaming && (
          <div className="flex items-center gap-2">
            <div 
              data-testid="streaming-indicator"
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              AI is typing...
            </div>
            <div 
              data-testid="typing-cursor"
              className="w-2 h-4 bg-blue-500 animate-pulse"
            />
          </div>
        )}

        {/* Error state */}
        {message.error && (
          <div data-testid="message-error" className="mt-2">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to send: {message.error}
            </p>
            {onRetry && (
              <button
                data-testid="retry-button"
                onClick={onRetry}
                className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* TTS Error state */}
        {ttsError && (
          <div data-testid="tts-error" className="mt-2">
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Speech error: {ttsError}
            </p>
          </div>
        )}

        {/* Timestamp */}
        {showTimestamp && (
          <div 
            data-testid="message-timestamp"
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </div>
        )}

        {/* Metadata for assistant messages */}
        {showMetadata && isAssistant && message.metadata && (
          <div 
            data-testid="message-metadata"
            className="text-xs text-gray-500 dark:text-gray-400 space-y-1"
          >
            {message.metadata.contextUsed && (
              <div>✓ Context used</div>
            )}
            {message.metadata.responseTime && (
              <div>{(message.metadata.responseTime / 1000).toFixed(1)}s</div>
            )}
            {message.metadata.tokenCount && (
              <div>{message.metadata.tokenCount} tokens</div>
            )}
          </div>
        )}
      </div>

      {/* Avatar for user messages */}
      {isUser && (
        <div className="flex-shrink-0">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  )
}

// Simple markdown formatter for basic formatting
function formatMarkdown(content: string): string {
  // Sanitize content first
  const sanitized = content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')

  return sanitized
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">$1</a>')
} 