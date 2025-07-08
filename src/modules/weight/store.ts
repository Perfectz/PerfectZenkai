import { create } from 'zustand'
import { WeightEntry, WeightGoal, WeightGoalInput } from './types'
import { hybridWeightRepo, hybridWeightGoalRepo, initializeWeightDatabase } from './repo'
import { useAuthStore } from '@/modules/auth'
import { debug, error as logError } from '@/shared/utils/logging'
import { offlineSyncService } from '@/shared/services/OfflineSyncService'

interface WeightState {
  weights: WeightEntry[]
  activeGoal: WeightGoal | null
  isLoading: boolean
  isGoalLoading: boolean
  error: string | null
  goalError: string | null

  // Weight actions
  addWeight: (entry: Omit<WeightEntry, 'id'>) => Promise<void>
  updateWeight: (id: string, updates: Partial<Omit<WeightEntry, 'id'>>) => Promise<void>
  deleteWeight: (id: string) => Promise<void>
  loadWeights: () => Promise<void>
  refreshWeights: () => Promise<void>
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

      set((state) => {
        // Check if we're updating an existing entry or adding a new one
        const existingIndex = state.weights.findIndex(w => w.dateISO === newEntry.dateISO)
        
        let updatedWeights
        if (existingIndex >= 0) {
          // Update existing entry
          updatedWeights = [...state.weights]
          updatedWeights[existingIndex] = newEntry
        } else {
          // Add new entry
          updatedWeights = [newEntry, ...state.weights]
        }

        return {
          weights: updatedWeights.sort(
            (a, b) =>
              new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
          ),
          isLoading: false,
        }
      })

      // Mark that weight was logged today (for notification logic)
      const today = new Date().toISOString().split('T')[0]
      if (newEntry.dateISO === today) {
        localStorage.setItem(`weight-logged-${today}`, 'true')
      }

      debug('Weight saved successfully:', { 
        local: true, 
        cloud: !!userId,
        entry: newEntry 
      })

      offlineSyncService.queueOperation({
        type: 'CREATE',
        table: 'weight_entries',
        data: newEntry,
        localId: newEntry.id,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logError('Failed to save weight:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to add weight',
        isLoading: false,
      })
      throw error
    }
  },

  updateWeight: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      const updatedEntry = await hybridWeightRepo.updateWeight(id, updates, userId)

      set((state) => ({
        weights: state.weights.map((w) => w.id === id ? updatedEntry : w).sort(
          (a, b) =>
            new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
        ),
        isLoading: false,
      }))

      debug('Weight updated successfully:', { 
        id, 
        updates, 
        cloud: !!userId,
        entry: updatedEntry 
      })

      offlineSyncService.queueOperation({
        type: 'UPDATE',
        table: 'weight_entries',
        data: updatedEntry,
        localId: updatedEntry.id,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logError('Failed to update weight:', error)
      
      // Provide more specific error handling
      let errorMessage = 'Failed to update weight'
      if (error instanceof Error) {
        if (error.message.includes('Weight entry not found')) {
          errorMessage = 'Weight entry not found. It may have been deleted or is out of sync.'
        } else if (error.message.includes('not found in cloud storage')) {
          errorMessage = 'Entry updated locally but failed to sync to cloud.'
        } else {
          errorMessage = error.message
        }
      }
      
      set({
        error: errorMessage,
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

      offlineSyncService.queueOperation({
        type: 'DELETE',
        table: 'weight_entries',
        data: { id },
        localId: id,
        timestamp: new Date().toISOString(),
      })
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
    const currentState = useWeightStore.getState()
    
    // Prevent concurrent loading attempts
    if (currentState.isLoading) {
      console.log('⏳ Weight loading already in progress, skipping...')
      return
    }

    try {
      set({ isLoading: true, error: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      console.log('🔄 Starting weight load for user:', userId || 'anonymous')

      // Initialize database for this user
      if (userId) {
        await initializeWeightDatabase(userId)
        
        
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
        cloud: !!userId,
        weightIds: weights.map(w => w.id).slice(0, 3) // Log first 3 IDs for debugging
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

  refreshWeights: async () => {
    try {
      set({ isLoading: true, error: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      // Force reload from source of truth (Supabase if available, otherwise local)
      const weights = await hybridWeightRepo.getAllWeights(userId)

      set({
        weights: weights.sort(
          (a, b) =>
            new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
        ),
        isLoading: false,
      })

      console.log('✅ Weights refreshed successfully:', { 
        count: weights.length, 
        cloud: !!userId 
      })
    } catch (error) {
      console.error('❌ Failed to refresh weights:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh weights',
        isLoading: false,
      })
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

      offlineSyncService.queueOperation({
        type: 'CREATE',
        table: 'weight_goals',
        data: newGoal,
        localId: newGoal.id,
        timestamp: new Date().toISOString(),
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

      offlineSyncService.queueOperation({
        type: 'UPDATE',
        table: 'weight_goals',
        data: updatedGoal,
        localId: updatedGoal.id,
        timestamp: new Date().toISOString(),
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
    const currentState = useWeightStore.getState()
    
    // Prevent concurrent loading attempts
    if (currentState.isGoalLoading) {
      console.log('⏳ Goal loading already in progress, skipping...')
      return
    }

    try {
      set({ isGoalLoading: true, goalError: null })

      const user = useAuthStore.getState().user
      const userId = user?.id

      console.log('🔄 Starting goal load for user:', userId || 'anonymous')

      const activeGoal = await hybridWeightGoalRepo.getActiveGoal(userId)

      set({
        activeGoal,
        isGoalLoading: false,
      })

      console.log('✅ Active goal loaded:', { 
        hasGoal: !!activeGoal, 
        cloud: !!userId,
        goalId: activeGoal?.id || 'N/A'
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

      offlineSyncService.queueOperation({
        type: 'UPDATE',
        table: 'weight_goals',
        data: { id, isActive: false },
        localId: id,
        timestamp: new Date().toISOString(),
      })
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
