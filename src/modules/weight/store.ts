import { create } from 'zustand'
import { WeightEntry } from './types'
import { hybridWeightRepo } from './repo'
import { useAuthStore } from '@/modules/auth'

interface WeightState {
  weights: WeightEntry[]
  isLoading: boolean
  error: string | null

  // Actions
  addWeight: (entry: Omit<WeightEntry, 'id'>) => Promise<void>
  deleteWeight: (id: string) => Promise<void>
  loadWeights: () => Promise<void>
  hydrate: () => Promise<void>
  clearError: () => void
}

export const useWeightStore = create<WeightState>((set, get) => ({
  weights: [],
  isLoading: false,
  error: null,

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

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridWeightRepo.deleteWeight(id, userId)

      set((state) => ({
        weights: state.weights.filter((w) => w.id !== id),
        isLoading: false,
      }))

      console.log('✅ Weight deleted successfully:', { 
        local: true, 
        cloud: !!userId,
        id 
      })
    } catch (error) {
      console.error('❌ Failed to delete weight:', error)
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete weight',
        isLoading: false,
      })
      throw error
    }
  },

  loadWeights: async () => {
    try {
      set({ isLoading: true, error: null })

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      const weights = await hybridWeightRepo.getAllWeights(userId)

      set({ weights, isLoading: false })

      console.log('✅ Weights loaded successfully:', { 
        count: weights.length,
        source: userId ? 'Supabase' : 'Local',
        userId 
      })
    } catch (error) {
      console.error('❌ Failed to load weights:', error)
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load weights',
        isLoading: false,
      })
    }
  },

  hydrate: async () => {
    await get().loadWeights()
  },

  clearError: () => {
    set({ error: null })
  },
}))

// Initialize store hydration
export const initializeWeightStore = async () => {
  await useWeightStore.getState().hydrate()
}
