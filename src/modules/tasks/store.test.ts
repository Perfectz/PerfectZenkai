import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTasksStore } from './store'
import { hybridTasksRepo } from './repo'
import { Todo } from './types'

// Mock the hybrid tasks repository
vi.mock('./repo', () => ({
  hybridTasksRepo: {
    addTodo: vi.fn(),
    deleteTodo: vi.fn(),
    getAllTodos: vi.fn(),
    getTodoById: vi.fn(),
    updateTodo: vi.fn(),
    addSubtask: vi.fn(),
    clearAll: vi.fn(),
  },
}))

const mockHybridTasksRepo = vi.mocked(hybridTasksRepo)

const mockTodo: Todo = {
  id: 'test-id-1',
  summary: 'Test todo',
  done: false,
  priority: 'medium',
  category: 'personal',
  subtasks: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}



describe('useTasksStore', () => {
  beforeEach(() => {
    // Reset store state
    useTasksStore.setState({
      todos: [],
      templates: [],
      isLoading: false,
      error: null,
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('addTodo', () => {
    it('should add todo to store and call repo', async () => {
      const mockTodo: Todo = {
        id: 'test-id',
        summary: 'Test todo',
        description: '',
        descriptionFormat: 'plaintext',
        done: false,
        priority: 'medium',
        category: 'personal',
        points: 5,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        subtasks: [],
      }

      mockHybridTasksRepo.addTodo.mockResolvedValue(mockTodo)

      const { addTodo } = useTasksStore.getState()

      const todoInput = {
        summary: 'Test todo',
        description: '',
        descriptionFormat: 'plaintext' as const,
        done: false,
        priority: 'medium' as const,
        category: 'personal' as const,
        points: 5,
        createdAt: '2024-01-15T10:00:00Z',
        subtasks: [],
      }

      await addTodo(todoInput)

      // Should call repo with todo input and user id
      expect(mockHybridTasksRepo.addTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          ...todoInput,
          createdAt: expect.any(String), // Dynamic timestamp
        }),
        undefined
      )

      // Should update store with new todo
      const state = useTasksStore.getState()
      expect(state.todos).toHaveLength(1)
      expect(state.todos[0]).toEqual(mockTodo)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when adding todo', async () => {
      const error = new Error('Failed to add todo')
      mockHybridTasksRepo.addTodo.mockRejectedValue(error)

      const { addTodo } = useTasksStore.getState()

      const todoInput = {
        summary: 'Test todo',
        description: '',
        descriptionFormat: 'plaintext' as const,
        done: false,
        priority: 'medium' as const,
        category: 'personal' as const,
        points: 5,
        createdAt: '2024-01-15T10:00:00Z',
        subtasks: [],
      }

      await expect(addTodo(todoInput)).rejects.toThrow('Failed to add todo')

      const state = useTasksStore.getState()
      expect(state.error).toBe('Failed to add todo')
      expect(state.isLoading).toBe(false)
      expect(state.todos).toHaveLength(0)
    })
  })

  describe('updateTodo', () => {
    it('should update todo successfully', async () => {
      // Set initial state
      useTasksStore.setState({
        todos: [mockTodo],
        isLoading: false,
        error: null,
      })

      vi.mocked(hybridTasksRepo.updateTodo).mockResolvedValue()

      const { updateTodo } = useTasksStore.getState()
      await updateTodo('test-id-1', { summary: 'Updated text' })

      const state = useTasksStore.getState()
      expect(state.todos[0].summary).toBe('Updated text')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when updating todo', async () => {
      useTasksStore.setState({ todos: [mockTodo] })

      const errorMessage = 'Failed to update todo'
      vi.mocked(hybridTasksRepo.updateTodo).mockRejectedValue(new Error(errorMessage))

      const { updateTodo } = useTasksStore.getState()

      await expect(
        updateTodo('test-id-1', { summary: 'New text' })
      ).rejects.toThrow(errorMessage)

      const state = useTasksStore.getState()
      expect(state.error).toBe(errorMessage)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('deleteTodo', () => {
    it('should remove todo from store and call repo', async () => {
      // Setup initial state with a todo
      const initialTodo: Todo = {
        id: 'test-id',
        summary: 'Test todo',
        description: '',
        descriptionFormat: 'plaintext',
        done: false,
        priority: 'medium',
        category: 'personal',
        points: 5,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        subtasks: [],
      }

      useTasksStore.setState({ todos: [initialTodo] })
      mockHybridTasksRepo.deleteTodo.mockResolvedValue()

      const { deleteTodo } = useTasksStore.getState()

      await deleteTodo('test-id')

      // Should call repo with correct id and user id
      expect(mockHybridTasksRepo.deleteTodo).toHaveBeenCalledWith('test-id', undefined)

      // Should remove todo from store
      const state = useTasksStore.getState()
      expect(state.todos).toHaveLength(0)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when deleting todo', async () => {
      const error = new Error('Failed to delete todo')
      mockHybridTasksRepo.deleteTodo.mockRejectedValue(error)

      const { deleteTodo } = useTasksStore.getState()

      await expect(deleteTodo('test-id')).rejects.toThrow('Failed to delete todo')

      const state = useTasksStore.getState()
      expect(state.error).toBe('Failed to delete todo')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('toggleTodo', () => {
    // ❌ RED PHASE: These tests will FAIL with current implementation
    it('should use hybridTasksRepo instead of direct Supabase calls', async () => {
      useTasksStore.setState({
        todos: [mockTodo],
        isLoading: false,
        error: null,
      })

      vi.mocked(hybridTasksRepo.updateTodo).mockResolvedValue()

      const { toggleTodo } = useTasksStore.getState()
      await toggleTodo('test-id-1')

      // Should use hybrid repo pattern, not direct Supabase
      expect(hybridTasksRepo.updateTodo).toHaveBeenCalledWith(
        'test-id-1',
        expect.objectContaining({
          done: true,
          updatedAt: expect.any(String)
        }),
        undefined // userId
      )
    })

    it('should NOT reference completed_at field (schema mismatch)', async () => {
      useTasksStore.setState({
        todos: [mockTodo],
        isLoading: false,
        error: null,
      })

      vi.mocked(hybridTasksRepo.updateTodo).mockResolvedValue()

      const { toggleTodo } = useTasksStore.getState()
      await toggleTodo('test-id-1')

      // Should NOT include completedAt field in updates
      const updateCall = vi.mocked(hybridTasksRepo.updateTodo).mock.calls[0]
      const updates = updateCall[1]
      
      expect(updates).not.toHaveProperty('completedAt')
      expect(updates).toHaveProperty('done', true)
      expect(updates).toHaveProperty('updatedAt')
    })

    it('should handle optimistic updates correctly', async () => {
      const initialTodo = { ...mockTodo, done: false }
      useTasksStore.setState({
        todos: [initialTodo],
        isLoading: false,
        error: null,
      })

      vi.mocked(hybridTasksRepo.updateTodo).mockResolvedValue()

      const { toggleTodo } = useTasksStore.getState()
      await toggleTodo('test-id-1')

      // State should be updated optimistically
      const state = useTasksStore.getState()
      expect(state.todos[0].done).toBe(true)
    })

    it('should rollback on repository error', async () => {
      const initialTodo = { ...mockTodo, done: false }
      useTasksStore.setState({
        todos: [initialTodo],
        isLoading: false,
        error: null,
      })

      const repositoryError = new Error('Repository failed')
      vi.mocked(hybridTasksRepo.updateTodo).mockRejectedValue(repositoryError)

      const { toggleTodo } = useTasksStore.getState()
      
      await expect(toggleTodo('test-id-1')).rejects.toThrow('Repository failed')

      // State should be rolled back to original
      const state = useTasksStore.getState()
      expect(state.todos[0].done).toBe(false) // Should be back to original
    })

    it('should handle toggle for non-existent todo gracefully', async () => {
      useTasksStore.setState({ todos: [] })

      const { toggleTodo } = useTasksStore.getState()
      
      await expect(toggleTodo('non-existent-id')).rejects.toThrow('Todo not found')

      // Should not call repo if todo doesn't exist
      expect(hybridTasksRepo.updateTodo).not.toHaveBeenCalled()
    })
  })

  describe('loadTodos', () => {
    it('should load todos from repo into store', async () => {
      const mockTodos: Todo[] = [
        {
          id: '1',
          summary: 'Todo 1',
          description: '',
          descriptionFormat: 'plaintext',
          done: false,
          priority: 'high',
          category: 'work',
          points: 8,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          subtasks: [],
        },
        {
          id: '2',
          summary: 'Todo 2',
          description: '',
          descriptionFormat: 'plaintext',
          done: true,
          priority: 'low',
          category: 'personal',
          points: 3,
          createdAt: '2024-01-14T10:00:00Z',
          updatedAt: '2024-01-14T10:00:00Z',
          subtasks: [],
        },
      ]

      mockHybridTasksRepo.getAllTodos.mockResolvedValue(mockTodos)

      const { loadTodos } = useTasksStore.getState()

      await loadTodos()

      expect(mockHybridTasksRepo.getAllTodos).toHaveBeenCalledWith(undefined)

      const state = useTasksStore.getState()
      expect(state.todos).toEqual(mockTodos)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when loading todos', async () => {
      const error = new Error('Failed to load todos')
      mockHybridTasksRepo.getAllTodos.mockRejectedValue(error)

      const { loadTodos } = useTasksStore.getState()

      await loadTodos()

      const state = useTasksStore.getState()
      expect(state.error).toBe('Failed to load todos')
      expect(state.isLoading).toBe(false)
      expect(state.todos).toHaveLength(0)
    })
  })

  describe('hydrate', () => {
    it('should hydrate store by loading todos', async () => {
      const mockTodos = [mockTodo]
      vi.mocked(hybridTasksRepo.getAllTodos).mockResolvedValue(mockTodos)

      const { hydrate } = useTasksStore.getState()
      await hydrate()

      const state = useTasksStore.getState()
      expect(state.todos).toEqual(mockTodos)
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      useTasksStore.setState({ error: 'Some error' })

      const { clearError } = useTasksStore.getState()
      clearError()

      const state = useTasksStore.getState()
      expect(state.error).toBeNull()
    })
  })
})
