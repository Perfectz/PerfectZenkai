// src/modules/ai-chat/services/AiChatService.ts

import { 
  AVAILABLE_FUNCTIONS, 
  FUNCTION_IMPLEMENTATIONS, 
  FunctionCallResult 
} from './FunctionRegistry'
import type { 
  ChatMessage, 
  StreamingChatResponse 
} from '../types/chat.types'

export interface AiChatConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  timeout: number
  streaming: boolean
}

export class AiChatService {
  private config: AiChatConfig
  private conversationHistory: ChatMessage[] = []

  constructor(config: AiChatConfig) {
    this.config = config
  }

  async *sendMessage(message: string): AsyncGenerator<StreamingChatResponse, void, unknown> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    
    this.conversationHistory.push(userMessage)

    // Prepare assistant response
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }

    try {
      // Make OpenAI API call with function calling support
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: this.buildMessageHistory(),
          functions: Object.values(AVAILABLE_FUNCTIONS),
          function_call: 'auto',
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: this.config.streaming
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API error: ${response.status} - ${error}`)
      }

      // Handle streaming response
      if (this.config.streaming && response.body) {
        yield* this.handleStreamingResponse(response.body, assistantMessage)
      } else {
        // Handle non-streaming response
        const data = await response.json()
        yield* this.handleNonStreamingResponse(data, assistantMessage)
      }

    } catch (error) {
      // Add error response to history
      assistantMessage.content = `❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      assistantMessage.metadata = { 
        error: true, 
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError' 
      }
      this.conversationHistory.push(assistantMessage)

      // Yield error response
      yield* this.yieldSingleResponse(assistantMessage, true)
    }
  }

  private async *handleStreamingResponse(
    body: ReadableStream<Uint8Array>, 
    assistantMessage: ChatMessage
  ): AsyncGenerator<StreamingChatResponse, void, unknown> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let functionCall: { name?: string; arguments?: string } | null = null

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta

              if (delta?.content) {
                assistantMessage.content += delta.content
                yield {
                  type: 'content',
                  content: delta.content,
                  message: { ...assistantMessage }
                }
              }

              // Handle function calls
              if (delta?.function_call) {
                if (delta.function_call.name) {
                  functionCall = { name: delta.function_call.name, arguments: '' }
                }
                if (delta.function_call.arguments) {
                  if (functionCall) {
                    functionCall.arguments += delta.function_call.arguments
                  }
                }
              }

              // If function call is complete, execute it
              if (parsed.choices?.[0]?.finish_reason === 'function_call' && functionCall?.name) {
                yield* this.executeFunctionCall({
                  name: functionCall.name,
                  arguments: functionCall.arguments || ''
                }, assistantMessage)
                functionCall = null
              }

            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    // Add completed message to history
    this.conversationHistory.push(assistantMessage)

    yield {
      type: 'complete',
      message: { ...assistantMessage }
    }
  }

  private async *handleNonStreamingResponse(
    data: any, 
    assistantMessage: ChatMessage
  ): AsyncGenerator<StreamingChatResponse, void, unknown> {
    const choice = data.choices?.[0]
    
    if (choice?.message?.function_call) {
      // Execute function call
      yield* this.executeFunctionCall(choice.message.function_call, assistantMessage)
    } else if (choice?.message?.content) {
      // Regular text response
      assistantMessage.content = choice.message.content
      this.conversationHistory.push(assistantMessage)
      
      // Simulate streaming for consistency
      const words = assistantMessage.content.split(' ')
      for (let i = 0; i < words.length; i++) {
        const partial = words.slice(0, i + 1).join(' ')
        yield {
          type: 'content',
          content: i === 0 ? partial : ' ' + words[i],
          message: { ...assistantMessage, content: partial }
        }
        await new Promise(resolve => setTimeout(resolve, 50)) // Simulate streaming delay
      }
    }

    yield {
      type: 'complete',
      message: { ...assistantMessage }
    }
  }

  private async *executeFunctionCall(
    functionCall: { name: string; arguments: string },
    assistantMessage: ChatMessage
  ): AsyncGenerator<StreamingChatResponse, void, unknown> {
    try {
      // Show function execution indicator
      yield {
        type: 'function_call',
        functionName: functionCall.name,
        message: { ...assistantMessage }
      }

      // Parse function arguments
      const args = JSON.parse(functionCall.arguments || '{}')
      
      // Execute the function
      const implementation = FUNCTION_IMPLEMENTATIONS[functionCall.name as keyof typeof FUNCTION_IMPLEMENTATIONS]
      if (!implementation) {
        throw new Error(`Function '${functionCall.name}' not implemented`)
      }

      const result: FunctionCallResult = await implementation(args)

      // Add function result to conversation context
      assistantMessage.content += `\n\n${result.message}`
      if (result.data) {
        assistantMessage.metadata = { 
          ...assistantMessage.metadata, 
          functionCall: functionCall.name,
          functionResult: result.data 
        }
      }

      // Yield function result
      yield {
        type: 'function_result',
        functionName: functionCall.name,
        result,
        message: { ...assistantMessage }
      }

    } catch (error) {
      const errorMsg = `❌ Function execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      assistantMessage.content += `\n\n${errorMsg}`
      
      yield {
        type: 'function_error',
        functionName: functionCall.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: { ...assistantMessage }
      }
    }
  }

  private async *yieldSingleResponse(
    message: ChatMessage,
    isError: boolean = false
  ): AsyncGenerator<StreamingChatResponse, void, unknown> {
    yield {
      type: isError ? 'error' : 'content',
      content: message.content,
      message
    }

    yield {
      type: 'complete',
      message
    }
  }

  private buildMessageHistory(): Array<{ role: string; content: string }> {
    // System message with context about the app
    const systemMessage = {
      role: 'system',
      content: `You are Perfect Zenkai AI, a fitness and productivity assistant integrated into a fitness tracking app. 

You can help users by:
- Managing their todo tasks (add, complete, delete, view) - Categories: work, personal, health, learning, other
- Tracking their weight progress (log weights, view history)
- Providing fitness and nutrition guidance
- Analyzing their progress and setting goals

When users ask you to perform actions, use the available functions to interact with their data directly. Always confirm what actions you've taken and provide helpful insights about their progress.

For todos, use appropriate categories: 'work' for professional tasks, 'personal' for life management, 'health' for fitness/wellness, 'learning' for education, 'other' for miscellaneous.

Be encouraging, knowledgeable about fitness/nutrition, and always focus on helping them achieve their goals.`
    }

    return [
      systemMessage,
      ...this.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  public clearHistory(): void {
    this.conversationHistory = []
  }
} 