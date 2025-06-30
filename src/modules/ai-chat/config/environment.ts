export interface AiChatConfig {
  azureFunctionUrl: string
  model: string
  temperature: number
  maxTokens: number
  streamingEnabled: boolean
  contextDepth: 'shallow' | 'medium' | 'deep'
  rateLimitRpm: number
  timeoutMs: number
  enabled: boolean
  useLocalApi: boolean
  openaiApiKey?: string
}

export function getAiChatConfig(): AiChatConfig {
  // HYBRID APPROACH:
  // - Local Development: Use OpenAI API directly if VITE_OPENAI_API_KEY is available
  // - Production: Use Azure Functions + Key Vault for security
  
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
  const isDev = import.meta.env.DEV
  const useLocalApi = isDev && !!openaiApiKey
  
  const azureFunctionUrl = import.meta.env.VITE_AZURE_FUNCTION_URL || 
    'https://perfectzenkai-api.azurewebsites.net/api/ai-chat'
  
  console.log(`🤖 AI Chat Mode: ${useLocalApi ? '🔧 Local OpenAI API' : '☁️ Azure Functions'}`)
  
  return {
    azureFunctionUrl,
    model: import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini',
    temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '150'),
    streamingEnabled: import.meta.env.VITE_AI_STREAMING !== 'false',
    contextDepth: (import.meta.env.VITE_AI_CONTEXT_DEPTH as 'shallow' | 'medium' | 'deep') || 'medium',
    rateLimitRpm: parseInt(import.meta.env.VITE_AI_RATE_LIMIT_RPM || '20'),
    timeoutMs: parseInt(import.meta.env.VITE_AI_TIMEOUT_MS || '15000'),
    enabled: true,
    useLocalApi,
    openaiApiKey: useLocalApi ? openaiApiKey : undefined
  }
}

export function validateConfig(config: AiChatConfig): void {
  if (config.useLocalApi) {
    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key is required for local development mode')
    }
  } else {
    if (!config.azureFunctionUrl) {
      throw new Error('Azure Function URL is required for production mode')
    }
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

export const environment = {
  // Hybrid AI Chat configuration
  azureFunctionUrl: import.meta.env.VITE_AZURE_FUNCTION_URL || 
    'https://perfectzenkai-api.azurewebsites.net/api/ai-chat',
  
  // Development mode detection
  isDevelopment: import.meta.env.DEV,
  
  // Local OpenAI API key (dev only)
  hasLocalApiKey: !!import.meta.env.VITE_OPENAI_API_KEY,
  
  // GitHub Pages deployment URL (fallback for development)
  githubPagesUrl: 'https://pzgamin.github.io/PerfectZenkai',
  
  // Fallback to GitHub Pages Azure Function if local Azure Function fails
  fallbackAzureFunctionUrl: 'https://perfectzenkai-api.azurewebsites.net/api/ai-chat'
}; 