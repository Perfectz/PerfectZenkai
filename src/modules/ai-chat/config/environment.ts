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
}

export function getAiChatConfig(): AiChatConfig {
  // Note: AI Chat now uses Azure Functions + Key Vault for security
  // No client-side API keys needed!
  
  // SECURITY: Now uses Azure Functions + Key Vault - no client-side API keys needed!
  const azureFunctionUrl = import.meta.env.VITE_AZURE_FUNCTION_URL || 
    'https://perfectzenkai-api.azurewebsites.net/api/ai-chat'
  
  return {
    azureFunctionUrl,
    model: import.meta.env.VITE_AI_MODEL || 'gpt-4.1-mini',
    temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '150'),
    streamingEnabled: import.meta.env.VITE_AI_STREAMING !== 'false',
    contextDepth: (import.meta.env.VITE_AI_CONTEXT_DEPTH as 'shallow' | 'medium' | 'deep') || 'medium',
    rateLimitRpm: parseInt(import.meta.env.VITE_AI_RATE_LIMIT_RPM || '20'),
    timeoutMs: parseInt(import.meta.env.VITE_AI_TIMEOUT_MS || '20000'),
    enabled: true // Now secure with Azure Functions
  }
}

export function validateConfig(config: AiChatConfig): void {
  if (!config.azureFunctionUrl) {
    throw new Error('Azure Function URL is required')
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
  // Azure Function URL for AI Chat
  // In production (GitHub Pages), use the deployed Azure Function
  // In development, use local Azure Function or fallback to GitHub Pages
  azureFunctionUrl: import.meta.env.DEV 
    ? 'https://perfectzenkai-api.azurewebsites.net/api/ai-chat'
    : 'https://perfectzenkai-api.azurewebsites.net/api/ai-chat',
  
  // Development mode detection
  isDevelopment: import.meta.env.DEV,
  
  // GitHub Pages deployment URL (fallback for development)
  githubPagesUrl: 'https://pzgamin.github.io/PerfectZenkai',
  
  // Fallback to GitHub Pages Azure Function if local Azure Function fails
  fallbackAzureFunctionUrl: 'https://perfectzenkai-api.azurewebsites.net/api/ai-chat'
}; 