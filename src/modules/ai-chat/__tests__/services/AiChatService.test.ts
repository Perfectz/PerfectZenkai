import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AiChatService } from '../../services/AiChatService'
import type { StreamingResponse } from '../../types/chat.types'
import type { UserContext } from '../../types/langchain.types'

// Mock Langchain modules
vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn()
}))

vi.mock('@langchain/core/messages', () => ({
  HumanMessage: vi.fn(),
  SystemMessage: vi.fn(),
  AIMessage: vi.fn()
}))

describe('AiChatService', () => {
  let aiChatService: AiChatService
  let mockUserContext: UserContext

  beforeEach(() => {
    mockUserContext = {
      workouts: [{
        date: '2025-01-16',
        exercises: [{ name: 'Push-ups', reps: 20, type: 'strength' }],
        duration: 30,
        intensity: 'medium'
      }],
      meals: [{
        date: '2025-01-16',
        type: 'breakfast',
        foods: [{ name: 'Oatmeal', quantity: 1, unit: 'bowl', calories: 300 }],
        calories: 300,
        macros: { protein: 10, carbs: 50, fat: 5 }
      }],
      weight: {
        currentWeight: 70,
        goalWeight: 65,
        trend: 'decreasing',
        entries: [{ date: '2025-01-16', weight: 70 }],
        unit: 'kg'
      },
      tasks: [{
        completed: 5,
        pending: 3,
        overdue: 1,
        categories: ['fitness', 'nutrition'],
        productivity: 'medium',
        streaks: 7
      }],
      preferences: {
        goals: ['weight loss', 'muscle gain'],
        dietaryRestrictions: ['vegetarian'],
        fitnessLevel: 'intermediate',
        preferredWorkoutTypes: ['strength', 'cardio'],
        timezone: 'UTC'
      }
    }

    // Reset all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize ChatGPT with Langchain successfully', async () => {
      // This test will fail until we implement AiChatService
      expect(() => {
        aiChatService = new AiChatService({
          apiKey: 'test-api-key',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          streaming: true,
          timeout: 5000
        })
      }).not.toThrow()

      expect(aiChatService).toBeDefined()
      expect(aiChatService.isInitialized()).toBe(true)
    })

    it('should fail initialization with invalid API key', async () => {
      expect(() => {
        aiChatService = new AiChatService({
          apiKey: '',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          streaming: true,
          timeout: 5000
        })
      }).toThrow('API key is required')
    })

    it('should set default configuration values', () => {
      aiChatService = new AiChatService({
        apiKey: 'test-api-key'
      })

      const config = aiChatService.getConfig()
      expect(config.model).toBe('gpt-4')
      expect(config.temperature).toBe(0.7)
      expect(config.maxTokens).toBe(2000)
      expect(config.streaming).toBe(true)
      expect(config.timeout).toBe(5000)
    })
  })

  describe('sendMessage', () => {
    beforeEach(() => {
      aiChatService = new AiChatService({
        apiKey: 'test-api-key',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        streaming: true,
        timeout: 5000
      })
    })

    it('should send message and receive response', async () => {
      const message = 'How is my fitness progress?'
      
      const response = await aiChatService.sendMessage(message, mockUserContext)

      expect(response).toBeDefined()
      expect(response.content).toBeTruthy()
      expect(response.metadata?.responseTime).toBeLessThan(5000)
      expect(response.metadata?.contextUsed).toBe(true)
    })

    it('should handle streaming responses', async () => {
      const message = 'Give me workout advice'
      const streamingResponses: StreamingResponse[] = []

      await aiChatService.sendMessageStream(
        message,
        mockUserContext,
        (response) => {
          streamingResponses.push(response)
        }
      )

      expect(streamingResponses.length).toBeGreaterThan(0)
      expect(streamingResponses[streamingResponses.length - 1].isComplete).toBe(true)
    })

    it('should include context in the prompt', async () => {
      const message = 'What should I eat for lunch?'
      
      const response = await aiChatService.sendMessage(message, mockUserContext)

      // Response should be contextually aware
      expect(response.content.toLowerCase()).toContain('vegetarian')
      expect(response.metadata?.contextUsed).toBe(true)
    })

    it('should handle API errors gracefully', async () => {
      // Mock API error
      const mockError = new Error('API rate limit exceeded')
      vi.mocked(aiChatService['chatModel'].invoke).mockRejectedValueOnce(mockError)

      const message = 'Test message'

      await expect(
        aiChatService.sendMessage(message, mockUserContext)
      ).rejects.toThrow('API rate limit exceeded')
    })

    it('should respect timeout configuration', async () => {
      aiChatService = new AiChatService({
        apiKey: 'test-api-key',
        timeout: 100 // Very short timeout
      })

      const message = 'Test message'

      await expect(
        aiChatService.sendMessage(message, mockUserContext)
      ).rejects.toThrow('timeout')
    }, 10000)
  })

  describe('rate limiting', () => {
    beforeEach(() => {
      aiChatService = new AiChatService({
        apiKey: 'test-api-key',
        rateLimitRpm: 2 // Very low rate limit for testing
      })
    })

    it('should enforce rate limiting', async () => {
      const message = 'Test message'

      // First two calls should succeed
      await aiChatService.sendMessage(message, mockUserContext)
      await aiChatService.sendMessage(message, mockUserContext)

      // Third call should be rate limited
      const startTime = Date.now()
      await aiChatService.sendMessage(message, mockUserContext)
      const endTime = Date.now()

      // Should have waited due to rate limiting
      expect(endTime - startTime).toBeGreaterThan(1000)
    })

    it('should reset rate limit after time window', async () => {
      const message = 'Test message'

      // Use up rate limit
      await aiChatService.sendMessage(message, mockUserContext)
      await aiChatService.sendMessage(message, mockUserContext)

      // Wait for rate limit reset
      await new Promise(resolve => setTimeout(resolve, 60000))

      // Should be able to send again without delay
      const startTime = Date.now()
      await aiChatService.sendMessage(message, mockUserContext)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(1000)
    }, 65000)
  })

  describe('context building', () => {
    beforeEach(() => {
      aiChatService = new AiChatService({
        apiKey: 'test-api-key'
      })
    })

    it('should build comprehensive context for deep mode', () => {
      const context = aiChatService.buildContextPrompt(mockUserContext, 'deep')

      expect(context).toContain('workouts')
      expect(context).toContain('meals')
      expect(context).toContain('weight')
      expect(context).toContain('tasks')
      expect(context).toContain('preferences')
      expect(context).toContain('vegetarian')
      expect(context).toContain('intermediate')
    })

    it('should build limited context for shallow mode', () => {
      const context = aiChatService.buildContextPrompt(mockUserContext, 'shallow')

      expect(context).toBeTruthy()
      expect(context.length).toBeLessThan(
        aiChatService.buildContextPrompt(mockUserContext, 'deep').length
      )
    })

    it('should handle missing context gracefully', () => {
      const emptyContext: UserContext = {
        workouts: [],
        meals: [],
        weight: { currentWeight: 0, trend: 'stable', entries: [], unit: 'kg' },
        tasks: [],
        preferences: {
          goals: [],
          dietaryRestrictions: [],
          fitnessLevel: 'beginner',
          preferredWorkoutTypes: [],
          timezone: 'UTC'
        }
      }

      const context = aiChatService.buildContextPrompt(emptyContext, 'medium')

      expect(context).toBeTruthy()
      expect(() => aiChatService.buildContextPrompt(emptyContext, 'medium')).not.toThrow()
    })
  })

  describe('performance requirements', () => {
    beforeEach(() => {
      aiChatService = new AiChatService({
        apiKey: 'test-api-key'
      })
    })

    it('should respond within 2 seconds for standard queries', async () => {
      const message = 'How many calories should I eat today?'
      
      const startTime = Date.now()
      const response = await aiChatService.sendMessage(message, mockUserContext)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(2000)
      expect(response.metadata?.responseTime).toBeLessThan(2000)
    })

    it('should build context within 500ms', () => {
      const startTime = Date.now()
      aiChatService.buildContextPrompt(mockUserContext, 'deep')
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(500)
    })

    it('should use less than 50MB additional memory', () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      // Create multiple service instances and send messages
      for (let i = 0; i < 10; i++) {
        const service = new AiChatService({ apiKey: 'test-api-key' })
        service.buildContextPrompt(mockUserContext, 'deep')
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024

      expect(memoryIncrease).toBeLessThan(50)
    })
  })
}) 