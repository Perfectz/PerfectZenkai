import { describe, test, expect, beforeEach } from 'vitest'
import { DailyJournalService } from '../services/DailyJournalService'
import { DailyStandup, EveningReflection, Priority } from '../types/standup.types'

describe('DailyJournalService', () => {
  let service: DailyJournalService
  
  beforeEach(() => {
    service = new DailyJournalService()
  })

  describe('Standup Management', () => {
    test('should create daily standup with all required fields', async () => {
      const standupData: Partial<DailyStandup> = {
        userId: 'user-123',
        date: '2024-01-15',
        yesterdayAccomplishments: ['Completed project setup', 'Fixed critical bug'],
        yesterdayBlockers: ['API rate limiting'],
        yesterdayLessons: 'Need to implement retry logic',
        todayPriorities: [
          {
            id: 'priority-1',
            description: 'Implement user authentication',
            category: 'work',
            estimatedTime: 120,
            importance: 5,
            urgency: 4,
            linkedTaskIds: ['task-1', 'task-2']
          }
        ],
        todayEnergyLevel: 8,
        todayMood: 'optimistic',
        todayAvailableHours: 6,
        motivationLevel: 9
      }

      const standup = await service.createStandup(standupData)
      
      expect(standup.id).toBeDefined()
      expect(standup.userId).toBe('user-123')
      expect(standup.date).toBe('2024-01-15')
      expect(standup.createdAt).toBeDefined()
      expect(standup.todayPriorities).toHaveLength(1)
      expect(standup.todayPriorities[0].importance).toBe(5)
    })

    test('should validate priority importance and urgency ranges', async () => {
      const invalidPriority: Priority = {
        id: 'priority-1',
        description: 'Invalid priority',
        category: 'work',
        estimatedTime: 60,
        importance: 6, // Invalid: should be 1-5
        urgency: 0,    // Invalid: should be 1-5
        linkedTaskIds: []
      }

      const standupData = {
        userId: 'user-123',
        date: '2024-01-15',
        todayPriorities: [invalidPriority]
      }

      await expect(service.createStandup(standupData))
        .rejects.toThrow('Priority importance must be between 1 and 5')
    })

    test('should calculate estimated completion time for all priorities', async () => {
      const priorities: Priority[] = [
        { id: '1', description: 'Task 1', category: 'work', estimatedTime: 60, importance: 3, urgency: 2, linkedTaskIds: [] },
        { id: '2', description: 'Task 2', category: 'personal', estimatedTime: 90, importance: 4, urgency: 3, linkedTaskIds: [] }
      ]

      const totalTime = service.calculateTotalEstimatedTime(priorities)
      expect(totalTime).toBe(150) // 60 + 90 minutes
    })

    test('should link priorities to existing goals and tasks', async () => {
      const priority: Priority = {
        id: 'priority-1',
        description: 'Work on fitness goal',
        category: 'health',
        estimatedTime: 45,
        importance: 4,
        urgency: 3,
        linkedGoalId: 'goal-123',
        linkedTaskIds: ['task-456', 'task-789']
      }

      const isLinked = service.hasPriorityLinks(priority)
      expect(isLinked).toBe(true)
    })
  })

  describe('Reflection Processing', () => {
    test('should track progress against standup priorities', async () => {
      const standup: DailyStandup = {
        id: 'standup-1',
        userId: 'user-123',
        date: '2024-01-15',
        yesterdayAccomplishments: [],
        yesterdayBlockers: [],
        yesterdayLessons: '',
        todayPriorities: [
          { id: 'p1', description: 'Priority 1', category: 'work', estimatedTime: 60, importance: 5, urgency: 4, linkedTaskIds: [] },
          { id: 'p2', description: 'Priority 2', category: 'personal', estimatedTime: 30, importance: 3, urgency: 2, linkedTaskIds: [] }
        ],
        todayEnergyLevel: 8,
        todayMood: 'focused',
        todayAvailableHours: 6,
        todayFocusAreas: [],
        currentChallenges: [],
        neededResources: [],
        motivationLevel: 8,
        createdAt: new Date().toISOString(),
        completionTime: 120
      }

      const reflection: Partial<EveningReflection> = {
        userId: 'user-123',
        date: '2024-01-15',
        standupId: 'standup-1',
        prioritiesCompleted: ['p1'],
        prioritiesPartial: ['p2'],
        prioritiesSkipped: [],
        satisfactionScore: 7
      }

      const progressAnalysis = service.analyzeProgress(standup, reflection as EveningReflection)
      
      expect(progressAnalysis.completionRate).toBe(0.5) // 1 out of 2 completed
      expect(progressAnalysis.partialCompletionRate).toBe(0.5) // 1 out of 2 partial
      expect(progressAnalysis.totalProductivityScore).toBeGreaterThan(0)
    })

    test('should identify completion patterns over time', async () => {
      const historicalReflections: EveningReflection[] = [
        {
          id: '1', userId: 'user-123', date: '2024-01-13', standupId: 's1',
          prioritiesCompleted: ['p1', 'p2'], prioritiesPartial: [], prioritiesSkipped: [],
          unexpectedTasks: [], goalProgress: [], goalBlockers: [], goalInsights: '',
          endEnergyLevel: 6, endMood: 'satisfied', energyPeaks: [], energyDips: [],
          dayHighlights: [], dayLowlights: [], lessonsLearned: '', improvementAreas: [],
          tomorrowPriorities: [], tomorrowConcerns: [], tomorrowOpportunities: [],
          createdAt: '', completionTime: 0, satisfactionScore: 8
        },
        {
          id: '2', userId: 'user-123', date: '2024-01-14', standupId: 's2',
          prioritiesCompleted: ['p1'], prioritiesPartial: ['p2'], prioritiesSkipped: ['p3'],
          unexpectedTasks: [], goalProgress: [], goalBlockers: [], goalInsights: '',
          endEnergyLevel: 4, endMood: 'tired', energyPeaks: [], energyDips: [],
          dayHighlights: [], dayLowlights: [], lessonsLearned: '', improvementAreas: [],
          tomorrowPriorities: [], tomorrowConcerns: [], tomorrowOpportunities: [],
          createdAt: '', completionTime: 0, satisfactionScore: 5
        }
      ]

      const patterns = service.identifyCompletionPatterns(historicalReflections)
      
      expect(patterns.averageCompletionRate).toBeCloseTo(0.75) // (2+1)/(2+2) = 0.75
      expect(patterns.consistencyScore).toBeDefined()
      expect(patterns.trendDirection).toBeDefined()
    })

    test('should calculate satisfaction correlations', async () => {
      const reflections: EveningReflection[] = [
        { satisfactionScore: 8, endEnergyLevel: 7 } as EveningReflection,
        { satisfactionScore: 6, endEnergyLevel: 4 } as EveningReflection,
        { satisfactionScore: 9, endEnergyLevel: 8 } as EveningReflection
      ]

      const correlation = service.calculateSatisfactionEnergyCorrelation(reflections)
      expect(correlation).toBeGreaterThan(0.5) // Strong positive correlation expected
    })
  })

  describe('AI Insight Generation', () => {
    test('should identify productivity patterns from historical data', async () => {
      const mockHistoricalData = {
        standups: [
          { todayEnergyLevel: 8, todayMood: 'focused', date: '2024-01-15' },
          { todayEnergyLevel: 6, todayMood: 'tired', date: '2024-01-16' }
        ],
        reflections: [
          { satisfactionScore: 8, endEnergyLevel: 7, date: '2024-01-15' },
          { satisfactionScore: 5, endEnergyLevel: 4, date: '2024-01-16' }
        ]
      }

      const patterns = await service.analyzeProductivityPatterns(mockHistoricalData)
      
      expect(patterns.energyPatterns).toBeDefined()
      expect(patterns.moodProductivityCorrelation).toBeDefined()
      expect(patterns.optimalWorkingHours).toBeDefined()
    })

    test('should generate relevant recommendations based on patterns', async () => {
      const userPatterns = {
        highEnergyTimes: ['09:00', '10:00', '11:00'],
        lowEnergyTimes: ['14:00', '15:00'],
        mostProductiveMoods: ['focused', 'optimistic'],
        averageTaskCompletionRate: 0.75
      }

      const recommendations = service.generateRecommendations(userPatterns)
      
      expect(recommendations).toContain('Schedule deep work during 09:00-11:00')
      expect(recommendations).toContain('Take breaks during 14:00-15:00')
      expect(recommendations.length).toBeGreaterThan(0)
    })

    test('should predict tomorrow performance based on patterns', async () => {
      const todayData = {
        energyLevel: 8,
        mood: 'focused',
        completedPriorities: 3,
        satisfactionScore: 8
      }

      const historicalAverage = {
        averageEnergyLevel: 7,
        averageCompletionRate: 0.7,
        averageSatisfaction: 7
      }

      const prediction = service.predictTomorrowPerformance(todayData, historicalAverage)
      
      expect(prediction.productivityScore).toBeGreaterThan(0)
      expect(prediction.confidenceLevel).toBeGreaterThan(0)
      expect(prediction.recommendedFocus).toBeDefined()
    })

    test('should correlate journal data with goal achievement', async () => {
      const journalData = {
        consistentStandups: 0.8, // 80% completion rate
        averageSatisfaction: 7.5,
        goalLinkedPriorities: 0.6 // 60% of priorities linked to goals
      }

      const goalData = {
        totalGoals: 5,
        completedGoals: 3,
        progressRate: 0.75
      }

      const correlation = service.correlateJournalWithGoals(journalData, goalData)
      
      expect(correlation.impactScore).toBeGreaterThan(0)
      expect(correlation.recommendations).toBeDefined()
      expect(correlation.predictedGoalSuccess).toBeGreaterThan(0)
    })
  })

  describe('Data Validation', () => {
    test('should validate standup data completeness', () => {
      const incompleteStandup = {
        userId: 'user-123',
        // Missing required fields
      }

      const isValid = service.validateStandupData(incompleteStandup)
      expect(isValid.isValid).toBe(false)
      expect(isValid.errors).toContain('Missing required field: date')
    })

    test('should validate reflection data consistency', () => {
      const reflection = {
        prioritiesCompleted: ['p1', 'p2'],
        prioritiesPartial: ['p1'], // Inconsistent: p1 can't be both completed and partial
        prioritiesSkipped: []
      }

      const isValid = service.validateReflectionData(reflection)
      expect(isValid.isValid).toBe(false)
      expect(isValid.errors).toContain('Priority p1 cannot be both completed and partial')
    })
  })

  describe('Performance', () => {
    test('should generate insights within 5 seconds', async () => {
      const startTime = Date.now()
      
      const mockData = {
        standups: Array(30).fill(null).map((_, i) => ({ 
          id: `s${i}`, 
          date: `2024-01-${i + 1}`,
          todayEnergyLevel: Math.floor(Math.random() * 10) + 1
        })),
        reflections: Array(30).fill(null).map((_, i) => ({ 
          id: `r${i}`, 
          date: `2024-01-${i + 1}`,
          satisfactionScore: Math.floor(Math.random() * 10) + 1
        }))
      }

      await service.generateDailyInsights(mockData)
      
      const executionTime = Date.now() - startTime
      expect(executionTime).toBeLessThan(5000) // Less than 5 seconds
    })
  })
}) 