export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: string
  isStreaming?: boolean
  metadata?: ChatMessageMetadata
}

export interface ChatMessageMetadata {
  contextUsed?: boolean
  responseTime?: number
  tokenCount?: number
  model?: string
  error?: boolean
  errorType?: string
  functionCall?: string
  functionResult?: any
}

export interface ChatConversation {
  id: string
  messages: ChatMessage[]
  title?: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface ChatState {
  conversations: ChatConversation[]
  activeConversationId: string | null
  isLoading: boolean
  isStreaming: boolean
  error: string | null
  isOnline: boolean
  queuedMessages: QueuedMessage[]
}

export interface QueuedMessage {
  id: string
  conversationId: string
  content: string
  timestamp: Date
  retryCount: number
  maxRetries: number
}

export interface ChatConfig {
  model: string
  temperature: number
  maxTokens: number
  streamingEnabled: boolean
  contextDepth: 'shallow' | 'medium' | 'deep'
  rateLimitRpm: number
  timeoutMs: number
}

export interface StreamingChatResponse {
  type: 'content' | 'function_call' | 'function_result' | 'function_error' | 'complete' | 'error'
  content?: string
  message: ChatMessage
  functionName?: string
  result?: any
  error?: string
}

export interface ChatResponse {
  message: ChatMessage
  success: boolean
  error?: string
}

export type MessageRole = 'user' | 'assistant' | 'system'

// Actions
export interface ChatActions {
  sendMessage: (content: string, conversationId?: string) => Promise<void>
  createConversation: (title?: string) => string
  deleteConversation: (id: string) => void
  setActiveConversation: (id: string) => void
  retryMessage: (messageId: string) => Promise<void>
  clearError: () => void
  processQueue: () => Promise<void>
}

export interface ChatStore extends ChatState, ChatActions {} 