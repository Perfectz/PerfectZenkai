// Debug script for AI Chat troubleshooting
// Run this to test the AI Chat configuration

import { getAiChatConfig, validateConfig } from './config/environment'
import { AiChatService } from './services/AiChatService'

export async function debugAiChat() {
  console.log('🔧 AI Chat Debug Script')
  console.log('========================')

  try {
    // 1. Test configuration
    console.log('1. Testing configuration...')
    const config = getAiChatConfig()
    console.log('Config:', {
      useLocalApi: config.useLocalApi,
      hasOpenAiKey: !!config.openaiApiKey,
      azureFunctionUrl: config.azureFunctionUrl,
      model: config.model
    })

    validateConfig(config)
    console.log('✅ Configuration is valid')

    // 2. Test service initialization
    console.log('\n2. Testing service initialization...')
    const chatService = new AiChatService({
      azureFunctionUrl: config.azureFunctionUrl,
      model: config.model,
      temperature: config.temperature,
      maxTokens: 50,
      timeout: 8000,
      streaming: false, // Disable streaming for testing
      useLocalApi: config.useLocalApi,
      openaiApiKey: config.openaiApiKey
    })
    console.log('✅ Service initialized')

    // 3. Test basic message (comment out if no API key)
    console.log('\n3. Testing basic message...')
    console.log('ℹ️ Sending test message...')
    
    try {
      let responseReceived = false
      const responseGenerator = chatService.sendMessage('Hello, this is a test. Please respond with "Test successful".')
      
      for await (const chunk of responseGenerator) {
        if (chunk.type === 'complete') {
          console.log('✅ Received response:', chunk.message.content)
          responseReceived = true
          break
        } else if (chunk.type === 'error') {
          console.error('❌ Error response:', chunk.error)
          break
        }
      }

      if (!responseReceived) {
        console.warn('⚠️ No complete response received')
      }

    } catch (testError) {
      console.error('❌ Test message failed:', testError)
      console.log('ℹ️ This is expected if you haven\'t configured an OpenAI API key or Azure Functions')
    }

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }

  console.log('\n🔍 Debug complete. Check console for issues.')
}

// Auto-run if in development
if (import.meta.env.DEV) {
  console.log('🔧 AI Chat Debug Available - call debugAiChat() in console')
} 