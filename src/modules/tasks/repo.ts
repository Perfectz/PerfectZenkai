import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { Todo, TaskTemplate, Subtask, Priority, Category } from './types'
import { getSupabaseClient } from '@/lib/supabase-client'
import { deduplicateTodos, removeDuplicateContent } from './utils/deduplicationHelpers'

class TasksDatabase extends Dexie {
  todos!: Table<Todo>
  templates!: Table<TaskTemplate>

  constructor(userId?: string) {
    // Create user-specific database name
    const dbName = userId ? `TasksDatabase_${userId}` : 'TasksDatabase'
    super(dbName)
    this.version(31).stores({
      todos:
        'id, text, done, priority, category, dueDate, createdAt, updatedAt',
      templates: 'id, name, createdAt',
    })
  }
}

// Global database instance - will be reinitialized per user
let db: TasksDatabase

// Initialize database for specific user
export const initializeTasksDatabase = (userId: string) => {
  if (db) {
    db.close()
  }
  db = new TasksDatabase(userId)
  return db
}

// Get current database instance
export const getDatabase = (): TasksDatabase => {
  if (!db) {
    // Fallback to anonymous database if no user
    db = new TasksDatabase()
  }
  return db
}

// Supabase repository for cloud storage
export const supabaseTasksRepo = {
  async addTodo(todo: Omit<Todo, 'id'>, userId: string): Promise<Todo> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    // Insert the main todo
    const { data: todoData, error: todoError } = await supabase
      .from('todos')
      .insert({
        user_id: userId,
        text: todo.summary, // Legacy field still required for compatibility
        summary: todo.summary, // New field for enhanced schema
        done: todo.done,
        priority: todo.priority,
        category: todo.category,
        due_date: todo.dueDate || null,
        created_at: todo.createdAt,
      })
      .select()
      .single()

    if (todoError) throw todoError

    // Insert subtasks if any
    const subtasks: Subtask[] = []
    if (todo.subtasks && todo.subtasks.length > 0) {
      const { data: subtaskData, error: subtaskError } = await supabase
        .from('subtasks')
        .insert(
          todo.subtasks.map(subtask => ({
            todo_id: todoData.id,
            text: subtask.text,
            done: subtask.done,
          }))
        )
        .select()

      if (subtaskError) throw subtaskError

      subtasks.push(...(subtaskData || []).map(item => ({
        id: item.id,
        text: item.text,
        done: item.done ?? false,
        createdAt: item.created_at ?? new Date().toISOString(),
      })))
    }

    return {
      id: todoData.id,
      summary: todoData.summary ?? todoData.text ?? '', // Handle null summary with fallback
      description: '', // Default empty description for now
      descriptionFormat: 'plaintext',
      done: todoData.done ?? false,
      priority: (todoData.priority as Priority) ?? 'medium',
      category: (todoData.category as Category) ?? 'other',
      points: 5, // Default points
      dueDate: todoData.due_date ?? undefined,
      dueDateTime: undefined, // Not in current schema
      subtasks,
      completedAt: undefined, // Not in current schema
      createdAt: todoData.created_at ?? new Date().toISOString(),
      updatedAt: todoData.updated_at ?? new Date().toISOString(),
    }
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const updateData: Record<string, unknown> = {}
    if (updates.summary !== undefined) {
      updateData.text = updates.summary // Legacy field for compatibility
      updateData.summary = updates.summary // New field for enhanced schema
    }
    if (updates.done !== undefined) {
      updateData.done = updates.done
    }
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)

    if (error) throw error
  },

  async deleteTodo(id: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    // Subtasks will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAllTodos(userId: string): Promise<Todo[]> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    // Get todos
    const { data: todos, error: todosError } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (todosError) throw todosError

    // Get all subtasks for these todos
    const todoIds = (todos || []).map(todo => todo.id)
    interface SubtaskData {
      id: string
      todo_id: string
      text: string
      done: boolean
      created_at: string
    }
    
    let subtasksData: SubtaskData[] = []
    
    if (todoIds.length > 0) {
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .in('todo_id', todoIds)
        .order('created_at', { ascending: true })

      if (subtasksError) throw subtasksError
      subtasksData = (subtasks || []) as SubtaskData[]
    }

    // Group subtasks by todo_id
    const subtasksByTodo = subtasksData.reduce((acc, subtask) => {
      if (!acc[subtask.todo_id]) acc[subtask.todo_id] = []
      acc[subtask.todo_id].push({
        id: subtask.id,
        text: subtask.text,
        done: subtask.done,
        createdAt: subtask.created_at,
      })
      return acc
    }, {} as Record<string, Subtask[]>)

    return (todos || []).map(todo => ({
      id: todo.id,
      summary: todo.summary ?? todo.text ?? '', // Handle null summary with fallback
      description: '', // Default empty description for now
      descriptionFormat: 'plaintext',
      done: todo.done ?? false,
      priority: (todo.priority as Priority) ?? 'medium',
      category: (todo.category as Category) ?? 'other',
      points: 5, // Default points
      dueDate: todo.due_date ?? undefined,
      dueDateTime: undefined, // Not in current schema
      subtasks: subtasksByTodo[todo.id] || [],
      completedAt: undefined, // Not in current schema
      createdAt: todo.created_at ?? new Date().toISOString(),
      updatedAt: todo.updatedAt ?? new Date().toISOString(),
    }))
  },

  async addSubtask(todoId: string, text: string): Promise<Subtask> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        todo_id: todoId,
        text,
        done: false,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      text: data.text,
      done: data.done ?? false,
      createdAt: data.created_at ?? new Date().toISOString(),
    }
  },

  async updateSubtask(subtaskId: string, updates: Partial<Subtask>): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('subtasks')
      .update({
        text: updates.text,
        done: updates.done,
      })
      .eq('id', subtaskId)

    if (error) throw error
  },

  async deleteSubtask(subtaskId: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId)

    if (error) throw error
  },

  async clearAll(userId: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  },
}

// Original IndexedDB repository (kept for offline functionality)
export const tasksRepo = {
  // Todo methods
  async addTodo(todo: Todo): Promise<Todo> {
    const database = getDatabase()
    const now = new Date().toISOString()
    const todoWithTimestamps: Todo = {
      ...todo,
      id: todo.id || uuidv4(), // Use existing ID or generate new one
      updatedAt: now,
      createdAt: todo.createdAt || now,
      // Ensure defaults for required fields if not provided
      subtasks: todo.subtasks || [],
      priority: todo.priority || 'medium',
      category: todo.category || 'other',
      done: todo.done || false,
      summary: todo.summary || '',
      descriptionFormat: todo.descriptionFormat || 'plaintext',
      points: todo.points || 5,
    }

    await database.todos.put(todoWithTimestamps) // Use put to insert or update
    return todoWithTimestamps
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    const database = getDatabase()
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await database.todos.update(id, updateData)
  },

  async deleteTodo(id: string): Promise<void> {
    const database = getDatabase()
    await database.todos.delete(id)
  },

  async getAllTodos(userId?: string): Promise<Todo[]> {
    const supabase = await getSupabaseClient()
    if (supabase && userId) {
      try {
        const { data: todos, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        return (todos || []).map(todo => ({
          id: todo.id,
          summary: todo.text ?? todo.summary ?? '', // Handle null with fallback
          description: '', // Default empty description for now
          descriptionFormat: 'plaintext',
          done: todo.done ?? false,
          priority: (todo.priority as Priority) ?? 'medium',
          category: (todo.category as Category) ?? 'other',
          points: 5, // Default points
          dueDate: todo.due_date ?? undefined,
          dueDateTime: undefined, // Not in current schema
          subtasks: [], // Will need to be fetched separately
          completedAt: undefined, // Not in current schema
          createdAt: todo.created_at ?? new Date().toISOString(),
          updatedAt: todo.updatedAt ?? new Date().toISOString(),
        }))
      } catch (error) {
        console.warn('Supabase fetch failed, using local storage:', error)
      }
    }
    
    // Fallback to local storage - use IndexedDB directly instead of calling self
    const database = getDatabase()
    return await database.todos.orderBy('createdAt').reverse().toArray()
  },

  async getTodoById(id: string): Promise<Todo | undefined> {
    const database = getDatabase()
    return await database.todos.get(id)
  },

  async getTodosByCategory(category: string): Promise<Todo[]> {
    const database = getDatabase()
    return await database.todos.where('category').equals(category).toArray()
  },

  async getTodosByPriority(priority: string): Promise<Todo[]> {
    const database = getDatabase()
    return await database.todos.where('priority').equals(priority).toArray()
  },

  async getOverdueTodos(): Promise<Todo[]> {
    const database = getDatabase()
    const today = new Date().toISOString().split('T')[0]
    return await database.todos
      .where('dueDate')
      .below(today)
      .and((todo) => !todo.done)
      .toArray()
  },

  // Subtask methods
  async addSubtask(todoId: string, subtaskText: string): Promise<void> {
    const database = getDatabase()
    const todo = await database.todos.get(todoId)
    if (!todo) return

    const newSubtask: Subtask = {
      id: uuidv4(),
      text: subtaskText,
      done: false,
      createdAt: new Date().toISOString(),
    }

    const updatedSubtasks = [...todo.subtasks, newSubtask]
    await this.updateTodo(todoId, { subtasks: updatedSubtasks })
  },

  async updateSubtask(
    todoId: string,
    subtaskId: string,
    updates: Partial<Subtask>
  ): Promise<void> {
    const database = getDatabase()
    const todo = await database.todos.get(todoId)
    if (!todo) return

    const updatedSubtasks = todo.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
    )
    await this.updateTodo(todoId, { subtasks: updatedSubtasks })
  },

  async deleteSubtask(todoId: string, subtaskId: string): Promise<void> {
    const database = getDatabase()
    const todo = await database.todos.get(todoId)
    if (!todo) return

    const updatedSubtasks = todo.subtasks.filter(
      (subtask) => subtask.id !== subtaskId
    )
    await this.updateTodo(todoId, { subtasks: updatedSubtasks })
  },

  // Template methods
  async addTemplate(template: Omit<TaskTemplate, 'id'>): Promise<TaskTemplate> {
    const database = getDatabase()
    const newTemplate: TaskTemplate = {
      id: uuidv4(),
      ...template,
    }

    await database.templates.add(newTemplate)
    return newTemplate
  },

  async updateTemplate(
    id: string,
    updates: Partial<TaskTemplate>
  ): Promise<void> {
    const database = getDatabase()
    await database.templates.update(id, updates)
  },

  async deleteTemplate(id: string): Promise<void> {
    const database = getDatabase()
    await database.templates.delete(id)
  },

  async getAllTemplates(): Promise<TaskTemplate[]> {
    const database = getDatabase()
    return await database.templates.orderBy('createdAt').reverse().toArray()
  },

  async getTemplateById(id: string): Promise<TaskTemplate | undefined> {
    const database = getDatabase()
    return await database.templates.get(id)
  },

  async createTodoFromTemplate(templateId: string): Promise<Todo> {
    const template = await this.getTemplateById(templateId)
    if (!template) throw new Error('Template not found')

    const todo: Omit<Todo, 'id' | 'updatedAt'> = {
      summary: template.name,
      description: '',
      descriptionFormat: 'plaintext',
      done: false,
      priority: template.priority,
      category: template.category,
      points: 5,
      subtasks: template.subtasks.map(st => ({
        id: uuidv4(),
        text: st.text,
        done: st.done,
        createdAt: new Date().toISOString(),
      })),
      templateId: template.id,
      createdAt: new Date().toISOString(),
    }

    return await this.addTodo(todo)
  },

  async clearAll(): Promise<void> {
    const database = getDatabase()
    await database.todos.clear()
    await database.templates.clear()
  },
}

// Hybrid repository that uses Supabase when available, falls back to IndexedDB
export const hybridTasksRepo = {
  async addTodo(todo: Omit<Todo, 'id'>, userId?: string): Promise<Todo> {
    const supabase = await getSupabaseClient()
    if (!supabase || !userId) {
      // Fallback to local storage only (offline mode)
      const result = await tasksRepo.addTodo(todo)
      console.log('📱 Todo saved locally only (offline):', { id: result.id, summary: result.summary })
      return result
    }

    // Save to Supabase first - this is now the source of truth
    const result = await supabaseTasksRepo.addTodo(todo, userId)
    
    // ALSO save to local IndexedDB with the SAME ID for offline access
    const todoWithSameId = {
      ...todo,
      id: result.id,  // Use the cloud ID, not a new local ID
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }
    const database = getDatabase()
    await database.todos.put(todoWithSameId)  // Use put() to ensure same ID
    
    console.log('✅ Todo saved to cloud with ID synced locally:', { id: result.id, summary: result.summary })
    return result
  },

  async updateTodo(id: string, updates: Partial<Todo>, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase || !userId) {
      // Always update local storage
      try {
        await tasksRepo.updateTodo(id, updates)
        console.log('✅ Todo updated locally:', { id, updates, cloudSync: false })
      } catch (localError) {
        console.error('❌ Failed to update todo locally:', localError)
        throw localError
      }
      return
    }

    // Try Supabase first if available
    try {
      await supabaseTasksRepo.updateTodo(id, updates)
      console.log('✅ Todo updated in cloud:', { id, updates })
    } catch (error) {
      console.warn('Supabase update failed:', error)
      
      // If the entry doesn't exist in Supabase, try to create it
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('PGRST116'))) {
        try {
          // Get the full entry from local storage first
          const localTodo = await tasksRepo.getTodoById(id)
          if (localTodo) {
            // Create the entry in Supabase with the updates applied
            const todoToCreate = { ...localTodo, ...updates }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (todoToCreate as any).id // Remove id for creation
            const cloudResult = await supabaseTasksRepo.addTodo(todoToCreate, userId)
            console.log('✅ Created missing todo in Supabase:', { id: cloudResult.id, summary: cloudResult.summary })
          }
        } catch (createError) {
          console.warn('Failed to create todo in Supabase:', createError)
        }
      }
    }
    
    // Always update local storage
    try {
      await tasksRepo.updateTodo(id, updates)
      console.log('✅ Todo updated locally:', { id, updates, cloudSync: true })
    } catch (localError) {
      console.error('❌ Failed to update todo locally:', localError)
      throw localError
    }
  },

  async deleteTodo(id: string, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase || !userId) {
      // Always delete from local storage
      try {
        await tasksRepo.deleteTodo(id)
        console.log('✅ Todo deleted locally:', { id, cloudSync: false })
      } catch (localError) {
        console.error('❌ Failed to delete todo locally:', localError)
        throw localError
      }
      return
    }

    // Try Supabase first if available
    try {
      await supabaseTasksRepo.deleteTodo(id)
      console.log('✅ Todo deleted from cloud:', { id })
    } catch (error) {
      console.warn('Supabase delete failed:', error)
    }
    
    // Always delete from local storage
    try {
      await tasksRepo.deleteTodo(id)
      console.log('✅ Todo deleted locally:', { id, cloudSync: true })
    } catch (localError) {
      console.error('❌ Failed to delete todo locally:', localError)
      throw localError
    }
  },

  async getAllTodos(userId?: string): Promise<Todo[]> {
    const supabase = await getSupabaseClient()
    if (!supabase || !userId) {
      // Fallback to local storage if offline or no user
      const localTodos = await tasksRepo.getAllTodos()
      const deduplicatedTodos = removeDuplicateContent(deduplicateTodos(localTodos))
      console.log('💾 Using local todos (cloud unavailable):', { 
        original: localTodos.length,
        deduplicated: deduplicatedTodos.length,
        duplicatesRemoved: localTodos.length - deduplicatedTodos.length
      })
      return deduplicatedTodos
    }

    // Try to get from Supabase first
    try {
      const cloudTodos = await supabaseTasksRepo.getAllTodos(userId)
      const deduplicatedTodos = removeDuplicateContent(deduplicateTodos(cloudTodos))
      console.log('✅ Todos loaded from cloud:', { 
        original: cloudTodos.length,
        deduplicated: deduplicatedTodos.length
      })
      return deduplicatedTodos
    } catch (error) {
      console.warn('☁️ Supabase fetch failed, using local storage:', error)
      const localTodos = await tasksRepo.getAllTodos()
      const deduplicatedTodos = removeDuplicateContent(deduplicateTodos(localTodos))
      console.log('💾 Using local todos (cloud unavailable):', { 
        original: localTodos.length,
        deduplicated: deduplicatedTodos.length,
        duplicatesRemoved: localTodos.length - deduplicatedTodos.length
      })
      return deduplicatedTodos
    }
  },

  async getTodoById(id: string, userId?: string): Promise<Todo | undefined> {
    const supabase = await getSupabaseClient()
    if (!supabase || !userId) {
      return await tasksRepo.getTodoById(id)
    }

    // Try Supabase first
    const cloudTodos = await supabaseTasksRepo.getAllTodos(userId)
    const cloudTodo = cloudTodos.find(todo => todo.id === id)
    if (cloudTodo) {
      console.log('✅ Todo found in cloud:', { id })
      return cloudTodo
    }
    
    // Fallback to local storage
    const localTodo = await tasksRepo.getTodoById(id)
    if (localTodo) {
      console.log('✅ Todo found locally:', { id })
    }
    return localTodo
  },

  

  // Subtask methods with hybrid pattern
  async addSubtask(todoId: string, text: string, userId?: string): Promise<Subtask> {
    const supabase = await getSupabaseClient()
    if (!supabase || !userId) {
      // Fallback to local storage only (offline mode)
      const newSubtask: Subtask = {
        id: uuidv4(), // Generate a new ID for local-only subtask
        text,
        done: false,
        createdAt: new Date().toISOString(),
      }
      await tasksRepo.addSubtask(todoId, newSubtask.text) // Pass only text, ID is generated inside tasksRepo.addSubtask
      console.log('📱 Subtask saved locally only (offline):', { todoId, text })
      return newSubtask
    }

    // Save to Supabase first - this is now the source of truth
    const result = await supabaseTasksRepo.addSubtask(todoId, text)
    
    // ALSO save to local IndexedDB with the SAME ID for offline access
    // Fetch the todo from local repo, add the subtask with the cloud-generated ID
    const localTodo = await tasksRepo.getTodoById(todoId)
    if (localTodo) {
      const updatedSubtasks = [...localTodo.subtasks, result]
      await tasksRepo.updateTodo(todoId, { subtasks: updatedSubtasks })
    }
    
    console.log('✅ Subtask saved to cloud with ID synced locally:', { todoId, text })
    return result
  },

  async updateSubtask(todoId: string, subtaskId: string, updates: Partial<Subtask>, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase || !userId) {
      // Fallback to local storage only (offline mode)
      try {
        await tasksRepo.updateSubtask(todoId, subtaskId, updates)
        console.log('✅ Subtask updated locally:', { todoId, subtaskId, updates, cloudSync: false })
      } catch (localError) {
        console.error('❌ Failed to update subtask locally:', localError)
        throw localError
      }
      return
    }

    // Try Supabase first if available
    try {
      await supabaseTasksRepo.updateSubtask(subtaskId, updates)
      console.log('✅ Subtask updated in cloud:', { todoId, subtaskId, updates })
    } catch (error) {
      console.warn('Supabase subtask update failed:', error)
      // If Supabase update fails, still update local storage
    }
    
    // Always update local storage
    try {
      await tasksRepo.updateSubtask(todoId, subtaskId, updates)
      console.log('✅ Subtask updated locally:', { todoId, subtaskId, updates, cloudSync: true })
    } catch (localError) {
      console.error('❌ Failed to update subtask locally:', localError)
      throw localError
    }
  },

  async deleteSubtask(todoId: string, subtaskId: string, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase || !userId) {
      // Fallback to local storage only (offline mode)
      try {
        await tasksRepo.deleteSubtask(todoId, subtaskId)
        console.log('✅ Subtask deleted locally:', { todoId, subtaskId, cloudSync: false })
      } catch (localError) {
        console.error('❌ Failed to delete subtask locally:', localError)
        throw localError
      }
      return
    }

    // Try Supabase first if available
    try {
      await supabaseTasksRepo.deleteSubtask(subtaskId)
      console.log('✅ Subtask deleted from cloud:', { todoId, subtaskId })
    } catch (error) {
      console.warn('Supabase subtask delete failed:', error)
      // If Supabase delete fails, still delete from local storage
    }
    
    // Always delete from local storage
    try {
      await tasksRepo.deleteSubtask(todoId, subtaskId)
      console.log('✅ Subtask deleted locally:', { todoId, subtaskId, cloudSync: true })
    } catch (localError) {
      console.error('❌ Failed to delete subtask locally:', localError)
      throw localError
    }
  },

  async clearAll(userId?: string): Promise<void> {
    let cloudSuccess = false

    // Try Supabase first if available
    const supabase = await getSupabaseClient()
    if (supabase && userId) {
      try {
        await supabaseTasksRepo.clearAll(userId)
        cloudSuccess = true
        console.log('✅ All todos cleared from cloud')
      } catch (error) {
        console.warn('Supabase clear failed:', error)
      }
    }
    
    // Always clear local storage
    try {
      await tasksRepo.clearAll()
      console.log('✅ All todos cleared locally:', { cloudSync: cloudSuccess })
    } catch (localError) {
      console.error('❌ Failed to clear todos locally:', localError)
      throw localError
    }
  },

  async syncData(userId: string): Promise<{ synced: number; errors: number }> {
    console.log('Sync data not yet implemented for hybrid repo.')
    return { synced: 0, errors: 0 }
  }
}