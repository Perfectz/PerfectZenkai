import { create } from 'zustand'
import { offlineSyncService } from '@/shared/services/OfflineSyncService'
import { useAuthStore } from '@/modules/auth'
import { 
  JournalEntry, 
  MorningEntry, 
  EveningEntry, 
  JournalAnalytics, 
  JournalFormState 
} from '../types'
import { hybridJournalRepo, initializeJournalDatabase } from '../repo'
import { 
  getCurrentDateString, 
} from '../utils/journalHelpers'
import { calculateJournalAnalytics } from '../utils/analyticsCalculations'

interface JournalStore {
  // State
  entries: JournalEntry[]
  analytics: JournalAnalytics | null
  formState: JournalFormState
  isLoading: boolean
  error: string | null

  // Actions
  loadEntries: () => Promise<void>
  loadAnalytics: () => Promise<void>
  
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  
  // Entry management
  getEntryByDate: (date: string) => JournalEntry | null
  createOrUpdateMorningEntry: (date: string, morningEntry: MorningEntry) => Promise<void>
  createOrUpdateEveningEntry: (date: string, eveningEntry: EveningEntry) => Promise<void>
  
  // Form state management
  setSelectedDate: (date: string) => void
  setActiveTab: (tab: 'morning' | 'evening') => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  
  // Utility actions
  getTodayEntry: () => JournalEntry | null
  getRecentEntries: (limit?: number) => JournalEntry[]
  clearError: () => void
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  // Initial state
  entries: [],
  analytics: null,
  formState: {
    selectedDate: getCurrentDateString(),
    activeTab: 'morning',
    isDraft: false,
    hasUnsavedChanges: false,
  },
  isLoading: false,
  error: null,

  // Load all journal entries
  loadEntries: async () => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        if (userId) {
          initializeJournalDatabase(userId)
        }

        const entries = await hybridJournalRepo.getAllEntries(userId)
        set({ entries, isLoading: false })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to load journal entries (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load journal entries after multiple retries',
            isLoading: false,
          })
        }
      }
    }
  },

  // Load analytics
  loadAnalytics: async () => {
    const { entries } = get()
    if (entries.length === 0) {
      set({ analytics: null })
      return
    }

    try {
      const analytics = calculateJournalAnalytics(entries)
      set({ analytics })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  // Add new journal entry
  addEntry: async (entry) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        const newEntry = await hybridJournalRepo.addEntry(entry, userId)
        const { entries } = get()
        const updatedEntries = [newEntry, ...entries].sort((a, b) => 
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
        )
        
        set({ entries: updatedEntries, isLoading: false })
        
        // Recalculate analytics
        get().loadAnalytics()

        // Queue for offline sync
        offlineSyncService.queueOperation({
          type: 'CREATE',
          table: 'journal_entries',
          data: newEntry,
          localId: newEntry.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to add journal entry (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Update existing journal entry
  updateEntry: async (id, updates) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        const updatedEntry = await hybridJournalRepo.updateEntry(id, updates, userId)
        const { entries } = get()
        const updatedEntries = entries.map(entry => 
          entry.id === id ? updatedEntry : entry
        )
        
        set({ entries: updatedEntries, isLoading: false })
        
        // Recalculate analytics
        get().loadAnalytics()

        // Queue for offline sync
        offlineSyncService.queueOperation({
          type: 'UPDATE',
          table: 'journal_entries',
          data: updatedEntry,
          localId: updatedEntry.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to update journal entry (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Delete journal entry
  deleteEntry: async (id) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        await hybridJournalRepo.deleteEntry(id, userId)
        
        const { entries } = get()
        const updatedEntries = entries.filter(entry => entry.id !== id)
        
        set({ entries: updatedEntries, isLoading: false })
        
        // Recalculate analytics
        get().loadAnalytics()

        // Queue for offline sync
        offlineSyncService.queueOperation({
          type: 'DELETE',
          table: 'journal_entries',
          data: { id },
          localId: id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to delete journal entry (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Get entry by date
  getEntryByDate: (date) => {
    const { entries } = get()
    return entries.find(entry => entry.entryDate === date) || null
  },

  // Create or update morning entry
  createOrUpdateMorningEntry: async (date, morningEntry) => {
    const existingEntry = get().getEntryByDate(date)
    
    if (existingEntry) {
      // Update existing entry
      await get().updateEntry(existingEntry.id, {
        morningEntry,
        entryType: existingEntry.eveningEntry ? 'both' : 'morning'
      })
    } else {
      // Create new entry
      await get().addEntry({
        entryDate: date,
        entryType: 'morning',
        morningEntry,
      })
    }
  },

  // Create or update evening entry
  createOrUpdateEveningEntry: async (date, eveningEntry) => {
    const existingEntry = get().getEntryByDate(date)
    
    if (existingEntry) {
      // Update existing entry
      await get().updateEntry(existingEntry.id, {
        eveningEntry,
        entryType: existingEntry.morningEntry ? 'both' : 'evening'
      })
    } else {
      // Create new entry
      await get().addEntry({
        entryDate: date,
        entryType: 'evening',
        eveningEntry,
      })
    }
  },

  // Form state management
  setSelectedDate: (date) => {
    set(state => ({
      formState: { ...state.formState, selectedDate: date }
    }))
  },

  setActiveTab: (tab) => {
    set(state => ({
      formState: { ...state.formState, activeTab: tab }
    }))
  },

  setHasUnsavedChanges: (hasChanges) => {
    set(state => ({
      formState: { ...state.formState, hasUnsavedChanges: hasChanges }
    }))
  },

  // Utility functions
  getTodayEntry: () => {
    const today = getCurrentDateString()
    return get().getEntryByDate(today)
  },

  getRecentEntries: (limit = 7) => {
    const { entries } = get()
    return entries.slice(0, limit)
  },

  clearError: () => {
    set({ error: null })
  },
}))

// Selector hooks for better performance
export const useJournalEntries = () => useJournalStore(state => state.entries)
export const useJournalAnalytics = () => useJournalStore(state => state.analytics)
export const useJournalFormState = () => useJournalStore(state => state.formState)
export const useJournalLoading = () => useJournalStore(state => state.isLoading)
export const useJournalError = () => useJournalStore(state => state.error)

// Computed selectors
export const useTodayEntry = () => useJournalStore(state => state.getTodayEntry())
export const useRecentEntries = (limit?: number) => useJournalStore(state => state.getRecentEntries(limit))
export const useEntryByDate = (date: string) => useJournalStore(state => state.getEntryByDate(date))