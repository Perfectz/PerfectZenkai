import { create } from 'zustand'
import { WeightEntry } from './types'
import { weightRepo } from './repo'

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
      
      const newEntry = await weightRepo.addWeight(entry)
      
      set((state) => ({
        weights: [newEntry, ...state.weights].sort((a, b) => 
          new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
        ),
        isLoading: false
      }))

      // Mark that weight was logged today (for notification logic)
      const today = new Date().toISOString().split('T')[0]
      if (newEntry.dateISO === today) {
        localStorage.setItem(`weight-logged-${today}`, 'true')
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add weight',
        isLoading: false 
      })
      throw error
    }
  },

  deleteWeight: async (id) => {
    try {
      set({ isLoading: true, error: null })
      
      await weightRepo.deleteWeight(id)
      
      set((state) => ({
        weights: state.weights.filter(w => w.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete weight',
        isLoading: false 
      })
      throw error
    }
  },

  loadWeights: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const weights = await weightRepo.getAllWeights()
      
      set({ weights, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load weights',
        isLoading: false 
      })
    }
  },

  hydrate: async () => {
    await get().loadWeights()
  },

  clearError: () => {
    set({ error: null })
  }
}))

// Initialize store hydration
export const initializeWeightStore = async () => {
  await useWeightStore.getState().hydrate()
} 