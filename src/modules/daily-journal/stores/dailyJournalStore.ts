import { create } from 'zustand'
import { DailyJournalStore, DailyStandup, EveningReflection, ProgressAnalysis, CompletionPatterns, ProductivityPatterns } from '../types/standup.types'

export const useDailyJournalStore = create<DailyJournalStore>((set, get) => ({
  // State
  standups: [],
  reflections: [],
  currentStandup: null,
  currentReflection: null,
  isLoading: false,
  error: null,

  // Actions
  createStandup: async (data: Partial<DailyStandup>): Promise<DailyStandup> => {
    set({ isLoading: true, error: null })
    
    try {
      const standup: DailyStandup = {
        id: `standup-${Date.now()}`,
        userId: data.userId || 'default-user',
        date: data.date || new Date().toISOString().split('T')[0],
        yesterdayAccomplishments: data.yesterdayAccomplishments || [],
        yesterdayBlockers: data.yesterdayBlockers || [],
        yesterdayLessons: data.yesterdayLessons || '',
        todayPriorities: data.todayPriorities || [],
        todayEnergyLevel: data.todayEnergyLevel || 5,
        todayMood: data.todayMood || 'neutral',
        todayAvailableHours: data.todayAvailableHours || 8,
        todayFocusAreas: data.todayFocusAreas || [],
        currentChallenges: data.currentChallenges || [],
        neededResources: data.neededResources || [],
        motivationLevel: data.motivationLevel || 5,
        createdAt: new Date().toISOString(),
        completionTime: data.completionTime || 0
      }

      // Validate priorities
      standup.todayPriorities.forEach(priority => {
        if (priority.importance < 1 || priority.importance > 5) {
          throw new Error('Priority importance must be between 1 and 5')
        }
        if (priority.urgency < 1 || priority.urgency > 5) {
          throw new Error('Priority urgency must be between 1 and 5')
        }
      })

      set(state => ({
        standups: [...state.standups, standup],
        currentStandup: standup,
        isLoading: false
      }))

      return standup
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create standup'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateStandup: async (id: string, data: Partial<DailyStandup>): Promise<DailyStandup> => {
    set({ isLoading: true, error: null })
    
    try {
      const { standups } = get()
      const existingStandup = standups.find(s => s.id === id)
      if (!existingStandup) {
        throw new Error('Standup not found')
      }

      const updatedStandup = { ...existingStandup, ...data }
      
      set(state => ({
        standups: state.standups.map(s => s.id === id ? updatedStandup : s),
        currentStandup: state.currentStandup?.id === id ? updatedStandup : state.currentStandup,
        isLoading: false
      }))

      return updatedStandup
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update standup'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  getStandup: async (date: string): Promise<DailyStandup | null> => {
    const { standups } = get()
    return standups.find(s => s.date === date) || null
  },

  createReflection: async (data: Partial<EveningReflection>): Promise<EveningReflection> => {
    set({ isLoading: true, error: null })
    
    try {
      const reflection: EveningReflection = {
        id: `reflection-${Date.now()}`,
        userId: data.userId || 'default-user',
        date: data.date || new Date().toISOString().split('T')[0],
        standupId: data.standupId || '',
        prioritiesCompleted: data.prioritiesCompleted || [],
        prioritiesPartial: data.prioritiesPartial || [],
        prioritiesSkipped: data.prioritiesSkipped || [],
        unexpectedTasks: data.unexpectedTasks || [],
        goalProgress: data.goalProgress || [],
        goalBlockers: data.goalBlockers || [],
        goalInsights: data.goalInsights || '',
        endEnergyLevel: data.endEnergyLevel || 5,
        endMood: data.endMood || 'neutral',
        energyPeaks: data.energyPeaks || [],
        energyDips: data.energyDips || [],
        dayHighlights: data.dayHighlights || [],
        dayLowlights: data.dayLowlights || [],
        lessonsLearned: data.lessonsLearned || '',
        improvementAreas: data.improvementAreas || [],
        tomorrowPriorities: data.tomorrowPriorities || [],
        tomorrowConcerns: data.tomorrowConcerns || [],
        tomorrowOpportunities: data.tomorrowOpportunities || [],
        satisfactionScore: data.satisfactionScore || 5,
        createdAt: new Date().toISOString(),
        completionTime: data.completionTime || 0
      }

      set(state => ({
        reflections: [...state.reflections, reflection],
        currentReflection: reflection,
        isLoading: false
      }))

      return reflection
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create reflection'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateReflection: async (id: string, data: Partial<EveningReflection>): Promise<EveningReflection> => {
    set({ isLoading: true, error: null })
    
    try {
      const { reflections } = get()
      const existingReflection = reflections.find(r => r.id === id)
      if (!existingReflection) {
        throw new Error('Reflection not found')
      }

      const updatedReflection = { ...existingReflection, ...data }
      
      set(state => ({
        reflections: state.reflections.map(r => r.id === id ? updatedReflection : r),
        currentReflection: state.currentReflection?.id === id ? updatedReflection : state.currentReflection,
        isLoading: false
      }))

      return updatedReflection
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update reflection'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  getReflection: async (date: string): Promise<EveningReflection | null> => {
    const { reflections } = get()
    return reflections.find(r => r.date === date) || null
  },

  // Analytics
  analyzeProgress: (standup: DailyStandup, reflection: EveningReflection): ProgressAnalysis => {
    const totalPriorities = standup.todayPriorities.length
    const completedCount = reflection.prioritiesCompleted.length
    const partialCount = reflection.prioritiesPartial.length
    
    const completionRate = totalPriorities > 0 ? completedCount / totalPriorities : 0
    const partialCompletionRate = totalPriorities > 0 ? partialCount / totalPriorities : 0
    
    // Simple productivity score based on completion rate and satisfaction
    const totalProductivityScore = (completionRate * 0.6 + partialCompletionRate * 0.3 + reflection.satisfactionScore / 10 * 0.1) * 100
    
    return {
      completionRate,
      partialCompletionRate,
      totalProductivityScore,
      timeEstimationAccuracy: 0.8 // Placeholder
    }
  },

  getCompletionPatterns: (reflections: EveningReflection[]): CompletionPatterns => {
    if (reflections.length === 0) {
      return {
        averageCompletionRate: 0,
        consistencyScore: 0,
        trendDirection: 'stable',
        bestPerformanceDays: [],
        challengingDays: []
      }
    }

    const completionRates = reflections.map(r => {
      const totalPriorities = r.prioritiesCompleted.length + r.prioritiesPartial.length + r.prioritiesSkipped.length
      return totalPriorities > 0 ? r.prioritiesCompleted.length / totalPriorities : 0
    })

    const averageCompletionRate = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    
    // Simple consistency score based on variance
    const variance = completionRates.reduce((sum, rate) => sum + Math.pow(rate - averageCompletionRate, 2), 0) / completionRates.length
    const consistencyScore = Math.max(0, 1 - variance)

    return {
      averageCompletionRate,
      consistencyScore,
      trendDirection: 'stable', // Placeholder
      bestPerformanceDays: [],
      challengingDays: []
    }
  },

  getProductivityPatterns: (standups: DailyStandup[], reflections: EveningReflection[]): ProductivityPatterns => {
    const avgEnergyLevel = standups.length > 0 
      ? standups.reduce((sum, s) => sum + s.todayEnergyLevel, 0) / standups.length 
      : 5

    return {
      energyPatterns: {
        peakHours: ['09:00', '10:00'],
        lowHours: ['14:00', '15:00'],
        averageEnergyLevel: avgEnergyLevel
      },
      moodProductivityCorrelation: 0.7, // Placeholder
      optimalWorkingHours: 6,
      preferredTaskTypes: ['work', 'learning']
    }
  },

  // Utilities
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading })
}))

// Helper functions for service compatibility
export class DailyJournalService {
  calculateTotalEstimatedTime(priorities: Array<{ estimatedTime: number }>): number {
    return priorities.reduce((total, priority) => total + priority.estimatedTime, 0)
  }

  hasPriorityLinks(priority: { linkedGoalId?: string; linkedTaskIds: string[] }): boolean {
    return Boolean(priority.linkedGoalId || priority.linkedTaskIds.length > 0)
  }

  identifyCompletionPatterns(reflections: EveningReflection[]): CompletionPatterns {
    return useDailyJournalStore.getState().getCompletionPatterns(reflections)
  }

  calculateSatisfactionEnergyCorrelation(reflections: Array<{ satisfactionScore: number; endEnergyLevel: number }>): number {
    if (reflections.length < 2) return 0

    const n = reflections.length
    const sumSat = reflections.reduce((sum, r) => sum + r.satisfactionScore, 0)
    const sumEnergy = reflections.reduce((sum, r) => sum + r.endEnergyLevel, 0)
    const sumSatEnergy = reflections.reduce((sum, r) => sum + r.satisfactionScore * r.endEnergyLevel, 0)
    const sumSatSq = reflections.reduce((sum, r) => sum + r.satisfactionScore * r.satisfactionScore, 0)
    const sumEnergySq = reflections.reduce((sum, r) => sum + r.endEnergyLevel * r.endEnergyLevel, 0)

    const numerator = n * sumSatEnergy - sumSat * sumEnergy
    const denominator = Math.sqrt((n * sumSatSq - sumSat * sumSat) * (n * sumEnergySq - sumEnergy * sumEnergy))

    return denominator !== 0 ? numerator / denominator : 0
  }

  async analyzeProductivityPatterns(data: { standups: any[]; reflections: any[] }): Promise<ProductivityPatterns> {
    return useDailyJournalStore.getState().getProductivityPatterns(data.standups, data.reflections)
  }

  analyzeProgress(standup: DailyStandup, reflection: EveningReflection): ProgressAnalysis {
    return useDailyJournalStore.getState().analyzeProgress(standup, reflection)
  }

  async createStandup(data: Partial<DailyStandup>): Promise<DailyStandup> {
    return useDailyJournalStore.getState().createStandup(data)
  }
} 