import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader, Zap, XCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { AiChatService } from '../services/AiChatService'
import type { ChatMessage, StreamingChatResponse } from '../types/chat.types'




export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<ChatMessage | null>(null)
  const [functionExecuting, setFunctionExecuting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatService = useRef<AiChatService>(
    new AiChatService({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 8000,
      streaming: true
    })
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStreamingMessage])

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setError(null)
    setIsLoading(true)
    setIsStreaming(true)

    try {
      const responseGenerator = chatService.current.sendMessage(inputText.trim())
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }

      setCurrentStreamingMessage(assistantMessage)

      for await (const chunk of responseGenerator) {
        handleStreamingChunk(chunk, assistantMessage)
      }

    } catch (error) {
      console.error('Chat error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setCurrentStreamingMessage(null)
      setFunctionExecuting(null)
      inputRef.current?.focus()
    }
  }

  const handleStreamingChunk = (chunk: StreamingChatResponse, assistantMessage: ChatMessage) => {
    switch (chunk.type) {
      case 'content':
        assistantMessage.content = chunk.message.content
        setCurrentStreamingMessage({ ...assistantMessage })
        break

      case 'function_call':
        setFunctionExecuting(chunk.functionName || 'Unknown function')
        break

      case 'function_result':
        // Show function result with visual feedback
        if (chunk.result?.success) {
          assistantMessage.metadata = {
            ...assistantMessage.metadata,
            functionCall: chunk.functionName,
            functionResult: chunk.result
          }
        }
        setFunctionExecuting(null)
        assistantMessage.content = chunk.message.content
        setCurrentStreamingMessage({ ...assistantMessage })
        break

      case 'function_error':
        setFunctionExecuting(null)
        assistantMessage.content = chunk.message.content
        assistantMessage.metadata = {
          ...assistantMessage.metadata,
          error: true,
          errorType: 'FunctionError'
        }
        setCurrentStreamingMessage({ ...assistantMessage })
        break

      case 'complete':
        setMessages(prev => [...prev, chunk.message])
        setCurrentStreamingMessage(null)
        setIsStreaming(false)
        break

      case 'error':
        setError(chunk.error || 'An error occurred')
        setCurrentStreamingMessage(null)
        setIsStreaming(false)
        break
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRetry = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return

    const userMessage = messages[messageIndex - 1]
    if (userMessage?.role === 'user') {
      setInputText(userMessage.content)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Perfect Zenkai AI</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {functionExecuting ? (
                <span className="flex items-center gap-1">
                  <Loader className="w-3 h-3 animate-spin" />
                  Executing {functionExecuting}...
                </span>
              ) : isStreaming ? (
                'Thinking...'
              ) : (
                'Your fitness & productivity assistant'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to Perfect Zenkai AI
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
              I can help you manage tasks, track weight, analyze progress, and achieve your fitness goals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <strong>Try asking:</strong> "Add a workout task"
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <strong>Or:</strong> "Log my weight as 150 lbs"
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <strong>Or:</strong> "Show my current tasks"
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <strong>Or:</strong> "What's my weight progress?"
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRetry={message.metadata?.error ? () => handleRetry(message.id) : undefined}
          />
        ))}

                 {currentStreamingMessage && (
           <MessageBubble
             message={{ ...currentStreamingMessage, isStreaming: true }}
           />
         )}

        {isStreaming && !currentStreamingMessage && <TypingIndicator />}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Function Execution Status */}
      {functionExecuting && (
        <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 px-4 py-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Executing {functionExecuting}...</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your fitness journey..."
            disabled={isLoading}
            className="flex-1"
            aria-label="Message input"
          />
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 