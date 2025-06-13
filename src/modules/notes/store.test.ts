import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNotesStore } from './store'
import { notesRepo } from './repo'
import { Note } from './types'

// Mock the notes repository
vi.mock('./repo', () => ({
  notesRepo: {
    addNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    getAllNotes: vi.fn(),
    getNoteById: vi.fn(),
    clearAll: vi.fn()
  }
}))

const mockNotesRepo = vi.mocked(notesRepo)

describe('Notes Store', () => {
  beforeEach(() => {
    // Reset store state
    useNotesStore.setState({
      notes: [],
      isLoading: false,
      error: null
    })
    
    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('addNote', () => {
    it('should add note to store and call repo', async () => {
      const mockNote: Note = {
        id: 'test-id',
        title: 'Test Note',
        content: 'Test content',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      }

      mockNotesRepo.addNote.mockResolvedValue(mockNote)

      const { addNote } = useNotesStore.getState()
      
      await addNote({
        title: 'Test Note',
        content: 'Test content',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      })

      // Should call repo with note without id
      expect(mockNotesRepo.addNote).toHaveBeenCalledWith({
        title: 'Test Note',
        content: 'Test content',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })

      // Should update store with new note
      const state = useNotesStore.getState()
      expect(state.notes).toHaveLength(1)
      expect(state.notes[0]).toEqual(mockNote)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when adding note', async () => {
      const error = new Error('Database error')
      mockNotesRepo.addNote.mockRejectedValue(error)

      const { addNote } = useNotesStore.getState()
      
      await expect(addNote({
        title: 'Test Note',
        content: 'Test content',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      })).rejects.toThrow('Database error')

      const state = useNotesStore.getState()
      expect(state.error).toBe('Database error')
      expect(state.isLoading).toBe(false)
      expect(state.notes).toHaveLength(0)
    })
  })

  describe('updateNote', () => {
    it('should update note in store and call repo', async () => {
      // Setup initial state with a note
      const initialNote: Note = {
        id: 'test-id',
        title: 'Test Note',
        content: 'Test content',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      }
      
      useNotesStore.setState({ notes: [initialNote] })
      mockNotesRepo.updateNote.mockResolvedValue()

      const { updateNote } = useNotesStore.getState()
      
      await updateNote('test-id', { title: 'Updated Note' })

      // Should call repo with correct id and updates
      expect(mockNotesRepo.updateNote).toHaveBeenCalledWith('test-id', {
        title: 'Updated Note'
      })

      // Should update note in store
      const state = useNotesStore.getState()
      expect(state.notes).toHaveLength(1)
      expect(state.notes[0].title).toBe('Updated Note')
      expect(state.notes[0].updatedAt).not.toBe(initialNote.updatedAt)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when updating note', async () => {
      const error = new Error('Update failed')
      mockNotesRepo.updateNote.mockRejectedValue(error)

      const { updateNote } = useNotesStore.getState()
      
      await expect(updateNote('test-id', { title: 'Updated Note' })).rejects.toThrow('Update failed')

      const state = useNotesStore.getState()
      expect(state.error).toBe('Update failed')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('deleteNote', () => {
    it('should remove note from store and call repo', async () => {
      // Setup initial state with a note
      const initialNote: Note = {
        id: 'test-id',
        title: 'Test Note',
        content: 'Test content',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      }
      
      useNotesStore.setState({ notes: [initialNote] })
      mockNotesRepo.deleteNote.mockResolvedValue()

      const { deleteNote } = useNotesStore.getState()
      
      await deleteNote('test-id')

      // Should call repo with correct id
      expect(mockNotesRepo.deleteNote).toHaveBeenCalledWith('test-id')

      // Should remove note from store
      const state = useNotesStore.getState()
      expect(state.notes).toHaveLength(0)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when deleting note', async () => {
      const error = new Error('Delete failed')
      mockNotesRepo.deleteNote.mockRejectedValue(error)

      const { deleteNote } = useNotesStore.getState()
      
      await expect(deleteNote('test-id')).rejects.toThrow('Delete failed')

      const state = useNotesStore.getState()
      expect(state.error).toBe('Delete failed')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('loadNotes', () => {
    it('should load notes from repo into store', async () => {
      const mockNotes: Note[] = [
        {
          id: '1',
          title: 'Note 1',
          content: 'Content 1',
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z'
        },
        {
          id: '2',
          title: 'Note 2',
          content: 'Content 2',
          createdAt: '2024-01-14T10:00:00.000Z',
          updatedAt: '2024-01-14T10:00:00.000Z'
        }
      ]

      mockNotesRepo.getAllNotes.mockResolvedValue(mockNotes)

      const { loadNotes } = useNotesStore.getState()
      
      await loadNotes()

      expect(mockNotesRepo.getAllNotes).toHaveBeenCalled()

      const state = useNotesStore.getState()
      expect(state.notes).toEqual(mockNotes)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when loading notes', async () => {
      const error = new Error('Load failed')
      mockNotesRepo.getAllNotes.mockRejectedValue(error)

      const { loadNotes } = useNotesStore.getState()
      
      await loadNotes()

      const state = useNotesStore.getState()
      expect(state.error).toBe('Load failed')
      expect(state.isLoading).toBe(false)
      expect(state.notes).toHaveLength(0)
    })
  })

  describe('hydrate', () => {
    it('should call loadNotes to hydrate store from repo', async () => {
      const mockNotes: Note[] = [
        {
          id: '1',
          title: 'Note 1',
          content: 'Content 1',
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z'
        }
      ]

      mockNotesRepo.getAllNotes.mockResolvedValue(mockNotes)

      const { hydrate } = useNotesStore.getState()
      
      await hydrate()

      expect(mockNotesRepo.getAllNotes).toHaveBeenCalled()

      const state = useNotesStore.getState()
      expect(state.notes).toEqual(mockNotes)
    })
  })

  describe('clearError', () => {
    it('should clear error from store', () => {
      // Set initial error state
      useNotesStore.setState({ error: 'Some error' })

      const { clearError } = useNotesStore.getState()
      clearError()

      const state = useNotesStore.getState()
      expect(state.error).toBeNull()
    })
  })
}) 