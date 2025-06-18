// src/modules/ai-chat/index.ts

// Services
export { AiChatService } from './services/AiChatService'
export { ContextBuilder } from './services/ContextBuilder'
export { MessageQueue } from './services/MessageQueue'

// Components
export { ChatInterface, MessageBubble, TypingIndicator } from './components'

// Pages
export { ChatPage } from './pages/ChatPage'

// Types
export type {
  ChatMessage,
  ChatConversation,
  ChatState,
  ChatActions,
  ChatStore,
  QueuedMessage,
  ChatConfig,
  StreamingChatResponse,
  ChatMessageMetadata
} from './types/chat.types'

export type {
  LangchainConfig,
  UserContext,
  WorkoutContext,
  MealContext,
  WeightContext,
  TaskContext,
  UserPreferences,
  Exercise,
  Food,
  Macros,
  WeightEntry,
  ContextBuilder as IContextBuilder,
  MessageProcessor,
  RateLimiter,
  RetryConfig
} from './types/langchain.types'

// Configuration
export { getAiChatConfig, validateConfig } from './config/environment'
export type { AiChatConfig } from './config/environment' 