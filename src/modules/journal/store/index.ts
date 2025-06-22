import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase'
import { 
  JournalEntry, 
  JournalEntryRow,
  MorningEntry, 
  EveningEntry, 
  JournalAnalytics, 
  JournalFormState 
} from '../types'
import { 
  transformEntryToRow, 
  transformRowToEntry, 
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
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // RLS is now enabled, so user_id filtering is handled automatically by the database
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: false })

      if (error) throw error
      
      const entries = (data || []).map((row: JournalEntryRow) => transformRowToEntry(row))
      set({ entries, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
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
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const rowData = transformEntryToRow(entry)
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{
          user_id: '', // TODO: Get from auth context
          entry_date: rowData.entry_date || new Date().toISOString().split('T')[0],
          entry_type: rowData.entry_type || 'both',
          morning_entry: rowData.morning_entry,
          evening_entry: rowData.evening_entry,
          created_at: rowData.created_at,
          updated_at: rowData.updated_at,
        }])
        .select()
        .single()

      if (error) throw error
      
      const newEntry = transformRowToEntry(data as JournalEntryRow)
      const { entries } = get()
      const updatedEntries = [newEntry, ...entries].sort((a, b) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      )
      
      set({ entries: updatedEntries, isLoading: false })
      
      // Recalculate analytics
      get().loadAnalytics()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Update existing journal entry
  updateEntry: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const rowData = transformEntryToRow(updates)
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          entry_date: rowData.entry_date,
          entry_type: rowData.entry_type,
          morning_entry: rowData.morning_entry,
          evening_entry: rowData.evening_entry,
          updated_at: rowData.updated_at,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      const updatedEntry = transformRowToEntry(data as JournalEntryRow)
      const { entries } = get()
      const updatedEntries = entries.map(entry => 
        entry.id === id ? updatedEntry : entry
      )
      
      set({ entries: updatedEntries, isLoading: false })
      
      // Recalculate analytics
      get().loadAnalytics()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Delete journal entry
  deleteEntry: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      const { entries } = get()
      const updatedEntries = entries.filter(entry => entry.id !== id)
      
      set({ entries: updatedEntries, isLoading: false })
      
      // Recalculate analytics
      get().loadAnalytics()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
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