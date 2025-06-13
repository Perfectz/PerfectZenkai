import { create } from 'zustand'
import { Note } from './types'
import { hybridNotesRepo } from './repo'
import { useAuthStore } from '@/modules/auth'

interface NotesState {
  notes: Note[]
  isLoading: boolean
  error: string | null

  // Actions
  addNote: (note: Omit<Note, 'id'>) => Promise<void>
  updateNote: (id: string, updates: Partial<Omit<Note, 'id'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  loadNotes: () => Promise<void>
  hydrate: () => Promise<void>
  clearError: () => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,

  addNote: async (note) => {
    try {
      set({ isLoading: true, error: null })

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      const now = new Date().toISOString()
      const newNote = await hybridNotesRepo.addNote({
        ...note,
        createdAt: now,
        updatedAt: now,
      }, userId)

      set((state) => ({
        notes: [newNote, ...state.notes],
        isLoading: false,
      }))

      console.log('✅ Note saved successfully:', { 
        local: true, 
        cloud: !!userId,
        note: newNote 
      })
    } catch (error) {
      console.error('❌ Failed to save note:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to add note',
        isLoading: false,
      })
      throw error
    }
  },

  updateNote: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridNotesRepo.updateNote(id, updates, userId)

      set((state) => ({
        notes: state.notes
          .map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),
        isLoading: false,
      }))

      console.log('✅ Note updated successfully:', { 
        local: true, 
        cloud: !!userId,
        id, updates 
      })
    } catch (error) {
      console.error('❌ Failed to update note:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to update note',
        isLoading: false,
      })
      throw error
    }
  },

  deleteNote: async (id) => {
    try {
      set({ isLoading: true, error: null })

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridNotesRepo.deleteNote(id, userId)

      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        isLoading: false,
      }))

      console.log('✅ Note deleted successfully:', { 
        local: true, 
        cloud: !!userId,
        id 
      })
    } catch (error) {
      console.error('❌ Failed to delete note:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to delete note',
        isLoading: false,
      })
      throw error
    }
  },

  loadNotes: async () => {
    try {
      set({ isLoading: true, error: null })

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      const notes = await hybridNotesRepo.getAllNotes(userId)

      set({ notes, isLoading: false })

      console.log('✅ Notes loaded successfully:', { 
        count: notes.length,
        source: userId ? 'Supabase' : 'Local',
        userId 
      })
    } catch (error) {
      console.error('❌ Failed to load notes:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load notes',
        isLoading: false,
      })
    }
  },

  hydrate: async () => {
    await get().loadNotes()
  },

  clearError: () => {
    set({ error: null })
  },
}))

// Initialize store hydration
export const initializeNotesStore = async () => {
  await useNotesStore.getState().hydrate()
}
