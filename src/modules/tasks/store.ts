import { create } from 'zustand'
import { Todo, TaskTemplate, Subtask, Priority, Category } from './types'
import { hybridTasksRepo, tasksRepo, initializeTasksDatabase } from './repo'
import { useAuthStore } from '@/modules/auth'
import { getSupabaseClient } from '@/lib/supabase-client'

interface TasksState {
  todos: Todo[]
  templates: TaskTemplate[]
  isLoading: boolean
  isSyncing: boolean
  error: string | null

  // Todo Actions
  addTodo: (todo: Omit<Todo, 'id' | 'updatedAt'>) => Promise<void>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  updateTodoField: (id: string, field: keyof Todo, value: unknown) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  loadTodos: () => Promise<void>
  refreshTodos: () => Promise<void>
  syncData: () => Promise<{ synced: number; errors: number }>

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

  // New actions
  getPointsStats: () => {
    dailyPoints: number
    weeklyPoints: number
    totalPoints: number
    totalPossiblePoints: number
    completedTasks: number
    totalTasks: number
    completionPercentage: number
    averageTaskPoints: number
  }
}

export const useTasksStore = create<TasksState>((set, get) => ({
  todos: [],
  templates: [],
  isLoading: false,
  isSyncing: false,
  error: null,

  // Todo Actions
  addTodo: async (todo) => {
    try {
      set({ isLoading: true, error: null })

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      // Add the missing fields for the repository
      const todoWithTimestamps = {
        ...todo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const newTodo = await hybridTasksRepo.addTodo(todoWithTimestamps, userId)

      set((state) => ({
        todos: [newTodo, ...state.todos],
        isLoading: false,
      }))

      console.log('✅ Todo saved successfully:', { 
        local: true, 
        cloud: !!userId,
        todo: newTodo 
      })
    } catch (error) {
      console.error('❌ Failed to save todo:', error)
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

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridTasksRepo.updateTodo(id, updates, userId)

      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id
            ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
            : todo
        ),
        isLoading: false,
      }))

      console.log('✅ Todo updated successfully:', { 
        local: true, 
        cloud: !!userId,
        id, updates 
      })
    } catch (error) {
      console.error('❌ Failed to update todo:', error)
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

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridTasksRepo.deleteTodo(id, userId)

      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
        isLoading: false,
      }))

      console.log('✅ Todo deleted successfully:', { 
        local: true, 
        cloud: !!userId,
        id 
      })
    } catch (error) {
      console.error('❌ Failed to delete todo:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to delete todo',
        isLoading: false,
      })
      throw error
    }
  },

  updateTodoField: async (id, field, value) => {
    try {
      const todo = get().todos.find(t => t.id === id)
      if (!todo) throw new Error('Todo not found')

      const now = new Date().toISOString()
      const updatedTodo = {
        ...todo,
        [field]: value,
        updatedAt: now
      }

      // Optimistic update
      set(state => ({
        todos: state.todos.map(t => t.id === id ? updatedTodo : t)
      }))

      // Prepare database update object
      const dbUpdate: Record<string, unknown> = {
        updated_at: now
      }

      // Map frontend fields to database columns
      switch (field) {
        case 'summary':
          dbUpdate.summary = value
          break
        case 'description':
          dbUpdate.description = value
          break
        case 'descriptionFormat':
          dbUpdate.description_format = value
          break
        case 'points':
          dbUpdate.points = value
          break
        case 'priority':
          dbUpdate.priority = value
          break
        case 'category':
          dbUpdate.category = value
          break
        case 'dueDateTime':
          dbUpdate.due_date_time = value
          break
        case 'done':
          dbUpdate.done = value
          if (value) {
            dbUpdate.completed_at = now
          } else {
            dbUpdate.completed_at = null
          }
          break
        default:
          console.warn(`Field ${field} not mapped for database update`)
          return
      }

             // Update in database
       const supabase = await getSupabaseClient()
       if (!supabase) throw new Error('Supabase client not available')
       const { error } = await supabase
         .from('todos')
         .update(dbUpdate)
         .eq('id', id)

      if (error) {
        // Rollback on error
        set(state => ({
          todos: state.todos.map(t => t.id === id ? todo : t)
        }))
        throw error
      }
    } catch (error) {
      console.error(`Failed to update todo ${field}:`, error)
      throw error
    }
  },

  toggleTodo: async (id: string) => {
    try {
      const todo = get().todos.find(t => t.id === id)
      if (!todo) throw new Error('Todo not found')

      const now = new Date().toISOString()
      const updates = {
        done: !todo.done,
        updatedAt: now
      }

      const updatedTodo = {
        ...todo,
        ...updates
      }

      // Optimistic update
      set(state => ({
        todos: state.todos.map(t => t.id === id ? updatedTodo : t)
      }))

      try {
        // Get current user for Supabase operations
        const user = useAuthStore.getState().user
        const userId = user?.id

        // Use hybrid repository pattern instead of direct Supabase calls
        await hybridTasksRepo.updateTodo(id, updates, userId)

        console.log('✅ Todo toggled successfully:', { 
          local: true, 
          cloud: !!userId,
          todoId: id, 
          done: updates.done 
        })
      } catch (repositoryError) {
        // Rollback on error
        set(state => ({
          todos: state.todos.map(t => t.id === id ? todo : t)
        }))
        throw repositoryError
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error)
      throw error
    }
  },

  loadTodos: async () => {
    try {
      set({ isLoading: true, error: null })

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      // Initialize database for this user
      if (userId) {
        initializeTasksDatabase(userId)
        
        // Only sync if not already syncing
        const { isSyncing } = get()
        if (!isSyncing) {
          try {
            set({ isSyncing: true })
            const syncResult = await hybridTasksRepo.syncData(userId)
            if (syncResult.synced > 0) {
              console.info(`🔄 Synced ${syncResult.synced} todo entries during load`)
            }
          } catch (syncError) {
            console.warn('⚠️ Data sync failed during load, continuing with available data:', syncError)
          } finally {
            set({ isSyncing: false })
          }
        }
      }

      const todos = await hybridTasksRepo.getAllTodos(userId)

      set({ todos, isLoading: false })

      console.log('✅ Todos loaded successfully:', { 
        count: todos.length,
        cloud: !!userId 
      })
    } catch (error) {
      console.error('❌ Failed to load todos:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to load todos',
        isLoading: false,
        isSyncing: false,
      })
    }
  },

  refreshTodos: async () => {
    try {
      await get().loadTodos()
    } catch (error) {
      console.error('❌ Failed to refresh todos:', error)
      throw error
    }
  },

  syncData: async () => {
    try {
      set({ isLoading: true, error: null })

      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

             const result = await hybridTasksRepo.syncData(userId)

       // If data was synced, reload the todos to reflect changes
       if (result.synced > 0) {
         await get().loadTodos()
       }

       set({ isLoading: false })

       console.log('✅ Data synced successfully:', { 
         local: true, 
         cloud: !!userId,
         result 
       })

       return result
    } catch (error) {
      console.error('❌ Failed to sync data:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to sync data',
        isLoading: false,
      })
      throw error
    }
  },

  // Subtask Actions
  addSubtask: async (todoId, subtaskText) => {
    try {
      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridTasksRepo.addSubtask(todoId, subtaskText, userId)

      // Refresh the specific todo
      const updatedTodo = await hybridTasksRepo.getTodoById(todoId, userId)
      if (updatedTodo) {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === todoId ? updatedTodo : todo
          ),
        }))
      }

      console.log('✅ Subtask added successfully:', { 
        local: true, 
        cloud: !!userId,
        todoId, subtaskText 
      })
    } catch (error) {
      console.error('❌ Failed to add subtask:', error)
      set({
        error: error instanceof Error ? error.message : 'Failed to add subtask',
      })
      throw error
    }
  },

  updateSubtask: async (todoId, subtaskId, updates) => {
    try {
      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridTasksRepo.updateSubtask(todoId, subtaskId, updates, userId)

      // Refresh the specific todo
      const updatedTodo = await hybridTasksRepo.getTodoById(todoId, userId)
      if (updatedTodo) {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === todoId ? updatedTodo : todo
          ),
        }))
      }

      console.log('✅ Subtask updated successfully:', { 
        local: true, 
        cloud: !!userId,
        todoId, subtaskId, updates 
      })
    } catch (error) {
      console.error('❌ Failed to update subtask:', error)
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update subtask',
      })
      throw error
    }
  },

  deleteSubtask: async (todoId, subtaskId) => {
    try {
      // Get current user for Supabase operations
      const user = useAuthStore.getState().user
      const userId = user?.id

      await hybridTasksRepo.deleteSubtask(todoId, subtaskId, userId)

      // Refresh the specific todo
      const updatedTodo = await hybridTasksRepo.getTodoById(todoId, userId)
      if (updatedTodo) {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === todoId ? updatedTodo : todo
          ),
        }))
      }

      console.log('✅ Subtask deleted successfully:', { 
        local: true, 
        cloud: !!userId,
        todoId, subtaskId 
      })
    } catch (error) {
      console.error('❌ Failed to delete subtask:', error)
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

  // New actions
  getPointsStats: () => {
    const todos = get().todos
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0]
    
    const completedTodos = todos.filter(t => t.done && t.completedAt)
    const todayCompleted = completedTodos.filter(t => 
      t.completedAt && t.completedAt.split('T')[0] === today
    )
    const weekCompleted = completedTodos.filter(t => 
      t.completedAt && t.completedAt.split('T')[0] >= weekStart
    )
    
    const totalEarnedPoints = completedTodos.reduce((sum, t) => sum + (t.points || 5), 0)
    const todayPoints = todayCompleted.reduce((sum, t) => sum + (t.points || 5), 0)
    const weekPoints = weekCompleted.reduce((sum, t) => sum + (t.points || 5), 0)
    const totalPossiblePoints = todos.reduce((sum, t) => sum + (t.points || 5), 0)
    
    return {
      dailyPoints: todayPoints,
      weeklyPoints: weekPoints,
      totalPoints: totalEarnedPoints,
      totalPossiblePoints,
      completedTasks: completedTodos.length,
      totalTasks: todos.length,
      completionPercentage: todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0,
      averageTaskPoints: todos.length > 0 ? Math.round(todos.reduce((sum, t) => sum + (t.points || 5), 0) / todos.length) : 0
    }
  }
}))

// Initialize store hydration
export const initializeTasksStore = async () => {
  await useTasksStore.getState().hydrate()
}
