import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AiChatService } from '../../services/AiChatService'
import { ContextBuilder } from '../../services/ContextBuilder'
import { MessageQueue } from '../../services/MessageQueue'
import type { ChatMessage, QueuedMessage } from '../../types/chat.types'

describe('AI Chat Integration Flow', () => {
  let aiChatService: AiChatService
  let contextBuilder: ContextBuilder
  let messageQueue: MessageQueue

  beforeEach(() => {
    // Initialize services
    aiChatService = new AiChatService({
      apiKey: 'test-api-key',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      streaming: true,
      timeout: 5000
    })

    contextBuilder = new ContextBuilder()
    messageQueue = new MessageQueue()

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('end-to-end chat conversation', () => {
    it('should complete a full conversation with context awareness', async () => {
      // User asks about their fitness progress
      const userMessage = 'How am I doing with my fitness goals this week?'
      
      // 1. Build user context
      const context = await contextBuilder.buildContext('medium')
      expect(context).toBeDefined()

      // 2. Send message with context
      const response = await aiChatService.sendMessage(userMessage, context)
      
      // 3. Verify response quality
      expect(response).toBeDefined()
      expect(response.content).toBeTruthy()
      expect(response.content.length).toBeGreaterThan(50)
      expect(response.metadata?.contextUsed).toBe(true)
      expect(response.metadata?.responseTime).toBeLessThan(5000)

      // 4. Follow-up question should maintain context
      const followUpMessage = 'What should I focus on tomorrow?'
      const followUpResponse = await aiChatService.sendMessage(followUpMessage, context)
      
      expect(followUpResponse).toBeDefined()
      expect(followUpResponse.content).toBeTruthy()
      expect(followUpResponse.metadata?.contextUsed).toBe(true)
    })

    it('should handle streaming conversation flow', async () => {
      const userMessage = 'Create a workout plan for me based on my history'
      const streamingChunks: string[] = []
      
      // Build context
      const context = await contextBuilder.buildContext('deep')

      // Stream response
      await aiChatService.sendMessageStream(
        userMessage,
        context,
        (response) => {
          streamingChunks.push(response.content)
          
          if (response.isComplete) {
            // Final response should be complete and context-aware
            const fullResponse = streamingChunks.join('')
            expect(fullResponse).toBeTruthy()
            expect(fullResponse.length).toBeGreaterThan(100)
            expect(response.metadata?.contextUsed).toBe(true)
          }
        }
      )

      expect(streamingChunks.length).toBeGreaterThan(1)
    })

    it('should integrate with all fitness modules', async () => {
      const userMessage = 'Give me a complete health overview and recommendations'
      
      // Build comprehensive context from all modules
      const context = await contextBuilder.buildContext('deep')
      
      // Context should include data from all modules
      expect(context.workouts).toBeDefined()
      expect(context.meals).toBeDefined()
      expect(context.weight).toBeDefined()
      expect(context.tasks).toBeDefined()
      expect(context.preferences).toBeDefined()

      // Send message
      const response = await aiChatService.sendMessage(userMessage, context)
      
      // Response should reference different aspects of fitness
      const responseText = response.content.toLowerCase()
      expect(responseText).toMatch(/(workout|exercise|fitness|training)/)
      expect(responseText).toMatch(/(nutrition|meal|food|calories|diet)/)
      expect(responseText).toMatch(/(weight|progress|goal)/)
    })
  })

  describe('offline message handling', () => {
    it('should queue messages when offline and sync when online', async () => {
      // Simulate offline mode
      const offlineMessage: QueuedMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        content: 'What exercises should I do today?',
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3
      }

      // Queue message
      await messageQueue.enqueue(offlineMessage)
      
      // Verify message is queued
      const queuedMessages = await messageQueue.getAllQueued()
      expect(queuedMessages.length).toBe(1)
      expect(queuedMessages[0].content).toBe(offlineMessage.content)

      // Simulate coming back online
      const context = await contextBuilder.buildContext('medium')
      
      // Process queue
      const processedMessages = await messageQueue.processQueue(
        async (message) => {
          return await aiChatService.sendMessage(message.content, context)
        }
      )

      expect(processedMessages.length).toBe(1)
      expect(processedMessages[0].content).toBeTruthy()
      
      // Queue should be empty after processing
      const remainingMessages = await messageQueue.getAllQueued()
      expect(remainingMessages.length).toBe(0)
    })

    it('should handle retry logic for failed messages', async () => {
      const failingMessage: QueuedMessage = {
        id: 'msg-2',
        conversationId: 'conv-1',
        content: 'Test message',
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3
      }

      await messageQueue.enqueue(failingMessage)

      // Mock API failure
      let callCount = 0
      const mockProcessor = vi.fn().mockImplementation(async () => {
        callCount++
        if (callCount <= 2) {
          throw new Error('API temporarily unavailable')
        }
        return { content: 'Success on third try', metadata: {} }
      })

      // Process queue with retries
      const results = await messageQueue.processQueue(mockProcessor)

      expect(mockProcessor).toHaveBeenCalledTimes(3)
      expect(results.length).toBe(1)
      expect(results[0].content).toBe('Success on third try')
    })

    it('should give up after max retries', async () => {
      const persistentFailMessage: QueuedMessage = {
        id: 'msg-3',
        conversationId: 'conv-1',
        content: 'This will always fail',
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 2
      }

      await messageQueue.enqueue(persistentFailMessage)

      // Mock persistent API failure
      const mockProcessor = vi.fn().mockRejectedValue(new Error('Persistent failure'))

      // Process queue
      const results = await messageQueue.processQueue(mockProcessor)

      expect(mockProcessor).toHaveBeenCalledTimes(3) // Initial + 2 retries
      expect(results.length).toBe(0)
      
      // Failed message should be removed from queue
      const remainingMessages = await messageQueue.getAllQueued()
      expect(remainingMessages.length).toBe(0)
    })
  })

  describe('performance and reliability', () => {
    it('should handle concurrent chat requests', async () => {
      const context = await contextBuilder.buildContext('shallow')
      const messages = [
        'What did I eat for breakfast?',
        'How many calories did I burn today?',
        'What\'s my weight trend?',
        'Give me a quick workout suggestion'
      ]

      // Send all messages concurrently
      const startTime = Date.now()
      const responses = await Promise.all(
        messages.map(message => aiChatService.sendMessage(message, context))
      )
      const endTime = Date.now()

      // All responses should be valid
      expect(responses.length).toBe(4)
      responses.forEach(response => {
        expect(response.content).toBeTruthy()
        expect(response.metadata?.responseTime).toBeLessThan(5000)
      })

      // Concurrent processing should be efficient
      expect(endTime - startTime).toBeLessThan(10000) // Total time < 10s for 4 concurrent requests
    })

    it('should gracefully degrade when services are unavailable', async () => {
      // Mock context builder failure
      vi.mocked(contextBuilder.buildContext).mockRejectedValueOnce(
        new Error('Context service unavailable')
      )

      const userMessage = 'How am I doing with my goals?'
      
      // Should still respond but without context
      const response = await aiChatService.sendMessage(userMessage, null as any)
      
      expect(response).toBeDefined()
      expect(response.content).toBeTruthy()
      expect(response.metadata?.contextUsed).toBe(false)
    })

    it('should maintain conversation history integrity', async () => {
      const context = await contextBuilder.buildContext('medium')
      const conversation: ChatMessage[] = []

      // Series of related messages
      const messages = [
        'How many workouts did I do this week?',
        'Which one was the most intense?',
        'Should I increase the intensity next week?'
      ]

      for (const message of messages) {
        const response = await aiChatService.sendMessage(message, context)
        
        // Add to conversation history
        conversation.push({
          id: `user-${conversation.length}`,
          content: message,
          role: 'user',
          timestamp: new Date()
        })
        
        conversation.push({
          id: `assistant-${conversation.length}`,
          content: response.content,
          role: 'assistant',
          timestamp: new Date(),
          metadata: response.metadata
        })
      }

      // Conversation should maintain coherent flow
      expect(conversation.length).toBe(6) // 3 user + 3 assistant messages
      expect(conversation[1].content).toBeTruthy() // First AI response
      expect(conversation[3].content).toBeTruthy() // Second AI response  
      expect(conversation[5].content).toBeTruthy() // Third AI response

      // Each response should be contextually relevant
      conversation.filter(msg => msg.role === 'assistant').forEach(msg => {
        expect(msg.metadata?.contextUsed).toBe(true)
      })
    })

    it('should meet all performance benchmarks', async () => {
      const context = await contextBuilder.buildContext('deep')
      const testMessage = 'Based on my data, what should I focus on improving?'

      // Measure initialization time
      const initStart = Date.now()
      const newService = new AiChatService({ apiKey: 'test-api-key' })
      const initEnd = Date.now()
      expect(initEnd - initStart).toBeLessThan(500)

      // Measure context building time
      const contextStart = Date.now()
      await contextBuilder.buildContext('deep')
      const contextEnd = Date.now()
      expect(contextEnd - contextStart).toBeLessThan(500)

      // Measure message processing time
      const messageStart = Date.now()
      const response = await aiChatService.sendMessage(testMessage, context)
      const messageEnd = Date.now()
      expect(messageEnd - messageStart).toBeLessThan(2000)

      // Verify response quality
      expect(response.content.length).toBeGreaterThan(50)
      expect(response.metadata?.responseTime).toBeLessThan(2000)
    })
  })
}) 