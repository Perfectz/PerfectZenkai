import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContextBuilder } from '../../services/ContextBuilder'
import type { UserContext } from '../../types/langchain.types'

// Mock module stores
vi.mock('../../../workout/store', () => ({
  useWorkoutStore: () => ({
    getAllWorkouts: vi.fn(() => []),
    getRecentWorkouts: vi.fn(() => []),
    getWorkouts: vi.fn(),
    getWorkoutStats: vi.fn()
  })
}))

vi.mock('../../../meals/store', () => ({
  useMealStore: () => ({
    getAllMeals: vi.fn(() => []),
    getRecentMeals: vi.fn(() => []),
    getMeals: vi.fn(),
    getMealStats: vi.fn()
  })
}))

vi.mock('../../../weight/store', () => ({
  useWeightStore: () => ({
    getAllEntries: vi.fn(() => []),
    getCurrentWeight: vi.fn(() => 70),
    getGoalWeight: vi.fn(() => 65),
    getTrend: vi.fn(() => 'decreasing'),
    getWeightEntries: vi.fn(),
    getWeightGoal: vi.fn(),
    getWeightTrend: vi.fn()
  })
}))

vi.mock('../../../tasks/store', () => ({
  useTasksStore: () => ({
    getAllTodos: vi.fn(() => []),
    getCompletedCount: vi.fn(() => 5),
    getPendingCount: vi.fn(() => 3),
    getOverdueCount: vi.fn(() => 1),
    getTaskStats: vi.fn(),
    getProductivityMetrics: vi.fn()
  })
}))

describe('ContextBuilder', () => {
  let contextBuilder: ContextBuilder

  beforeEach(() => {
    contextBuilder = new ContextBuilder()
    vi.clearAllMocks()
  })

  describe('buildContext', () => {
    it('should build shallow context with basic info only', async () => {
      const context = await contextBuilder.buildContext('shallow')

      expect(context).toBeDefined()
      expect(context.weight.currentWeight).toBeDefined()
      expect(context.preferences.fitnessLevel).toBeDefined()
      
      // Shallow should have limited data
      expect(context.workouts.length).toBeLessThanOrEqual(3)
      expect(context.meals.length).toBeLessThanOrEqual(3)
    })

    it('should build medium context with moderate detail', async () => {
      const context = await contextBuilder.buildContext('medium')

      expect(context).toBeDefined()
      expect(context.workouts.length).toBeLessThanOrEqual(7)
      expect(context.meals.length).toBeLessThanOrEqual(7)
      expect(context.weight.entries.length).toBeLessThanOrEqual(7)
    })

    it('should build deep context with full detail', async () => {
      const context = await contextBuilder.buildContext('deep')

      expect(context).toBeDefined()
      expect(context.workouts.length).toBeLessThanOrEqual(30)
      expect(context.meals.length).toBeLessThanOrEqual(30)
      expect(context.weight.entries.length).toBeLessThanOrEqual(30)
      expect(context.tasks.length).toBeGreaterThan(0)
    })

    it('should complete context building within 500ms', async () => {
      const startTime = Date.now()
      await contextBuilder.buildContext('deep')
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(500)
    })

    it('should handle missing store data gracefully', async () => {
      // Mock stores to return empty data
      vi.mocked(contextBuilder['getWorkoutData']).mockResolvedValueOnce([])
      vi.mocked(contextBuilder['getMealData']).mockResolvedValueOnce([])
      vi.mocked(contextBuilder['getWeightData']).mockResolvedValueOnce({
        currentWeight: 0,
        trend: 'stable',
        entries: [],
        unit: 'kg'
      })

      const context = await contextBuilder.buildContext('medium')

      expect(context).toBeDefined()
      expect(context.workouts).toEqual([])
      expect(context.meals).toEqual([])
      expect(context.weight.currentWeight).toBe(0)
    })
  })

  describe('formatContextForPrompt', () => {
    let mockContext: UserContext

    beforeEach(() => {
      mockContext = {
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
    })

    it('should format context into readable prompt text', () => {
      const prompt = contextBuilder.formatContextForPrompt(mockContext)

      expect(prompt).toContain('WORKOUT HISTORY')
      expect(prompt).toContain('NUTRITION LOG')
      expect(prompt).toContain('WEIGHT PROGRESS')
      expect(prompt).toContain('TASK COMPLETION')
      expect(prompt).toContain('USER PREFERENCES')
      
      expect(prompt).toContain('Push-ups')
      expect(prompt).toContain('Oatmeal')
      expect(prompt).toContain('70 kg')
      expect(prompt).toContain('vegetarian')
      expect(prompt).toContain('intermediate')
    })

    it('should include recent trends and patterns', () => {
      const prompt = contextBuilder.formatContextForPrompt(mockContext)

      expect(prompt).toContain('decreasing')
      expect(prompt).toContain('medium intensity')
      expect(prompt).toContain('productivity: medium')
      expect(prompt).toContain('streak: 7')
    })

    it('should format macros and nutrition data', () => {
      const prompt = contextBuilder.formatContextForPrompt(mockContext)

      expect(prompt).toContain('protein: 10g')
      expect(prompt).toContain('carbs: 50g')
      expect(prompt).toContain('fat: 5g')
      expect(prompt).toContain('300 calories')
    })

    it('should handle empty context gracefully', () => {
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

      const prompt = contextBuilder.formatContextForPrompt(emptyContext)

      expect(prompt).toBeTruthy()
      expect(prompt).toContain('No recent workouts')
      expect(prompt).toContain('No recent meals')
      expect(prompt).toContain('beginner')
    })

    it('should format prompt within 100ms for large context', () => {
      // Create large context with lots of data
      const largeContext: UserContext = {
        ...mockContext,
        workouts: Array(30).fill(mockContext.workouts[0]),
        meals: Array(30).fill(mockContext.meals[0]),
        weight: {
          ...mockContext.weight,
          entries: Array(30).fill({ date: '2025-01-16', weight: 70 })
        }
      }

      const startTime = Date.now()
      const prompt = contextBuilder.formatContextForPrompt(largeContext)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100)
      expect(prompt).toBeTruthy()
    })
  })

  describe('data aggregation', () => {
    it('should aggregate workout data with performance metrics', async () => {
      const workoutData = await contextBuilder['getWorkoutData']('medium')

      expect(workoutData).toBeDefined()
      expect(Array.isArray(workoutData)).toBe(true)
      
      if (workoutData.length > 0) {
        expect(workoutData[0]).toHaveProperty('date')
        expect(workoutData[0]).toHaveProperty('exercises')
        expect(workoutData[0]).toHaveProperty('duration')
        expect(workoutData[0]).toHaveProperty('intensity')
      }
    })

    it('should aggregate meal data with nutrition analysis', async () => {
      const mealData = await contextBuilder['getMealData']('medium')

      expect(mealData).toBeDefined()
      expect(Array.isArray(mealData)).toBe(true)
      
      if (mealData.length > 0) {
        expect(mealData[0]).toHaveProperty('date')
        expect(mealData[0]).toHaveProperty('type')
        expect(mealData[0]).toHaveProperty('foods')
        expect(mealData[0]).toHaveProperty('calories')
        expect(mealData[0]).toHaveProperty('macros')
      }
    })

    it('should aggregate weight data with trend analysis', async () => {
      const weightData = await contextBuilder['getWeightData']('medium')

      expect(weightData).toBeDefined()
      expect(weightData).toHaveProperty('currentWeight')
      expect(weightData).toHaveProperty('trend')
      expect(weightData).toHaveProperty('entries')
      expect(weightData).toHaveProperty('unit')
      expect(['increasing', 'decreasing', 'stable']).toContain(weightData.trend)
    })

    it('should aggregate task data with productivity patterns', async () => {
      const taskData = await contextBuilder['getTaskData']('medium')

      expect(taskData).toBeDefined()
      expect(Array.isArray(taskData)).toBe(true)
      
      if (taskData.length > 0) {
        expect(taskData[0]).toHaveProperty('completed')
        expect(taskData[0]).toHaveProperty('pending')
        expect(taskData[0]).toHaveProperty('overdue')
        expect(taskData[0]).toHaveProperty('productivity')
      }
    })
  })

  describe('error handling', () => {
    it('should handle store connection errors', async () => {
      // Mock store error
      vi.mocked(contextBuilder['getWorkoutData']).mockRejectedValueOnce(
        new Error('Store connection failed')
      )

      const context = await contextBuilder.buildContext('medium')

      // Should continue with other data sources
      expect(context).toBeDefined()
      expect(context.workouts).toEqual([])
      expect(context.meals).toBeDefined()
    })

    it('should handle data corruption gracefully', async () => {
      // Mock corrupted data
      vi.mocked(contextBuilder['getMealData']).mockResolvedValueOnce([] as never)

      const context = await contextBuilder.buildContext('medium')

      expect(context).toBeDefined()
      expect(context.meals).toEqual([])
    })

    it('should handle timeout scenarios', async () => {
      // Mock slow data source
      vi.mocked(contextBuilder['getWeightData']).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          currentWeight: 70,
          trend: 'stable',
          entries: [],
          unit: 'kg'
        }), 1000))
      )

      const startTime = Date.now()
      const context = await contextBuilder.buildContext('shallow')
      const endTime = Date.now()

      // Should timeout and use fallback
      expect(endTime - startTime).toBeLessThan(600)
      expect(context).toBeDefined()
    })
  })
})

describe('ContextBuilder - Task 6.3: Real Module Integration', () => {
  let contextBuilder: ContextBuilder
  
  beforeEach(() => {
    contextBuilder = new ContextBuilder()
    vi.clearAllMocks()
  })

  describe('Real Workout Data Integration', () => {
    it('should fetch actual workout data from workout store', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.workouts).toBeDefined()
      expect(context.workouts.length).toBeGreaterThan(0)
      expect(context.workouts[0]).toHaveProperty('exercises')
      expect(context.workouts[0]).toHaveProperty('duration')
      expect(context.workouts[0]).toHaveProperty('intensity')
      expect(context.workouts[0]).toHaveProperty('caloriesBurned')
    })

    it('should include workout performance metrics and trends', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.workouts).toBeDefined()
      // Should include performance trends, favorite exercises, progress metrics
      const workoutContext = context.workouts[0]
      expect(workoutContext).toHaveProperty('performanceMetrics')
      expect(workoutContext).toHaveProperty('progressTrend')
    })

    it('should respect depth parameter for workout data', async () => {
      // RED: This test should fail initially
      const shallowContext = await contextBuilder.buildContext('shallow')
      const deepContext = await contextBuilder.buildContext('deep')
      
      expect(shallowContext.workouts.length).toBeLessThanOrEqual(3)
      expect(deepContext.workouts.length).toBeGreaterThan(shallowContext.workouts.length)
    })
  })

  describe('Real Weight Data Integration', () => {
    it('should fetch actual weight data from weight store', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.weight).toBeDefined()
      expect(context.weight.currentWeight).toBeGreaterThan(0)
      expect(context.weight.entries).toBeDefined()
      expect(context.weight.trend).toMatch(/increasing|decreasing|stable/)
    })

    it('should include weight progress analysis and predictions', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.weight).toHaveProperty('progressAnalysis')
      expect(context.weight).toHaveProperty('predictedGoalDate')
      expect(context.weight).toHaveProperty('weeklyAverage')
      expect(context.weight).toHaveProperty('volatility')
    })

    it('should calculate weight trends and statistics', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.weight.trend).toBeDefined()
      expect(context.weight).toHaveProperty('changeRate')
      expect(context.weight).toHaveProperty('consistency')
    })
  })

  describe('Real Meal Data Integration', () => {
    it('should fetch actual meal data from meal store', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.meals).toBeDefined()
      expect(context.meals.length).toBeGreaterThan(0)
      expect(context.meals[0]).toHaveProperty('foods')
      expect(context.meals[0]).toHaveProperty('macros')
      expect(context.meals[0]).toHaveProperty('calories')
    })

    it('should include nutrition analysis and dietary patterns', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.meals[0]).toHaveProperty('nutritionScore')
      expect(context.meals[0]).toHaveProperty('dietaryPatterns')
      expect(context.meals[0]).toHaveProperty('healthMetrics')
    })

    it('should calculate macro ratios and calorie trends', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.meals[0].macros).toHaveProperty('proteinRatio')
      expect(context.meals[0].macros).toHaveProperty('carbRatio')
      expect(context.meals[0].macros).toHaveProperty('fatRatio')
    })
  })

  describe('Real Task Data Integration', () => {
    it('should fetch actual task data from tasks store', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.tasks).toBeDefined()
      expect(context.tasks.length).toBeGreaterThan(0)
      expect(context.tasks[0]).toHaveProperty('completed')
      expect(context.tasks[0]).toHaveProperty('pending')
      expect(context.tasks[0]).toHaveProperty('productivity')
    })

    it('should include productivity patterns and task analysis', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.tasks[0]).toHaveProperty('productivityPatterns')
      expect(context.tasks[0]).toHaveProperty('completionTrends')
      expect(context.tasks[0]).toHaveProperty('focusAreas')
    })

    it('should calculate task completion rates and streaks', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.tasks[0]).toHaveProperty('completionRate')
      expect(context.tasks[0]).toHaveProperty('currentStreak')
      expect(context.tasks[0]).toHaveProperty('longestStreak')
    })
  })

  describe('Cross-Module Data Correlation', () => {
    it('should identify correlations between workout and weight data', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context).toHaveProperty('correlations')
      expect(context.correlations).toHaveProperty('workoutWeightCorrelation')
    })

    it('should analyze nutrition and workout performance relationships', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.correlations).toHaveProperty('nutritionPerformanceCorrelation')
      expect(context.correlations).toHaveProperty('mealTimingImpact')
    })

    it('should identify productivity and health correlations', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      
      expect(context.correlations).toHaveProperty('healthProductivityCorrelation')
      expect(context.correlations).toHaveProperty('exerciseTaskCorrelation')
    })
  })

  describe('Performance and Error Handling', () => {
    it('should complete context building within 1s performance target', async () => {
      const startTime = Date.now()
      await contextBuilder.buildContext('deep')
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(1000) // <1s target for Task 6.3
    })

    it('should handle module data fetch failures gracefully', async () => {
      // Mock store failure
      vi.mocked(vi.fn()).mockRejectedValue(new Error('Store connection failed'))
      
      const context = await contextBuilder.buildContext('deep')
      
      // Should return partial context instead of failing completely
      expect(context).toBeDefined()
      expect(context.workouts).toBeDefined() // Should have fallback data
    })

    it('should provide relevant response verification', async () => {
      // RED: This test should fail initially
      const context = await contextBuilder.buildContext('deep')
      const prompt = contextBuilder.formatContextForPrompt(context)
      
      // Should contain real data, not mock data
      expect(prompt).not.toContain('Mock')
      expect(prompt).not.toContain('mock')
      expect(prompt).toContain('WORKOUT HISTORY')
      expect(prompt).toContain('WEIGHT PROGRESS')
      expect(prompt).toContain('NUTRITION LOG')
      expect(prompt).toContain('TASK COMPLETION')
    })
  })
}) 