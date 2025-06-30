// src/modules/ai-chat/services/AiChatDebug.ts
// Debugging utilities for AI Chat Azure Function issues

export interface DebugResult {
  success: boolean
  message: string
  details: {
    url: string
    status?: number
    headers?: Record<string, string>
    responseTime?: number
    error?: string
  }
}

export class AiChatDebugService {
  private baseUrl: string

  constructor(baseUrl: string = 'https://perfectzenkai-api.azurewebsites.net/api') {
    this.baseUrl = baseUrl
  }

  /**
   * Test basic Azure Function connectivity
   */
  async testFunctionConnectivity(): Promise<DebugResult> {
    const url = `${this.baseUrl}/ai-chat`
    const startTime = Date.now()

    try {
      console.log('🔍 Testing Azure Function connectivity:', url)

      const response = await fetch(url, {
        method: 'OPTIONS', // Preflight request
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const responseTime = Date.now() - startTime
      const headers = Object.fromEntries(response.headers.entries())

      return {
        success: response.ok,
        message: response.ok 
          ? `✅ Azure Function is accessible (${responseTime}ms)`
          : `❌ Azure Function returned ${response.status}: ${response.statusText}`,
        details: {
          url,
          status: response.status,
          headers,
          responseTime
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        message: `❌ Cannot reach Azure Function: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          url,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  /**
   * Test AI Chat with a simple message
   */
  async testAiChat(): Promise<DebugResult> {
    const url = `${this.baseUrl}/ai-chat`
    const startTime = Date.now()

    try {
      console.log('🧠 Testing AI Chat functionality:', url)

      const testMessage = {
        messages: [
          { role: 'user', content: 'Hello! This is a test message. Please reply with "Test successful".' }
        ],
        temperature: 0.7,
        max_tokens: 50
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      const responseTime = Date.now() - startTime
      const headers = Object.fromEntries(response.headers.entries())

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response')
        return {
          success: false,
          message: `❌ AI Chat failed: ${response.status} - ${errorText}`,
          details: {
            url,
            status: response.status,
            headers,
            responseTime,
            error: errorText
          }
        }
      }

      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content || 'No response content'

      return {
        success: true,
        message: `✅ AI Chat successful! Response: "${aiResponse}" (${responseTime}ms)`,
        details: {
          url,
          status: response.status,
          headers,
          responseTime
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        message: `❌ AI Chat test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          url,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  /**
   * Run full diagnostic test
   */
  async runDiagnostics(): Promise<{
    connectivity: DebugResult
    aiChat: DebugResult
    summary: string
  }> {
    console.log('🔧 Running Azure Function diagnostics...')

    const connectivity = await this.testFunctionConnectivity()
    const aiChat = connectivity.success ? await this.testAiChat() : {
      success: false,
      message: '⏭️ Skipped AI Chat test (connectivity failed)',
      details: { url: `${this.baseUrl}/ai-chat` }
    }

    let summary = '🔍 **Azure Function Diagnostics Summary**\n\n'
    summary += `**Connectivity Test**: ${connectivity.message}\n`
    summary += `**AI Chat Test**: ${aiChat.message}\n\n`

    if (!connectivity.success) {
      summary += '**Next Steps**: Check if Azure Function is deployed and running\n'
      summary += '- Verify URL: https://perfectzenkai-api.azurewebsites.net/api/ai-chat\n'
      summary += '- Check Azure portal for deployment status\n'
      summary += '- Verify CORS settings allow your domain'
    } else if (!aiChat.success) {
      summary += '**Next Steps**: Check Azure Function configuration\n'
      summary += '- Verify OpenAI API key in Azure Key Vault\n'
      summary += '- Check Function App environment variables\n'
      summary += '- Review Function App logs for errors'
    } else {
      summary += '✅ **All tests passed!** AI Chat is working correctly.'
    }

    return { connectivity, aiChat, summary }
  }
}

// Export singleton instance
export const aiChatDebugService = new AiChatDebugService() 