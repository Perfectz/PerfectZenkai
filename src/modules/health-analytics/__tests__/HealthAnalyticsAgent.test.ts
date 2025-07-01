import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HealthAnalyticsAgent } from '../services/HealthAnalyticsAgent'
import { HealthDataAggregator } from '../services/HealthDataAggregator'
import { HealthCorrelationEngine } from '../services/HealthCorrelationEngine'
import { HealthPredictionEngine } from '../services/HealthPredictionEngine'
import { HealthRiskAssessment } from '../services/HealthRiskAssessment'

// Mock the dependencies
vi.mock('../services/HealthDataAggregator')
vi.mock('../services/HealthCorrelationEngine')
vi.mock('../services/HealthPredictionEngine')
vi.mock('../services/HealthRiskAssessment')

describe('HealthAnalyticsAgent - MVP-33 RED Phase Tests', () => {
  let healthAgent: HealthAnalyticsAgent
  let mockDataAggregator: vi.Mocked<HealthDataAggregator>
  let mockCorrelationEngine: vi.Mocked<HealthCorrelationEngine>
  let mockPredictionEngine: vi.Mocked<HealthPredictionEngine>
  let mockRiskAssessment: vi.Mocked<HealthRiskAssessment>

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Create mock instances
    mockDataAggregator = new HealthDataAggregator() as vi.Mocked<HealthDataAggregator>
    mockCorrelationEngine = new HealthCorrelationEngine() as vi.Mocked<HealthCorrelationEngine>
    mockPredictionEngine = new HealthPredictionEngine() as vi.Mocked<HealthPredictionEngine>
    mockRiskAssessment = new HealthRiskAssessment() as vi.Mocked<HealthRiskAssessment>
    
    // Create agent with mocked dependencies
    healthAgent = new HealthAnalyticsAgent(
      mockDataAggregator,
      mockCorrelationEngine,
      mockPredictionEngine,
      mockRiskAssessment
    )
  })

  // Additional Test Suite for Chat Integration
  describe('HealthAnalyticsAgent - Chat Integration', () => {
    let healthAgent: HealthAnalyticsAgent

    beforeEach(() => {
      healthAgent = new HealthAnalyticsAgent(
        mockDataAggregator,
        mockCorrelationEngine,
        mockPredictionEngine,
        mockRiskAssessment
      )
    })

  // 1. Health Dashboard & Data Aggregation Tests
  describe('Health Dashboard & Data Aggregation', () => {
    it('should aggregate data from all health modules', async () => {
      // RED Phase: This should fail - HealthAnalyticsAgent doesn't exist yet
      const userId = 'test-user-123'
      const timeframe = 'month'
      
      mockDataAggregator.aggregateHealthData.mockResolvedValue({
        weight: {
          current: 70,
          trend: 'decreasing',
          change: -2.5,
          entries: 15
        },
        nutrition: {
          averageCalories: 2100,
          proteinIntake: 120,
          hydration: 85,
          meals: 42
        },
        fitness: {
          workoutsPerWeek: 4,
          averageDuration: 45,
          caloriesBurned: 1800,
          activeMinutes: 280
        },
        wellness: {
          averageMood: 7.5,
          sleepQuality: 8.2,
          stressLevel: 4.1,
          journalEntries: 20
        }
      })

      const insights = await healthAgent.generateHealthInsights(userId, timeframe)

      expect(insights).toBeDefined()
      expect(insights.weight).toBeDefined()
      expect(insights.nutrition).toBeDefined()
      expect(insights.fitness).toBeDefined()
      expect(insights.wellness).toBeDefined()
      expect(insights.overallScore).toBeGreaterThan(0)
      expect(insights.recommendations.length).toBeGreaterThan(0)
    })

    it('should generate comprehensive health insights with trend analysis', async () => {
      // RED Phase: Should fail - insight generation not implemented
      const userId = 'test-user-456'
      const timeframe = 'quarter'

      const insights = await healthAgent.generateHealthInsights(userId, timeframe)

      expect(insights.trends).toBeDefined()
      expect(insights.trends.weight).toMatch(/improving|stable|declining/)
      expect(insights.trends.fitness).toMatch(/improving|stable|declining/)
      expect(insights.trends.nutrition).toMatch(/improving|stable|declining/)
      expect(insights.trends.wellness).toMatch(/improving|stable|declining/)
      expect(insights.keyInsights?.length || 0).toBeGreaterThan(2)
      expect(insights.actionableItems?.length || 0).toBeGreaterThan(1)
    })

    it('should calculate holistic health score', async () => {
      // RED Phase: Should fail - health scoring not implemented
      const userId = 'test-user-789'
      const timeframe = 'week'

      const insights = await healthAgent.generateHealthInsights(userId, timeframe)

      expect(insights.overallScore).toBeGreaterThanOrEqual(0)
      expect(insights.overallScore).toBeLessThanOrEqual(100)
      expect(insights.scoreBreakdown).toBeDefined()
      expect(insights.scoreBreakdown.weight).toBeGreaterThanOrEqual(0)
      expect(insights.scoreBreakdown.nutrition).toBeGreaterThanOrEqual(0)
      expect(insights.scoreBreakdown.fitness).toBeGreaterThanOrEqual(0)
      expect(insights.scoreBreakdown.wellness).toBeGreaterThanOrEqual(0)
    })

    it('should handle insufficient data gracefully', async () => {
      // RED Phase: Should fail - error handling not implemented
      const userId = 'new-user-001'
      const timeframe = 'month'

      mockDataAggregator.aggregateHealthData.mockResolvedValue({
        weight: null,
        nutrition: null,
        fitness: null,
        wellness: null
      })

      const insights = await healthAgent.generateHealthInsights(userId, timeframe)

      expect(insights.dataAvailability).toBeDefined()
      expect(insights.dataAvailability.sufficient).toBe(false)
      expect(insights.recommendations).toContain('Start tracking')
      expect(insights.overallScore).toBe(0)
    })
  })

  // 2. Correlation Analysis Tests
  describe('Health Correlation Analysis', () => {
    it('should identify correlations between health metrics', async () => {
      // RED Phase: Should fail - correlation analysis not implemented
      const healthData = {
        weight: [70, 69.5, 69, 68.8, 68.5],
        workouts: [3, 4, 5, 4, 5],
        mood: [6, 7, 8, 7, 8],
        sleep: [7, 8, 8, 7, 9],
        calories: [2000, 1900, 1800, 1850, 1750]
      }

      mockCorrelationEngine.analyzeCorrelations.mockResolvedValue({
        correlations: [
          {
            metric1: 'workouts',
            metric2: 'mood',
            correlation: 0.85,
            significance: 'strong',
            pValue: 0.02
          },
          {
            metric1: 'calories',
            metric2: 'weight',
            correlation: -0.72,
            significance: 'moderate',
            pValue: 0.04
          }
        ],
        insights: [
          'Strong positive correlation between workout frequency and mood',
          'Moderate negative correlation between calorie intake and weight'
        ]
      })

      const analysis = await healthAgent.analyzeCorrelations(healthData)

      expect(analysis.correlations.length).toBeGreaterThan(0)
      expect(analysis.correlations[0].correlation).toBeGreaterThan(-1)
      expect(analysis.correlations[0].correlation).toBeLessThan(1)
      expect(analysis.correlations[0].significance).toMatch(/weak|moderate|strong/)
      expect(analysis.insights.length).toBeGreaterThan(0)
    })

    it('should detect patterns across multiple health dimensions', async () => {
      // RED Phase: Should fail - pattern detection not implemented
      const healthData = {
        weeklyPatterns: {
          Monday: { mood: 6, energy: 5, workouts: 1 },
          Tuesday: { mood: 7, energy: 6, workouts: 1 },
          Wednesday: { mood: 8, energy: 7, workouts: 0 },
          Thursday: { mood: 7, energy: 6, workouts: 1 },
          Friday: { mood: 8, energy: 8, workouts: 0 },
          Saturday: { mood: 9, energy: 9, workouts: 1 },
          Sunday: { mood: 7, energy: 6, workouts: 0 }
        }
      }

      const analysis = await healthAgent.analyzeCorrelations(healthData)

      expect(analysis.patterns).toBeDefined()
      expect(analysis.patterns.weekly).toBeDefined()
      expect(analysis.patterns.bestDays.length).toBeGreaterThan(0)
      expect(analysis.patterns.challengingDays.length).toBeGreaterThan(0)
      expect(analysis.patterns.recommendations.length).toBeGreaterThan(0)
    })

    it('should perform statistical significance testing', async () => {
      // RED Phase: Should fail - statistical testing not implemented
      const healthData = {
        weight: Array.from({ length: 30 }, (_, i) => 75 - i * 0.1),
        workouts: Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 7))
      }

      const analysis = await healthAgent.analyzeCorrelations(healthData)

      expect(analysis.correlations).toBeDefined()
      analysis.correlations.forEach(correlation => {
        expect(correlation.pValue).toBeDefined()
        expect(correlation.pValue).toBeGreaterThanOrEqual(0)
        expect(correlation.pValue).toBeLessThanOrEqual(1)
        expect(correlation.significance).toMatch(/weak|moderate|strong|not significant/)
      })
    })
  })

  // 3. Predictive Modeling Tests
  describe('Health Prediction & Forecasting', () => {
    it('should forecast health trends and outcomes', async () => {
      // RED Phase: Should fail - predictive modeling not implemented
      const userId = 'test-user-predict'
      const metrics = ['weight', 'fitness', 'mood']

      mockPredictionEngine.predictHealthTrends.mockResolvedValue({
        predictions: [
          {
            metric: 'weight',
            currentValue: 70,
            predictedValue: 68,
            confidence: 0.85,
            timeframe: 'month',
            trend: 'decreasing'
          },
          {
            metric: 'fitness',
            currentValue: 4,
            predictedValue: 5,
            confidence: 0.78,
            timeframe: 'month',
            trend: 'improving'
          }
        ],
        insights: [
          'Weight loss trend likely to continue',
          'Fitness improvement expected with current routine'
        ]
      })

      const predictions = await healthAgent.predictHealthTrends(userId, metrics)

      expect(predictions.predictions.length).toBeGreaterThan(0)
      expect(predictions.predictions[0].confidence).toBeGreaterThan(0)
      expect(predictions.predictions[0].confidence).toBeLessThanOrEqual(1)
      expect(predictions.predictions[0].trend).toMatch(/improving|stable|declining/)
      expect(predictions.insights.length).toBeGreaterThan(0)
    })

    it('should identify potential health risks early', async () => {
      // RED Phase: Should fail - risk assessment not implemented
      const currentData = {
        weight: { current: 85, trend: 'increasing', rate: 0.5 },
        nutrition: { calories: 2800, protein: 60, fiber: 15 },
        fitness: { weeklyWorkouts: 1, averageDuration: 20 },
        wellness: { mood: 4, stress: 8, sleep: 5 }
      }

      mockRiskAssessment.assessHealthRisks.mockResolvedValue({
        riskLevel: 'moderate',
        risks: [
          {
            category: 'weight',
            risk: 'Weight gain trend',
            severity: 'moderate',
            likelihood: 0.7,
            recommendations: ['Increase physical activity', 'Monitor calorie intake']
          },
          {
            category: 'fitness',
            risk: 'Low activity level',
            severity: 'high',
            likelihood: 0.9,
            recommendations: ['Add 2 more workout sessions per week']
          }
        ],
        overallScore: 65
      })

      const riskAssessment = await healthAgent.assessHealthRisks(currentData)

      expect(riskAssessment.riskLevel).toMatch(/low|moderate|high/)
      expect(riskAssessment.risks.length).toBeGreaterThan(0)
      expect(riskAssessment.risks[0].severity).toMatch(/low|moderate|high/)
      expect(riskAssessment.risks[0].likelihood).toBeGreaterThan(0)
      expect(riskAssessment.risks[0].likelihood).toBeLessThanOrEqual(1)
      expect(riskAssessment.overallScore).toBeGreaterThan(0)
    })

    it('should estimate goal achievement probability', async () => {
      // RED Phase: Should fail - goal probability not implemented
      const userId = 'test-user-goals'
      const goals = [
        { type: 'weight', target: 65, current: 70, timeline: '3 months' },
        { type: 'fitness', target: 5, current: 3, timeline: '2 months' }
      ]

      const predictions = await healthAgent.predictHealthTrends(userId, ['weight', 'fitness'])

      expect(predictions.goalProbabilities).toBeDefined()
      expect(predictions.goalProbabilities).toHaveLength(2)
      predictions.goalProbabilities.forEach(prob => {
        expect(prob.probability).toBeGreaterThanOrEqual(0)
        expect(prob.probability).toBeLessThanOrEqual(1)
        expect(prob.confidence).toBeGreaterThan(0)
        expect(prob.recommendations.length).toBeGreaterThan(0)
      })
    })
  })

  // 4. Personalized Recommendations Tests
  describe('Personalized Health Recommendations', () => {
    it('should provide AI-driven health advice based on comprehensive data', async () => {
      // RED Phase: Should fail - recommendation engine not implemented
      const healthProfile = {
        age: 30,
        gender: 'female',
        goals: ['weight loss', 'fitness improvement'],
        preferences: ['morning workouts', 'vegetarian'],
        currentMetrics: {
          weight: 70,
          fitness: 6,
          nutrition: 7,
          wellness: 8
        },
        constraints: ['knee injury', 'busy schedule']
      }

      const recommendations = await healthAgent.provideRecommendations(healthProfile)

      expect(recommendations.nutrition.length).toBeGreaterThan(0)
      expect(recommendations.fitness.length).toBeGreaterThan(0)
      expect(recommendations.lifestyle.length).toBeGreaterThan(0)
      expect(recommendations.priority).toMatch(/high|medium|low/)
      expect(recommendations.timeline).toBeDefined()
      expect(recommendations.expectedOutcomes.length).toBeGreaterThan(0)
    })

    it('should adapt recommendations based on user progress', async () => {
      // RED Phase: Should fail - adaptive recommendations not implemented
      const healthProfile = {
        progressData: {
          weightLoss: { achieved: 3, target: 5, timeline: '2 months' },
          fitnessGain: { achieved: 1, target: 2, timeline: '1 month' }
        },
        adherence: {
          nutrition: 0.8,
          fitness: 0.6,
          wellness: 0.9
        }
      }

      const recommendations = await healthAgent.provideRecommendations(healthProfile)

      expect(recommendations.adaptations).toBeDefined()
      expect(recommendations.adaptations.fitness).toContain('increase')
      expect(recommendations.motivationalMessages.length).toBeGreaterThan(0)
      expect(recommendations.adjustedTimeline).toBeDefined()
    })

    it('should consider user constraints and preferences', async () => {
      // RED Phase: Should fail - constraint handling not implemented
      const healthProfile = {
        constraints: ['limited time', 'home workouts only', 'budget conscious'],
        preferences: ['quick meals', 'bodyweight exercises', 'evening activities'],
        lifestyle: {
          workSchedule: 'full-time',
          familyStatus: 'parent',
          travelFrequency: 'occasional'
        }
      }

      const recommendations = await healthAgent.provideRecommendations(healthProfile)

      expect(recommendations.nutrition.some(r => r.includes('quick'))).toBe(true)
      expect(recommendations.fitness.some(r => r.includes('home'))).toBe(true)
      expect(recommendations.timeline).toMatch(/flexible|structured/)
      expect(recommendations.alternatives.length).toBeGreaterThan(0)
    })
  })

  // 5. Integration & Performance Tests
  describe('Integration & Performance', () => {
    it('should integrate with all health modules', async () => {
      // RED Phase: Should fail - module integration not implemented
      const userId = 'integration-test-user'

      mockDataAggregator.getModuleData.mockImplementation((module) => {
        switch (module) {
          case 'weight':
            return Promise.resolve({ entries: 10, current: 70 })
          case 'meals':
            return Promise.resolve({ entries: 30, avgCalories: 2000 })
          case 'workouts':
            return Promise.resolve({ entries: 12, avgDuration: 45 })
          case 'journal':
            return Promise.resolve({ entries: 20, avgMood: 7 })
          default:
            return Promise.resolve(null)
        }
      })

      const insights = await healthAgent.generateHealthInsights(userId, 'month')

      expect(mockDataAggregator.getModuleData).toHaveBeenCalledWith('weight')
      expect(mockDataAggregator.getModuleData).toHaveBeenCalledWith('meals')
      expect(mockDataAggregator.getModuleData).toHaveBeenCalledWith('workouts')
      expect(mockDataAggregator.getModuleData).toHaveBeenCalledWith('journal')
      expect(insights.moduleIntegration).toBeDefined()
    })

    it('should generate insights within performance requirements', async () => {
      // RED Phase: Should fail - performance optimization not implemented
      const userId = 'performance-test-user'
      const startTime = Date.now()

      await healthAgent.generateHealthInsights(userId, 'year')

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within 5 seconds as per requirements
      expect(duration).toBeLessThan(5000)
    })

    it('should handle large datasets efficiently', async () => {
      // RED Phase: Should fail - large dataset handling not implemented
      const userId = 'large-data-user'
      const largeDataset = {
        weight: Array.from({ length: 365 }, (_, i) => ({ date: `2024-${String(i % 12 + 1).padStart(2, '0')}-${String(i % 28 + 1).padStart(2, '0')}`, value: 70 + Math.sin(i / 30) * 5 })),
        meals: Array.from({ length: 1000 }, (_, i) => ({ date: `2024-${String(i % 12 + 1).padStart(2, '0')}-${String(i % 28 + 1).padStart(2, '0')}`, calories: 2000 + Math.random() * 500 }))
      }

      mockDataAggregator.aggregateHealthData.mockResolvedValue(largeDataset)

      const insights = await healthAgent.generateHealthInsights(userId, 'year')

      expect(insights).toBeDefined()
      expect(insights.dataPoints).toBeGreaterThan(1000)
      expect(insights.processingTime).toBeLessThan(5000)
    })
  })

  // 6. Error Handling & Edge Cases
  describe('Error Handling & Edge Cases', () => {
    it('should handle missing data gracefully', async () => {
      // RED Phase: Should fail - error handling not implemented
      const userId = 'missing-data-user'

      mockDataAggregator.aggregateHealthData.mockRejectedValue(new Error('No data available'))

      const insights = await healthAgent.generateHealthInsights(userId, 'month')

      expect(insights.error).toBeDefined()
      expect(insights.recommendations).toContain('Start tracking your health data')
      expect(insights.overallScore).toBe(0)
    })

    it('should validate input parameters', async () => {
      // RED Phase: Should fail - input validation not implemented
      const invalidUserId = ''
      const invalidTimeframe = 'invalid-timeframe'

      await expect(
        healthAgent.generateHealthInsights(invalidUserId, invalidTimeframe)
      ).rejects.toThrow('Invalid parameters')
    })

    it('should handle API failures gracefully', async () => {
      // RED Phase: Should fail - API error handling not implemented
      const userId = 'api-failure-user'

      mockPredictionEngine.predictHealthTrends.mockRejectedValue(new Error('API unavailable'))

      const predictions = await healthAgent.predictHealthTrends(userId, ['weight'])

      expect(predictions.error).toBeDefined()
      expect(predictions.fallbackRecommendations.length).toBeGreaterThan(0)
      expect(predictions.retryAfter).toBeDefined()
    })
  })
})

// Additional Test Suite for Chat Integration
describe('HealthAnalyticsAgent - Chat Integration', () => {
  let healthAgent: HealthAnalyticsAgent

  beforeEach(() => {
    healthAgent = new HealthAnalyticsAgent()
  })

  it('should handle natural language health queries', async () => {
    // RED Phase: Should fail - chat integration not implemented
    const query = "How is my overall health trending this month?"
    const userId = 'chat-test-user'

    const response = await healthAgent.handleChatQuery(query, userId)

    expect(response.type).toBe('health-analysis')
    expect(response.insights.length).toBeGreaterThan(0)
    expect(response.visualizations).toBeDefined()
    expect(response.followUpQuestions.length).toBeGreaterThan(0)
  })

  it('should provide contextual health recommendations via chat', async () => {
    // RED Phase: Should fail - contextual chat not implemented
    const query = "I've been feeling tired lately, what might be causing this?"
    const userId = 'tired-user'

    const response = await healthAgent.handleChatQuery(query, userId)

    expect(response.type).toBe('diagnostic-assistance')
    expect(response.possibleCauses.length).toBeGreaterThan(0)
    expect(response.recommendations.length).toBeGreaterThan(0)
    expect(response.dataRequests).toBeDefined()
  })

  it('should support follow-up questions and context', async () => {
    // RED Phase: Should fail - conversation context not implemented
    const initialQuery = "Show me my fitness progress"
    const followUpQuery = "What about compared to last month?"
    const userId = 'context-test-user'

    const initialResponse = await healthAgent.handleChatQuery(initialQuery, userId)
    const followUpResponse = await healthAgent.handleChatQuery(followUpQuery, userId, initialResponse.context)

    expect(followUpResponse.contextAware).toBe(true)
    expect(followUpResponse.comparison).toBeDefined()
    expect(followUpResponse.relativeTrends.length).toBeGreaterThan(0)
  })
})