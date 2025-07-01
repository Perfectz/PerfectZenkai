import { create } from 'zustand'
import { Note } from './types'
import { hybridNotesRepo } from './repo'
import { useAuthStore } from '@/modules/auth'
import { offlineSyncService } from '@/shared/services/OfflineSyncService'

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
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
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

        offlineSyncService.queueOperation({
          type: 'CREATE',
          table: 'notes',
          data: newNote,
          localId: newNote.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to save note (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({
            error: error instanceof Error ? error.message : 'Failed to add note after multiple retries',
            isLoading: false,
          })
          throw error
        }
      }
    }
  },

  updateNote: async (id, updates) => {
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
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

        offlineSyncService.queueOperation({
          type: 'UPDATE',
          table: 'notes',
          data: { id, ...updates },
          localId: id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to update note (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({
            error: error instanceof Error ? error.message : 'Failed to update note after multiple retries',
            isLoading: false,
          })
          throw error
        }
      }
    }
  },

  deleteNote: async (id) => {
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
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

        offlineSyncService.queueOperation({
          type: 'DELETE',
          table: 'notes',
          data: { id },
          localId: id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to delete note (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete note after multiple retries',
            isLoading: false,
          })
          throw error
        }
      }
    }
  },

  loadNotes: async () => {
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
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
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to load notes (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({
            error: error instanceof Error ? error.message : 'Failed to load notes after multiple retries',
            isLoading: false,
          })
        }
      }
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
