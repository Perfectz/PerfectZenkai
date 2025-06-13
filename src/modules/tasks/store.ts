import { create } from 'zustand'
import { Todo, TaskTemplate, Subtask, Priority, Category } from './types'
import { tasksRepo } from './repo'

interface TasksState {
  todos: Todo[]
  templates: TaskTemplate[]
  isLoading: boolean
  error: string | null

  // Todo Actions
  addTodo: (todo: Omit<Todo, 'id' | 'updatedAt'>) => Promise<void>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  loadTodos: () => Promise<void>

  // Subtask Actions
  addSubtask: (todoId: string, subtaskText: string) => Promise<void>
  updateSubtask: (
    todoId: string,
    subtaskId: string,
    updates: Partial<Subtask>
  ) => Promise<void>
  deleteSubtask: (todoId: string, subtaskId: string) => Promise<void>
  toggleSubtask: (todoId: string, subtaskId: string) => Promise<void>

  // Template Actions
  addTemplate: (template: Omit<TaskTemplate, 'id'>) => Promise<void>
  updateTemplate: (id: string, updates: Partial<TaskTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  loadTemplates: () => Promise<void>
  createTodoFromTemplate: (templateId: string) => Promise<void>

  // Utility Actions
  hydrate: () => Promise<void>
  clearError: () => void
  getOverdueTodos: () => Todo[]
  getTodosByCategory: (category: Category) => Todo[]
  getTodosByPriority: (priority: Priority) => Todo[]
}

export const useTasksStore = create<TasksState>((set, get) => ({
  todos: [],
  templates: [],
  isLoading: false,
  error: null,

  // Todo Actions
  addTodo: async (todo) => {
    try {
      set({ isLoading: true, error: null })

      const newTodo = await tasksRepo.addTodo(todo)

      set((state) => ({
        todos: [newTodo, ...state.todos],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add todo',
        isLoading: false,
      })
      throw error
    }
  },

  updateTodo: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })

      await tasksRepo.updateTodo(id, updates)

      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id
            ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
            : todo
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update todo',
        isLoading: false,
      })
      throw error
    }
  },

  deleteTodo: async (id) => {
    try {
      set({ isLoading: true, error: null })

      await tasksRepo.deleteTodo(id)

      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete todo',
        isLoading: false,
      })
      throw error
    }
  },

  toggleTodo: async (id) => {
    const todo = get().todos.find((t) => t.id === id)
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
        isLoading: false,
      })
    }
  },

  // Subtask Actions
  addSubtask: async (todoId, subtaskText) => {
    try {
      await tasksRepo.addSubtask(todoId, subtaskText)

      // Refresh the specific todo
      const updatedTodo = await tasksRepo.getTodoById(todoId)
      if (updatedTodo) {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === todoId ? updatedTodo : todo
          ),
        }))
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add subtask',
      })
      throw error
    }
  },

  updateSubtask: async (todoId, subtaskId, updates) => {
    try {
      await tasksRepo.updateSubtask(todoId, subtaskId, updates)

      // Refresh the specific todo
      const updatedTodo = await tasksRepo.getTodoById(todoId)
      if (updatedTodo) {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === todoId ? updatedTodo : todo
          ),
        }))
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update subtask',
      })
      throw error
    }
  },

  deleteSubtask: async (todoId, subtaskId) => {
    try {
      await tasksRepo.deleteSubtask(todoId, subtaskId)

      // Refresh the specific todo
      const updatedTodo = await tasksRepo.getTodoById(todoId)
      if (updatedTodo) {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === todoId ? updatedTodo : todo
          ),
        }))
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete subtask',
      })
      throw error
    }
  },

  toggleSubtask: async (todoId, subtaskId) => {
    try {
      const todo = get().todos.find((t) => t.id === todoId)
      if (!todo) return

      const subtask = todo.subtasks.find((s) => s.id === subtaskId)
      if (!subtask) return

      await get().updateSubtask(todoId, subtaskId, { done: !subtask.done })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to toggle subtask',
      })
      throw error
    }
  },

  // Template Actions
  addTemplate: async (template) => {
    try {
      set({ isLoading: true, error: null })

      const newTemplate = await tasksRepo.addTemplate(template)

      set((state) => ({
        templates: [newTemplate, ...state.templates],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to add template',
        isLoading: false,
      })
      throw error
    }
  },

  updateTemplate: async (id, updates) => {
    try {
      await tasksRepo.updateTemplate(id, updates)

      set((state) => ({
        templates: state.templates.map((template) =>
          template.id === id ? { ...template, ...updates } : template
        ),
      }))
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update template',
      })
      throw error
    }
  },

  deleteTemplate: async (id) => {
    try {
      await tasksRepo.deleteTemplate(id)

      set((state) => ({
        templates: state.templates.filter((template) => template.id !== id),
      }))
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete template',
      })
      throw error
    }
  },

  loadTemplates: async () => {
    try {
      const templates = await tasksRepo.getAllTemplates()
      set({ templates })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load templates',
      })
    }
  },

  createTodoFromTemplate: async (templateId) => {
    try {
      set({ isLoading: true, error: null })

      const newTodo = await tasksRepo.createTodoFromTemplate(templateId)

      set((state) => ({
        todos: [newTodo, ...state.todos],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create todo from template',
        isLoading: false,
      })
      throw error
    }
  },

  // Utility Actions
  hydrate: async () => {
    await Promise.all([get().loadTodos(), get().loadTemplates()])
  },

  clearError: () => {
    set({ error: null })
  },

  getOverdueTodos: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().todos.filter(
      (todo) => !todo.done && todo.dueDate && todo.dueDate < today
    )
  },

  getTodosByCategory: (category) => {
    return get().todos.filter((todo) => todo.category === category)
  },

  getTodosByPriority: (priority) => {
    return get().todos.filter((todo) => todo.priority === priority)
  },
}))

// Initialize store hydration
export const initializeTasksStore = async () => {
  await useTasksStore.getState().hydrate()
}
