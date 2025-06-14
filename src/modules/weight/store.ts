import { create } from 'zustand'
import { WeightEntry, WeightGoal, WeightGoalInput } from './types'
import { hybridWeightRepo, hybridWeightGoalRepo, initializeWeightDatabase } from './repo'
import { useAuthStore } from '@/modules/auth'

interface WeightState {
  weights: WeightEntry[]
  activeGoal: WeightGoal | null
  isLoading: boolean
  isGoalLoading: boolean
  error: string | null
  goalError: string | null

  // Weight actions
  addWeight: (entry: Omit<WeightEntry, 'id'>) => Promise<void>
  deleteWeight: (id: string) => Promise<void>
  loadWeights: () => Promise<void>
  clearWeights: () => Promise<void>

  // Goal actions
  setGoal: (goal: WeightGoalInput) => Promise<void>
  updateGoal: (id: string, goal: Partial<WeightGoalInput>) => Promise<void>
  loadActiveGoal: () => Promise<void>
  deactivateGoal: (id: string) => Promise<void>
}

export const useWeightStore = create<WeightState>((set) => ({
  weights: [],
  activeGoal: null,
  isLoading: false,
  isGoalLoading: false,
  error: null,
  goalError: null,

  addWeight: async (entry) => {
    try {
      set({ isLoading: true, error: null })

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      const newEntry = await hybridWeightRepo.addWeight(entry, userId)

      set((state) => ({
        weights: [newEntry, ...state.weights].sort(
          (a, b) =>
            new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
        ),
        isLoading: false,
      }))

      // Mark that weight was logged today (for notification logic)
      const today = new Date().toISOString().split('T')[0]
      if (newEntry.dateISO === today) {
        localStorage.setItem(`weight-logged-${today}`, 'true')
      }

      console.log('✅ Weight saved successfully:', { 
        local: true, 
        cloud: !!userId,
        entry: newEntry 
      })
    } catch (error) {
      console.error('❌ Failed to save weight:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to add weight',
        isLoading: false,
      })
      throw error
    }
  },

  deleteWeight: async (id) => {
    try {
      set({ isLoading: true, error: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridWeightRepo.deleteWeight(id, userId)

      set((state) => ({
        weights: state.weights.filter((w) => w.id !== id),
        isLoading: false,
      }))

      console.log('✅ Weight deleted successfully:', { id, cloud: !!userId })
    } catch (error) {
      console.error('❌ Failed to delete weight:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to delete weight',
        isLoading: false,
      })
      throw error
    }
  },

  loadWeights: async () => {
    try {
      set({ isLoading: true, error: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      // Initialize database for this user
      if (userId) {
        initializeWeightDatabase(userId)
      }

      const weights = await hybridWeightRepo.getAllWeights(userId)

      set({
        weights: weights.sort(
          (a, b) =>
            new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
        ),
        isLoading: false,
      })

      console.log('✅ Weights loaded successfully:', { 
        count: weights.length, 
        cloud: !!userId 
      })
    } catch (error) {
      console.error('❌ Failed to load weights:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load weights',
        isLoading: false,
      })
    }
  },

  clearWeights: async () => {
    try {
      set({ isLoading: true, error: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridWeightRepo.clearAll(userId)

      set({
        weights: [],
        isLoading: false,
      })

      console.log('✅ Weights cleared successfully')
    } catch (error) {
      console.error('❌ Failed to clear weights:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to clear weights',
        isLoading: false,
      })
      throw error
    }
  },

  // Goal management actions
  setGoal: async (goal) => {
    try {
      set({ isGoalLoading: true, goalError: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      const newGoal = await hybridWeightGoalRepo.addGoal(goal, userId)

      set({
        activeGoal: newGoal,
        isGoalLoading: false,
      })

      console.log('✅ Goal set successfully:', { 
        goal: newGoal, 
        cloud: !!userId 
      })
    } catch (error) {
      console.error('❌ Failed to set goal:', error)
      set({
        goalError: error instanceof Error ? error.message : 'Failed to set goal',
        isGoalLoading: false,
      })
      throw error
    }
  },

  updateGoal: async (id, goal) => {
    try {
      set({ isGoalLoading: true, goalError: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      const updatedGoal = await hybridWeightGoalRepo.updateGoal(id, goal, userId)

      set({
        activeGoal: updatedGoal,
        isGoalLoading: false,
      })

      console.log('✅ Goal updated successfully:', { 
        goal: updatedGoal, 
        cloud: !!userId 
      })
    } catch (error) {
      console.error('❌ Failed to update goal:', error)
      set({
        goalError: error instanceof Error ? error.message : 'Failed to update goal',
        isGoalLoading: false,
      })
      throw error
    }
  },

  loadActiveGoal: async () => {
    try {
      set({ isGoalLoading: true, goalError: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      const activeGoal = await hybridWeightGoalRepo.getActiveGoal(userId)

      set({
        activeGoal,
        isGoalLoading: false,
      })

      console.log('✅ Active goal loaded:', { 
        hasGoal: !!activeGoal, 
        cloud: !!userId 
      })
    } catch (error) {
      console.error('❌ Failed to load active goal:', error)
      set({
        goalError: error instanceof Error ? error.message : 'Failed to load goal',
        isGoalLoading: false,
      })
    }
  },

  deactivateGoal: async (id) => {
    try {
      set({ isGoalLoading: true, goalError: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridWeightGoalRepo.deactivateGoal(id, userId)

      set({
        activeGoal: null,
        isGoalLoading: false,
      })

      console.log('✅ Goal deactivated successfully:', { id, cloud: !!userId })
    } catch (error) {
      console.error('❌ Failed to deactivate goal:', error)
      set({
        goalError: error instanceof Error ? error.message : 'Failed to deactivate goal',
        isGoalLoading: false,
      })
      throw error
    }
  },
}))

// Initialize store hydration
export const initializeWeightStore = async () => {
  await useWeightStore.getState().loadWeights()
  await useWeightStore.getState().loadActiveGoal()
}
