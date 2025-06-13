import { create } from 'zustand'
import { Todo } from './types'
import { tasksRepo } from './repo'

interface TasksState {
  todos: Todo[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addTodo: (todo: Omit<Todo, 'id'>) => Promise<void>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  loadTodos: () => Promise<void>
  hydrate: () => Promise<void>
  clearError: () => void
}

export const useTasksStore = create<TasksState>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  addTodo: async (todo) => {
    try {
      set({ isLoading: true, error: null })
      
      const newTodo = await tasksRepo.addTodo(todo)
      
      set((state) => ({
        todos: [newTodo, ...state.todos],
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add todo',
        isLoading: false 
      })
      throw error
    }
  },

  updateTodo: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })
      
      await tasksRepo.updateTodo(id, updates)
      
      set((state) => ({
        todos: state.todos.map(todo => 
          todo.id === id ? { ...todo, ...updates } : todo
        ),
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update todo',
        isLoading: false 
      })
      throw error
    }
  },

  deleteTodo: async (id) => {
    try {
      set({ isLoading: true, error: null })
      
      await tasksRepo.deleteTodo(id)
      
      set((state) => ({
        todos: state.todos.filter(todo => todo.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete todo',
        isLoading: false 
      })
      throw error
    }
  },

  toggleTodo: async (id) => {
    const todo = get().todos.find(t => t.id === id)
    if (!todo) return
    
    await get().updateTodo(id, { done: !todo.done })
  },

  loadTodos: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const todos = await tasksRepo.getAllTodos()
      
      set({ todos, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load todos',
        isLoading: false 
      })
    }
  },

  hydrate: async () => {
    await get().loadTodos()
  },

  clearError: () => {
    set({ error: null })
  }
}))

// Initialize store hydration
export const initializeTasksStore = async () => {
  await useTasksStore.getState().hydrate()
} 