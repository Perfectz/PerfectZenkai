// src/modules/daily-journal/__tests__/AIInsightGenerator.test.ts

import { describe, test, expect, beforeEach } from 'vitest'
import { AIInsightGenerator } from '../services/AIInsightGenerator'

describe('AIInsightGenerator', () => {
  let generator: AIInsightGenerator
  
  beforeEach(() => {
    generator = new AIInsightGenerator()
  })

  describe('Pattern Analysis', () => {
    test('should analyze productivity patterns from historical data', async () => {
      const historicalData = {
        standups: [
          { todayEnergyLevel: 8, todayMood: 'focused', date: '2024-01-15', createdAt: '2024-01-15T08:00:00Z' },
          { todayEnergyLevel: 6, todayMood: 'tired', date: '2024-01-16', createdAt: '2024-01-16T08:00:00Z' },
          { todayEnergyLevel: 9, todayMood: 'optimistic', date: '2024-01-17', createdAt: '2024-01-17T08:00:00Z' }
        ],
        reflections: [
          { satisfactionScore: 8, endEnergyLevel: 7, prioritiesCompleted: ['p1', 'p2'], date: '2024-01-15' },
          { satisfactionScore: 5, endEnergyLevel: 4, prioritiesCompleted: ['p1'], date: '2024-01-16' },
          { satisfactionScore: 9, endEnergyLevel: 8, prioritiesCompleted: ['p1', 'p2', 'p3'], date: '2024-01-17' }
        ]
      }

      const patterns = await generator.analyzePatterns(historicalData)
      
      expect(patterns.energyPatterns).toBeDefined()
      expect(patterns.energyPatterns.averageStartEnergy).toBeCloseTo(7.67, 1)
      expect(patterns.energyPatterns.averageEndEnergy).toBeCloseTo(6.33, 1)
      expect(patterns.energyPatterns.energyDeclineRate).toBeGreaterThan(0)
      
      expect(patterns.moodPatterns).toBeDefined()
      expect(patterns.moodPatterns.mostProductiveMoods).toContain('focused')
      expect(patterns.moodPatterns.leastProductiveMoods).toContain('tired')
      
      expect(patterns.productivityPatterns).toBeDefined()
      expect(patterns.productivityPatterns.averageCompletionRate).toBeCloseTo(0.67, 1)
      expect(patterns.productivityPatterns.peakPerformanceDays).toBeDefined()
    })

    test('should identify energy patterns throughout the day', async () => {
      const reflections = [
        {
          energyPeaks: [{ time: '10:00', intensity: 9 }, { time: '14:00', intensity: 7 }],
          energyDips: [{ time: '13:00', intensity: 4 }, { time: '16:00', intensity: 3 }],
          date: '2024-01-15'
        },
        {
          energyPeaks: [{ time: '09:00', intensity: 8 }, { time: '15:00', intensity: 6 }],
          energyDips: [{ time: '12:00', intensity: 5 }, { time: '17:00', intensity: 4 }],
          date: '2024-01-16'
        }
      ]

      const energyPatterns = generator.identifyEnergyPatterns(reflections)
      
      expect(energyPatterns.commonPeakTimes).toContain('10:00')
      expect(energyPatterns.commonDipTimes).toContain('13:00')
      expect(energyPatterns.optimalWorkingHours).toBeDefined()
      expect(energyPatterns.recommendedBreakTimes).toBeDefined()
    })

    test('should calculate mood-productivity correlations', async () => {
      const data = [
        { mood: 'optimistic', completionRate: 0.9, satisfactionScore: 9 },
        { mood: 'focused', completionRate: 0.8, satisfactionScore: 8 },
        { mood: 'tired', completionRate: 0.4, satisfactionScore: 5 },
        { mood: 'stressed', completionRate: 0.3, satisfactionScore: 4 }
      ]

      const correlations = generator.calculateMoodProductivityCorrelations(data)
      
      expect(correlations.strongPositiveCorrelations).toContain('optimistic')
      expect(correlations.strongPositiveCorrelations).toContain('focused')
      expect(correlations.negativeCorrelations).toContain('tired')
      expect(correlations.negativeCorrelations).toContain('stressed')
      expect(correlations.correlationStrength).toBeGreaterThan(0.7)
    })
  })

  describe('Goal Correlation', () => {
    test('should correlate journal data with goal achievement', async () => {
      const journalData = {
        consistentStandups: 0.85,
        averageSatisfaction: 7.5,
        goalLinkedPriorities: 0.7,
        completionRate: 0.75
      }

      const goalData = {
        totalGoals: 5,
        completedGoals: 3,
        progressRate: 0.8,
        averageGoalProgress: 0.65
      }

      const correlation = await generator.correlateWithGoals(journalData, goalData)
      
      expect(correlation.impactScore).toBeGreaterThan(0)
      expect(correlation.impactScore).toBeLessThanOrEqual(1)
      expect(correlation.keyFactors).toContain('consistent_standups')
      expect(correlation.keyFactors).toContain('goal_linked_priorities')
      expect(correlation.recommendations).toBeDefined()
      expect(correlation.recommendations.length).toBeGreaterThan(0)
    })

    test('should predict goal achievement likelihood', async () => {
      const currentPatterns = {
        dailyConsistency: 0.8,
        priorityAlignment: 0.75,
        energyManagement: 0.7,
        reflectionQuality: 0.85
      }

      const goalContext = {
        goalType: 'health',
        timeframe: 90, // days
        currentProgress: 0.4,
        requiredEffort: 'high'
      }

      const prediction = generator.predictGoalAchievementLikelihood(currentPatterns, goalContext)
      
      expect(prediction.likelihood).toBeGreaterThan(0)
      expect(prediction.likelihood).toBeLessThanOrEqual(1)
      expect(prediction.confidenceLevel).toBeGreaterThan(0)
      expect(prediction.keyRiskFactors).toBeDefined()
      expect(prediction.improvementSuggestions).toBeDefined()
    })
  })

  describe('Task Optimization', () => {
    test('should optimize task scheduling based on patterns', async () => {
      const standup = {
        todayPriorities: [
          { id: 'p1', description: 'Deep work task', estimatedTime: 120, importance: 5, urgency: 3 },
          { id: 'p2', description: 'Meeting prep', estimatedTime: 30, importance: 3, urgency: 5 },
          { id: 'p3', description: 'Code review', estimatedTime: 60, importance: 4, urgency: 2 }
        ],
        todayAvailableHours: 6,
        todayEnergyLevel: 8
      }

      const userPatterns = {
        peakEnergyTimes: ['09:00-11:00', '14:00-15:00'],
        lowEnergyTimes: ['13:00-14:00', '16:00-17:00'],
        taskTypePreferences: {
          'deep_work': { optimalTime: '09:00-11:00', energyRequired: 8 },
          'meetings': { optimalTime: '10:00-12:00', energyRequired: 6 },
          'admin': { optimalTime: '13:00-15:00', energyRequired: 4 }
        }
      }

      const optimization = await generator.optimizeTasks(standup, userPatterns)
      
      expect(optimization.recommendedSchedule).toBeDefined()
      expect(optimization.recommendedSchedule.length).toBe(3)
      expect(optimization.schedulingRationale).toBeDefined()
      expect(optimization.expectedProductivityGain).toBeGreaterThan(0)
      
      // Deep work should be scheduled during peak energy
      const deepWorkTask = optimization.recommendedSchedule.find(task => task.id === 'p1')
      expect(deepWorkTask?.recommendedTime).toMatch(/09:00|10:00|11:00/)
    })

    test('should handle task priority conflicts', async () => {
      const conflictingPriorities = [
        { id: 'p1', importance: 5, urgency: 5, estimatedTime: 180 },
        { id: 'p2', importance: 5, urgency: 5, estimatedTime: 120 },
        { id: 'p3', importance: 4, urgency: 5, estimatedTime: 90 }
      ]

      const availableTime = 300 // 5 hours

      const resolution = generator.resolvePriorityConflicts(conflictingPriorities, availableTime)
      
      expect(resolution.selectedTasks).toBeDefined()
      expect(resolution.deferredTasks).toBeDefined()
      expect(resolution.reasoning).toBeDefined()
      
      const totalSelectedTime = resolution.selectedTasks.reduce((sum, task) => sum + task.estimatedTime, 0)
      expect(totalSelectedTime).toBeLessThanOrEqual(availableTime)
    })
  })

  describe('Predictive Analysis', () => {
    test('should predict tomorrow performance', async () => {
      const todayData = {
        energyLevel: 8,
        mood: 'focused',
        completedPriorities: 3,
        satisfactionScore: 8,
        sleepQuality: 7,
        stressLevel: 3
      }

      const historicalAverage = {
        averageEnergyLevel: 7,
        averageCompletionRate: 0.7,
        averageSatisfaction: 7,
        moodTrendImpact: 0.15
      }

      const prediction = await generator.generatePredictions(todayData, historicalAverage)
      
      expect(prediction.tomorrowProductivity).toBeDefined()
      expect(prediction.tomorrowProductivity.expectedEnergyLevel).toBeGreaterThan(0)
      expect(prediction.tomorrowProductivity.expectedCompletionRate).toBeGreaterThan(0)
      expect(prediction.tomorrowProductivity.confidenceLevel).toBeGreaterThan(0)
      
      expect(prediction.weeklyTrends).toBeDefined()
      expect(prediction.recommendedAdjustments).toBeDefined()
    })

    test('should identify warning flags', async () => {
      const concerningPatterns = {
        consecutiveLowSatisfaction: 3,
        decreasingEnergyTrend: -1.5,
        increasingStressTrend: 2.0,
        goalProgressStagnation: 7 // days without progress
      }

      const warningFlags = generator.identifyWarningFlags(concerningPatterns)
      
      expect(warningFlags.length).toBeGreaterThan(0)
      expect(warningFlags).toContainEqual(
        expect.objectContaining({
          type: 'burnout_risk',
          severity: 'high',
          message: expect.any(String),
          recommendations: expect.any(Array)
        })
      )
    })
  })

  describe('Recommendation Engine', () => {
    test('should generate personalized recommendations', async () => {
      const userProfile = {
        workStyle: 'deep_focus',
        energyPattern: 'morning_person',
        preferredTaskTypes: ['creative', 'analytical'],
        challengeAreas: ['time_estimation', 'interruption_management']
      }

      const recentPatterns = {
        completionRate: 0.65,
        satisfactionTrend: 'declining',
        energyManagement: 'poor',
        goalAlignment: 'good'
      }

      const recommendations = await generator.generateRecommendations(userProfile, recentPatterns)
      
      expect(recommendations.goalRecommendations).toBeDefined()
      expect(recommendations.taskOptimizations).toBeDefined()
      expect(recommendations.scheduleAdjustments).toBeDefined()
      expect(recommendations.behaviorChanges).toBeDefined()
      
      // Should include specific recommendations for identified challenge areas
      const timeEstimationRec = recommendations.taskOptimizations.find(
        rec => rec.category === 'time_estimation'
      )
      expect(timeEstimationRec).toBeDefined()
    })

    test('should prioritize recommendations by impact', async () => {
      const mockRecommendations = [
        { id: 'r1', impact: 0.8, effort: 0.3, category: 'energy_management' },
        { id: 'r2', impact: 0.6, effort: 0.7, category: 'goal_setting' },
        { id: 'r3', impact: 0.9, effort: 0.2, category: 'scheduling' }
      ]

      const prioritized = generator.prioritizeRecommendations(mockRecommendations)
      
      expect(prioritized[0].id).toBe('r3') // Highest impact, lowest effort
      expect(prioritized[1].id).toBe('r1') // High impact, low effort
      expect(prioritized[2].id).toBe('r2') // Lower impact-to-effort ratio
    })
  })

  describe('Insight Synthesis', () => {
    test('should synthesize comprehensive daily insights', async () => {
      const standup = {
        id: 'standup-123',
        userId: 'user-123',
        date: '2024-01-15',
        todayEnergyLevel: 8,
        todayMood: 'focused',
        todayPriorities: [
          { id: 'p1', description: 'Complete feature', importance: 5, urgency: 4 }
        ]
      }

      const reflection = {
        id: 'reflection-123',
        standupId: 'standup-123',
        satisfactionScore: 8,
        prioritiesCompleted: ['p1'],
        endEnergyLevel: 6
      }

      const historicalData = {
        standups: Array(30).fill(null).map((_, i) => ({
          todayEnergyLevel: 7 + Math.random() * 2,
          todayMood: ['focused', 'optimistic', 'tired'][Math.floor(Math.random() * 3)],
          date: `2024-01-${i + 1}`
        })),
        reflections: Array(30).fill(null).map((_, i) => ({
          satisfactionScore: 6 + Math.random() * 3,
          endEnergyLevel: 6 + Math.random() * 2,
          date: `2024-01-${i + 1}`
        }))
      }

      const insights = await generator.generateDailyInsights(standup, reflection, historicalData)
      
      expect(insights.id).toBeDefined()
      expect(insights.userId).toBe('user-123')
      expect(insights.date).toBe('2024-01-15')
      expect(insights.generatedAt).toBeDefined()
      
      expect(insights.productivityPatterns).toBeDefined()
      expect(insights.energyPatterns).toBeDefined()
      expect(insights.moodPatterns).toBeDefined()
      
      expect(insights.goalRecommendations).toBeDefined()
      expect(insights.taskOptimizations).toBeDefined()
      expect(insights.scheduleAdjustments).toBeDefined()
      
      expect(insights.keyInsights).toBeDefined()
      expect(insights.keyInsights.length).toBeGreaterThan(0)
      
      expect(insights.tomorrowProductivity).toBeDefined()
      expect(insights.weeklyTrends).toBeDefined()
      expect(insights.goalAchievementLikelihood).toBeDefined()
    })

    test('should handle insufficient data gracefully', async () => {
      const limitedData = {
        standups: [{ todayEnergyLevel: 7, todayMood: 'focused', date: '2024-01-15' }],
        reflections: [{ satisfactionScore: 7, endEnergyLevel: 6, date: '2024-01-15' }]
      }

      const insights = await generator.generateDailyInsights(null, null, limitedData)
      
      expect(insights.keyInsights).toContain('More data needed for comprehensive analysis')
      expect(insights.tomorrowProductivity.confidenceLevel).toBeLessThan(0.5)
      expect(insights.warningFlags).toContainEqual(
        expect.objectContaining({
          type: 'insufficient_data',
          severity: 'low'
        })
      )
    })
  })

  describe('Performance', () => {
    test('should generate insights within performance threshold', async () => {
      const startTime = Date.now()
      
      const largeDataset = {
        standups: Array(100).fill(null).map((_, i) => ({
          todayEnergyLevel: Math.floor(Math.random() * 10) + 1,
          todayMood: ['focused', 'optimistic', 'tired', 'stressed'][Math.floor(Math.random() * 4)],
          date: `2024-01-${(i % 30) + 1}`
        })),
        reflections: Array(100).fill(null).map((_, i) => ({
          satisfactionScore: Math.floor(Math.random() * 10) + 1,
          endEnergyLevel: Math.floor(Math.random() * 10) + 1,
          date: `2024-01-${(i % 30) + 1}`
        }))
      }

      await generator.generateDailyInsights(null, null, largeDataset)
      
      const executionTime = Date.now() - startTime
      expect(executionTime).toBeLessThan(5000) // Less than 5 seconds
    })

    test('should cache frequently accessed patterns', async () => {
      const data = {
        standups: [{ todayEnergyLevel: 8, todayMood: 'focused', date: '2024-01-15' }],
        reflections: [{ satisfactionScore: 8, endEnergyLevel: 7, date: '2024-01-15' }]
      }

      // First call - should compute and cache
      const start1 = Date.now()
      await generator.analyzePatterns(data)
      const time1 = Date.now() - start1

      // Second call - should use cache
      const start2 = Date.now()
      await generator.analyzePatterns(data)
      const time2 = Date.now() - start2

      expect(time2).toBeLessThan(time1 * 0.5) // Should be significantly faster
    })
  })
}) 