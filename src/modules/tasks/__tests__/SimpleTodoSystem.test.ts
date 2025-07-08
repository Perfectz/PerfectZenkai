// src/modules/tasks/__tests__/SimpleTodoSystem.test.ts
// Test the new simplified todo system

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSimpleTodoStore } from '../stores/SimpleTodoStore'
import { Priority, Category } from '../types'

// Mock the auth store
vi.mock('@/modules/auth', () => ({
  useAuthStore: {
    getState: () => ({
      user: { id: 'test-user-id' }
    })
  }
}))

// Mock Supabase client
vi.mock('@/lib/supabase-client', () => ({
  getSupabaseClient: vi.fn(() => null) // Return null to test local-only mode
}))

// Mock the entire repository
vi.mock('../repositories/SimpleTodoRepo', () => ({
  simpleTodoRepo: {
    addTodo: vi.fn().mockImplementation((todo) => Promise.resolve({
      ...todo,
      id: 'test-id-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    getAllTodos: vi.fn().mockResolvedValue([]),
    updateTodo: vi.fn().mockResolvedValue(undefined),
    deleteTodo: vi.fn().mockResolvedValue(undefined),
    getTodoById: vi.fn().mockResolvedValue(undefined),
    clearAll: vi.fn().mockResolvedValue(undefined),
    syncWithCloud: vi.fn().mockResolvedValue({ synced: 0, errors: 0 }),
  }
}))

describe('Simple Todo System', () => {
  beforeEach(() => {
    // Clear the store before each test
    useSimpleTodoStore.setState({
      todos: [],
      isLoading: false,
      error: null
    })
  })

  afterEach(() => {
    // Clean up after each test
    vi.clearAllMocks()
  })

  describe('Store', () => {
    it('should add a todo to the store', async () => {
      const store = useSimpleTodoStore.getState()
      
      const todoData = {
        summary: 'Test task',
        done: false,
        priority: 'medium' as Priority,
        category: 'other' as Category,
        points: 5,
        description: '',
        descriptionFormat: 'plaintext' as const,
        subtasks: [],
      }

      await store.addTodo(todoData)

      expect(store.todos).toHaveLength(1)
      expect(store.todos[0]).toMatchObject({
        ...todoData,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should toggle a todo', async () => {
      const store = useSimpleTodoStore.getState()
      
      const todoData = {
        summary: 'Test task',
        done: false,
        priority: 'medium' as Priority,
        category: 'other' as Category,
        points: 5,
        description: '',
        descriptionFormat: 'plaintext' as const,
        subtasks: [],
      }

      await store.addTodo(todoData)
      const todo = store.todos[0]

      await store.toggleTodo(todo.id)

      expect(store.todos[0].done).toBe(true)
    })

    it('should delete a todo from the store', async () => {
      const store = useSimpleTodoStore.getState()
      
      const todoData = {
        summary: 'Test task',
        done: false,
        priority: 'medium' as Priority,
        category: 'other' as Category,
        points: 5,
        description: '',
        descriptionFormat: 'plaintext' as const,
        subtasks: [],
      }

      await store.addTodo(todoData)
      const todo = store.todos[0]

      await store.deleteTodo(todo.id)

      expect(store.todos).toHaveLength(0)
    })

    it('should get overdue todos', async () => {
      const store = useSimpleTodoStore.getState()
      
      const overdueTodo = {
        summary: 'Overdue task',
        done: false,
        priority: 'medium' as Priority,
        category: 'other' as Category,
        points: 5,
        dueDate: '2020-01-01', // Past date
        description: '',
        descriptionFormat: 'plaintext' as const,
        subtasks: [],
      }

      const normalTodo = {
        summary: 'Normal task',
        done: false,
        priority: 'medium' as Priority,
        category: 'other' as Category,
        points: 5,
        dueDate: '2030-01-01', // Future date
        description: '',
        descriptionFormat: 'plaintext' as const,
        subtasks: [],
      }

      await store.addTodo(overdueTodo)
      await store.addTodo(normalTodo)

      const overdueTodos = store.getOverdueTodos()
      expect(overdueTodos).toHaveLength(1)
      expect(overdueTodos[0].summary).toBe('Overdue task')
    })

    it('should filter todos by category', async () => {
      const store = useSimpleTodoStore.getState()
      
      const workTodo = {
        summary: 'Work task',
        done: false,
        priority: 'medium' as Priority,
        category: 'work' as Category,
        points: 5,
        description: '',
        descriptionFormat: 'plaintext' as const,
        subtasks: [],
      }

      const personalTodo = {
        summary: 'Personal task',
        done: false,
        priority: 'medium' as Priority,
        category: 'personal' as Category,
        points: 5,
        description: '',
        descriptionFormat: 'plaintext' as const,
        subtasks: [],
      }

      await store.addTodo(workTodo)
      await store.addTodo(personalTodo)

      const workTodos = store.getTodosByCategory('work')
      expect(workTodos).toHaveLength(1)
      expect(workTodos[0].summary).toBe('Work task')
    })

    it('should handle loading states', async () => {
      const store = useSimpleTodoStore.getState()
      
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should clear errors', () => {
      const store = useSimpleTodoStore.getState()
      
      // Set an error
      useSimpleTodoStore.setState({ error: 'Test error' })
      
      // Clear the error
      store.clearError()
      
      expect(store.error).toBeNull()
    })
  })
}) 