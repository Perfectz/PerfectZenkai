// src/modules/tasks/stores/SimpleTodoStore.ts
// Simplified todo store with clean state management

import { create } from 'zustand'
import { Todo, Priority, Category } from '../types'
import { simpleTodoRepo } from '../repositories/SimpleTodoRepo'

interface SimpleTodoState {
  todos: Todo[]
  isLoading: boolean
  error: string | null

  // Actions
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  loadTodos: () => Promise<void>
  syncWithCloud: () => Promise<{ synced: number; errors: number }>
  clearAll: () => Promise<void>
  clearError: () => void

  // Computed values
  getOverdueTodos: () => Todo[]
  getTodosByCategory: (category: Category) => Todo[]
  getTodosByPriority: (priority: Priority) => Todo[]
}

export const useSimpleTodoStore = create<SimpleTodoState>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  // Add a new todo
  addTodo: async (todo) => {
    try {
      set({ isLoading: true, error: null })

      const newTodo = await simpleTodoRepo.addTodo(todo)

      set((state) => ({
        todos: [newTodo, ...state.todos],
        isLoading: false,
      }))

      console.log('✅ Todo added successfully:', newTodo)
    } catch (error) {
      console.error('❌ Failed to add todo:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to add todo',
        isLoading: false,
      })
      throw error
    }
  },

  // Update a todo
  updateTodo: async (id: string, updates: Partial<Todo>) => {
    try {
      set({ isLoading: true, error: null })

      await simpleTodoRepo.updateTodo(id, updates)

      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, ...updates, updatedAt: new Date().toISOString() } : todo
        ),
        isLoading: false,
      }))

      console.log('✅ Todo updated successfully:', { id, updates })
    } catch (error) {
      console.error('❌ Failed to update todo:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to update todo',
        isLoading: false,
      })
      throw error
    }
  },

  // Delete a todo
  deleteTodo: async (id: string) => {
    try {
      set({ isLoading: true, error: null })

      await simpleTodoRepo.deleteTodo(id)

      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
        isLoading: false,
      }))

      console.log('✅ Todo deleted successfully:', { id })
    } catch (error) {
      console.error('❌ Failed to delete todo:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to delete todo',
        isLoading: false,
      })
      throw error
    }
  },

  // Toggle todo completion
  toggleTodo: async (id: string) => {
    const todo = get().todos.find((t) => t.id === id)
    if (!todo) return

    try {
      await get().updateTodo(id, { done: !todo.done })
    } catch (error) {
      console.error('❌ Failed to toggle todo:', error)
      throw error
    }
  },

  // Load all todos
  loadTodos: async () => {
    try {
      set({ isLoading: true, error: null })

      const todos = await simpleTodoRepo.getAllTodos()

      set({ todos, isLoading: false })

      console.log('✅ Todos loaded successfully:', { count: todos.length })
    } catch (error) {
      console.error('❌ Failed to load todos:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load todos',
        isLoading: false,
      })
      throw error
    }
  },

  // Sync with cloud
  syncWithCloud: async () => {
    try {
      set({ isLoading: true, error: null })

      const result = await simpleTodoRepo.syncWithCloud()

      // Reload todos after sync
      await get().loadTodos()

      set({ isLoading: false })

      console.log('✅ Cloud sync completed:', result)
      return result
    } catch (error) {
      console.error('❌ Failed to sync with cloud:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to sync with cloud',
        isLoading: false,
      })
      throw error
    }
  },

  // Clear all todos
  clearAll: async () => {
    try {
      set({ isLoading: true, error: null })

      await simpleTodoRepo.clearAll()

      set({ todos: [], isLoading: false })

      console.log('✅ All todos cleared successfully')
    } catch (error) {
      console.error('❌ Failed to clear todos:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to clear todos',
        isLoading: false,
      })
      throw error
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Computed values
  getOverdueTodos: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().todos.filter(
      (todo) => !todo.done && todo.dueDate && todo.dueDate < today
    )
  },

  getTodosByCategory: (category: Category) => {
    return get().todos.filter((todo) => todo.category === category)
  },

  getTodosByPriority: (priority: Priority) => {
    return get().todos.filter((todo) => todo.priority === priority)
  },
})) 