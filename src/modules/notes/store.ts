import { create } from 'zustand'
import { Note } from './types'
import { notesRepo } from './repo'

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

      const now = new Date().toISOString()
      const newNote = await notesRepo.addNote({
        ...note,
        createdAt: now,
        updatedAt: now,
      })

      set((state) => ({
        notes: [newNote, ...state.notes],
        isLoading: false,
      }))
    } catch (error) {
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

      await notesRepo.updateNote(id, updates)

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
    } catch (error) {
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

      await notesRepo.deleteNote(id)

      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        isLoading: false,
      }))
    } catch (error) {
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

      const notes = await notesRepo.getAllNotes()

      set({ notes, isLoading: false })
    } catch (error) {
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
