export interface AiChatConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  streamingEnabled: boolean
  contextDepth: 'shallow' | 'medium' | 'deep'
  rateLimitRpm: number
  timeoutMs: number
  enabled: boolean
}

export function getAiChatConfig(): AiChatConfig {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY environment variable is required')
  }

  return {
    apiKey,
    model: import.meta.env.VITE_AI_MODEL || 'gpt-4',
    temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '2000'),
    streamingEnabled: import.meta.env.VITE_AI_STREAMING !== 'false',
    contextDepth: (import.meta.env.VITE_AI_CONTEXT_DEPTH as 'shallow' | 'medium' | 'deep') || 'medium',
    rateLimitRpm: parseInt(import.meta.env.VITE_AI_RATE_LIMIT_RPM || '20'),
    timeoutMs: parseInt(import.meta.env.VITE_AI_TIMEOUT_MS || '5000'),
    enabled: import.meta.env.VITE_AI_CHAT_ENABLED === 'true'
  }
}

export function validateConfig(config: AiChatConfig): void {
  if (!config.apiKey) {
    throw new Error('API key is required')
  }
  
  if (config.temperature < 0 || config.temperature > 2) {
    throw new Error('Temperature must be between 0 and 2')
  }
  
  if (config.maxTokens < 1) {
    throw new Error('Max tokens must be greater than 0')
  }
  
  if (config.rateLimitRpm < 1) {
    throw new Error('Rate limit must be greater than 0')
  }
  
  if (config.timeoutMs < 1000) {
    throw new Error('Timeout must be at least 1000ms')
  }
} 