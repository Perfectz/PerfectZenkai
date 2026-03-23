import { beforeEach, describe, expect, it, vi } from 'vitest'

import { exportAllData, getDataSummary, type AppDataExport } from './dataExport'

vi.mock('@/modules/weight/repo', () => ({
  weightRepo: {
    getAllWeights: vi.fn(),
  },
}))

vi.mock('@/modules/tasks/repositories/SimpleTodoRepo', () => ({
  simpleTodoRepo: {
    getAllTodos: vi.fn(),
  },
}))

vi.mock('@/modules/notes/repo', () => ({
  notesRepo: {
    getAllNotes: vi.fn(),
  },
}))

vi.mock('@/modules/meals/store', () => ({
  useMealStore: {
    getState: vi.fn(() => ({ meals: [] })),
  },
}))

vi.mock('@/modules/workout/store', () => ({
  useWorkoutStore: {
    getState: vi.fn(() => ({ workouts: [], exercises: [], templates: [], goals: [] })),
  },
}))

vi.mock('@/modules/journal/store', () => ({
  useJournalStore: {
    getState: vi.fn(() => ({ entries: [] })),
  },
}))

vi.mock('@/modules/auth', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ user: undefined })),
  },
}))

describe('Data Export Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('getDataSummary', () => {
    it('returns a summary from comprehensive export data', () => {
      const mockExportData: AppDataExport = {
        exportMetadata: {
          exportDate: '2024-01-15T10:00:00.000Z',
          exportVersion: '2.0.0',
          appVersion: '1.0.0',
          dataFormatVersion: '1.0.0',
          exportType: 'complete',
          totalRecords: 6,
          exportDurationMs: 120,
        },
        userProfile: {
          preferences: {
            units: 'metric',
            timezone: 'UTC',
            language: 'en-US',
          },
          demographics: {},
        },
        healthData: {
          weights: {
            entries: [
              { id: '1', kg: 75, dateISO: '2024-01-15' },
              { id: '2', kg: 76, dateISO: '2024-01-16' },
            ],
            goals: [],
            metadata: {
              totalEntries: 2,
              dateRange: { earliest: '2024-01-15', latest: '2024-01-16' },
              averageWeight: 75.5,
              weightTrend: 'stable',
              units: 'kg',
            },
          },
          meals: {
            entries: [],
            metadata: {
              totalEntries: 0,
              totalCalories: 0,
              averageDailyCalories: 0,
              macroBreakdown: { protein: 0, carbs: 0, fat: 0 },
              mealFrequency: {},
              dateRange: { earliest: '', latest: '' },
            },
          },
          workouts: {
            entries: [],
            exercises: [],
            templates: [],
            goals: [],
            metadata: {
              totalWorkouts: 0,
              totalDuration: 0,
              totalCalories: 0,
              averageIntensity: 0,
              favoriteExerciseType: 'None',
              currentStreak: 0,
              longestStreak: 0,
              dateRange: { earliest: '', latest: '' },
            },
          },
        },
        productivityData: {
          tasks: {
            entries: [
              {
                id: 't-1',
                summary: 'Test task',
                description: '',
                descriptionFormat: 'plaintext',
                done: false,
                priority: 'medium',
                category: 'personal',
                points: 5,
                subtasks: [],
                createdAt: '2024-01-15T10:00:00.000Z',
                updatedAt: '2024-01-15T10:00:00.000Z',
              },
            ],
            metadata: {
              totalTasks: 1,
              completedTasks: 0,
              completionRate: 0,
              averagePoints: 5,
              categoryBreakdown: { personal: 1 },
              priorityBreakdown: { medium: 1 },
              dateRange: {
                earliest: '2024-01-15T10:00:00.000Z',
                latest: '2024-01-15T10:00:00.000Z',
              },
            },
          },
          dailyStandups: {
            entries: [],
            metadata: {
              totalEntries: 0,
              averageEnergyLevel: 0,
              averageMotivationLevel: 0,
              averageAvailableHours: 0,
              commonMoods: {},
              dateRange: { earliest: '', latest: '' },
            },
          },
        },
        wellnessData: {
          journal: {
            entries: [],
            metadata: {
              totalEntries: 0,
              morningEntries: 0,
              eveningEntries: 0,
              averageMoodScore: 0,
              averageEnergyScore: 0,
              commonTags: {},
              dateRange: { earliest: '', latest: '' },
            },
          },
          notes: {
            entries: [
              {
                id: 'n-1',
                title: 'Note 1',
                content: 'Content 1',
                createdAt: '2024-01-15T10:00:00.000Z',
                updatedAt: '2024-01-15T10:00:00.000Z',
              },
              {
                id: 'n-2',
                title: 'Note 2',
                content: 'Content 2',
                createdAt: '2024-01-15T10:00:00.000Z',
                updatedAt: '2024-01-15T10:00:00.000Z',
              },
              {
                id: 'n-3',
                title: 'Note 3',
                content: 'Content 3',
                createdAt: '2024-01-15T10:00:00.000Z',
                updatedAt: '2024-01-15T10:00:00.000Z',
              },
            ],
            metadata: {
              totalNotes: 3,
              averageLength: 9,
              dateRange: {
                earliest: '2024-01-15T10:00:00.000Z',
                latest: '2024-01-15T10:00:00.000Z',
              },
            },
          },
        },
        aiInsights: {
          patterns: {
            mostActiveDay: 'Monday',
            mostProductiveTimeOfDay: 'Morning',
            correlations: [],
          },
          recommendations: [],
          dataQuality: {
            completeness: 85,
            consistency: 90,
            issues: [],
          },
        },
        dataIntegrity: {
          checksums: {},
          recordCounts: { weights: 2, tasks: 1, notes: 3 },
          validationErrors: [],
          warnings: [],
        },
      }

      const summary = getDataSummary(mockExportData)

      expect(summary.totalWeights).toBe(2)
      expect(summary.totalTasks).toBe(1)
      expect(summary.totalNotes).toBe(3)
      expect(summary.totalRecords).toBe(6)
      expect(summary.exportVersion).toBe('2.0.0')
      expect(summary.dataQualityScore).toBe(85)
    })
  })

  describe('exportAllData', () => {
    it('exports data from all repositories without touching IndexedDB', async () => {
      const { weightRepo } = await import('@/modules/weight/repo')
      const { simpleTodoRepo } = await import('@/modules/tasks/repositories/SimpleTodoRepo')
      const { notesRepo } = await import('@/modules/notes/repo')

      const mockWeights = [{ id: '1', kg: 75, dateISO: '2024-01-15' }]
      const mockTasks = [
        {
          id: '1',
          summary: 'Test task',
          description: '',
          descriptionFormat: 'plaintext' as const,
          done: false,
          priority: 'medium' as const,
          category: 'personal' as const,
          points: 5,
          subtasks: [],
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z',
        },
      ]
      const mockNotes = [
        {
          id: '1',
          title: 'Test note',
          content: 'Content',
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z',
        },
      ]

      vi.mocked(weightRepo.getAllWeights).mockResolvedValue(mockWeights)
      vi.mocked(simpleTodoRepo.getAllTodos).mockResolvedValue(mockTasks)
      vi.mocked(notesRepo.getAllNotes).mockResolvedValue(mockNotes)

      const result = await exportAllData()

      expect(result.exportMetadata.appVersion).toBe('1.0.0')
      expect(result.healthData.weights.entries).toEqual(mockWeights)
      expect(result.productivityData.tasks.entries).toEqual(mockTasks)
      expect(result.wellnessData.notes.entries).toEqual(mockNotes)
      expect(result.exportMetadata.totalRecords).toBe(3)
    })

    it('normalizes failures into a stable export error message', async () => {
      const { weightRepo } = await import('@/modules/weight/repo')
      vi.mocked(weightRepo.getAllWeights).mockRejectedValue(new Error('Database error'))

      await expect(exportAllData()).rejects.toThrow('Failed to export comprehensive app data')
    })
  })
})
