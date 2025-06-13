import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTasksStore } from './store'
import { tasksRepo } from './repo'
import { Todo } from './types'

// Mock the repository
vi.mock('./repo', () => ({
  tasksRepo: {
    addTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    getAllTodos: vi.fn(),
    getTodoById: vi.fn(),
    clearAll: vi.fn(),
  }
}))

const mockTodo: Todo = {
  id: 'test-id-1',
  text: 'Test todo',
  done: false,
  priority: 'medium',
  category: 'personal',
  subtasks: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

const mockCompletedTodo: Todo = {
  id: 'test-id-2',
  text: 'Completed todo',
  done: true,
  priority: 'low',
  category: 'work',
  subtasks: [],
  createdAt: '2024-01-01T01:00:00.000Z',
  updatedAt: '2024-01-01T01:00:00.000Z'
}

describe('useTasksStore', () => {
  beforeEach(() => {
    // Reset store state
    useTasksStore.setState({
      todos: [],
      isLoading: false,
      error: null
    })
    
    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('addTodo', () => {
    it('should add a new todo successfully', async () => {
      const mockNewTodo = {
        text: 'New todo',
        done: false,
        priority: 'medium' as const,
        category: 'personal' as const,
        subtasks: [],
        createdAt: '2024-01-01T02:00:00.000Z'
      }

      vi.mocked(tasksRepo.addTodo).mockResolvedValue({
        id: 'new-id',
        updatedAt: '2024-01-01T02:00:00.000Z',
        ...mockNewTodo
      })

      const { addTodo } = useTasksStore.getState()
      await addTodo(mockNewTodo)

      const state = useTasksStore.getState()
      expect(state.todos).toHaveLength(1)
      expect(state.todos[0]).toEqual({
        id: 'new-id',
        ...mockNewTodo
      })
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when adding todo', async () => {
      const errorMessage = 'Failed to add todo'
      vi.mocked(tasksRepo.addTodo).mockRejectedValue(new Error(errorMessage))

      const { addTodo } = useTasksStore.getState()
      
      await expect(addTodo({
        text: 'Test',
        done: false,
        priority: 'medium',
        category: 'personal',
        subtasks: [],
        createdAt: '2024-01-01T00:00:00.000Z'
      })).rejects.toThrow(errorMessage)

      const state = useTasksStore.getState()
      expect(state.error).toBe(errorMessage)
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
        error: null
      })

      vi.mocked(tasksRepo.updateTodo).mockResolvedValue()

      const { updateTodo } = useTasksStore.getState()
      await updateTodo('test-id-1', { text: 'Updated text' })

      const state = useTasksStore.getState()
      expect(state.todos[0].text).toBe('Updated text')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when updating todo', async () => {
      useTasksStore.setState({ todos: [mockTodo] })
      
      const errorMessage = 'Failed to update todo'
      vi.mocked(tasksRepo.updateTodo).mockRejectedValue(new Error(errorMessage))

      const { updateTodo } = useTasksStore.getState()
      
      await expect(updateTodo('test-id-1', { text: 'New text' })).rejects.toThrow(errorMessage)

      const state = useTasksStore.getState()
      expect(state.error).toBe(errorMessage)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('deleteTodo', () => {
    it('should delete todo successfully', async () => {
      useTasksStore.setState({
        todos: [mockTodo, mockCompletedTodo],
        isLoading: false,
        error: null
      })

      vi.mocked(tasksRepo.deleteTodo).mockResolvedValue()

      const { deleteTodo } = useTasksStore.getState()
      await deleteTodo('test-id-1')

      const state = useTasksStore.getState()
      expect(state.todos).toHaveLength(1)
      expect(state.todos[0].id).toBe('test-id-2')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when deleting todo', async () => {
      useTasksStore.setState({ todos: [mockTodo] })
      
      const errorMessage = 'Failed to delete todo'
      vi.mocked(tasksRepo.deleteTodo).mockRejectedValue(new Error(errorMessage))

      const { deleteTodo } = useTasksStore.getState()
      
      await expect(deleteTodo('test-id-1')).rejects.toThrow(errorMessage)

      const state = useTasksStore.getState()
      expect(state.error).toBe(errorMessage)
      expect(state.isLoading).toBe(false)
      expect(state.todos).toHaveLength(1) // Todo should still be there
    })
  })

  describe('toggleTodo', () => {
    it('should toggle todo completion status', async () => {
      useTasksStore.setState({
        todos: [mockTodo],
        isLoading: false,
        error: null
      })

      vi.mocked(tasksRepo.updateTodo).mockResolvedValue()

      const { toggleTodo } = useTasksStore.getState()
      await toggleTodo('test-id-1')

      expect(tasksRepo.updateTodo).toHaveBeenCalledWith('test-id-1', { done: true })
    })

    it('should handle toggle for non-existent todo', async () => {
      const { toggleTodo } = useTasksStore.getState()
      await toggleTodo('non-existent-id')

      // Should not call repo if todo doesn't exist
      expect(tasksRepo.updateTodo).not.toHaveBeenCalled()
    })
  })

  describe('loadTodos', () => {
    it('should load todos successfully', async () => {
      const mockTodos = [mockTodo, mockCompletedTodo]
      vi.mocked(tasksRepo.getAllTodos).mockResolvedValue(mockTodos)

      const { loadTodos } = useTasksStore.getState()
      await loadTodos()

      const state = useTasksStore.getState()
      expect(state.todos).toEqual(mockTodos)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when loading todos', async () => {
      const errorMessage = 'Failed to load todos'
      vi.mocked(tasksRepo.getAllTodos).mockRejectedValue(new Error(errorMessage))

      const { loadTodos } = useTasksStore.getState()
      await loadTodos()

      const state = useTasksStore.getState()
      expect(state.error).toBe(errorMessage)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('hydrate', () => {
    it('should hydrate store by loading todos', async () => {
      const mockTodos = [mockTodo]
      vi.mocked(tasksRepo.getAllTodos).mockResolvedValue(mockTodos)

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