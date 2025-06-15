import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { Todo, TaskTemplate, Subtask } from './types'
import { supabase } from '@/lib/supabase'

class TasksDatabase extends Dexie {
  todos!: Table<Todo>
  templates!: Table<TaskTemplate>

  constructor(userId?: string) {
    // Create user-specific database name
    const dbName = userId ? `TasksDatabase_${userId}` : 'TasksDatabase'
    super(dbName)
    this.version(2).stores({
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
const getDatabase = (): TasksDatabase => {
  if (!db) {
    // Fallback to anonymous database if no user
    db = new TasksDatabase()
  }
  return db
}

// Supabase repository for cloud storage
export const supabaseTasksRepo = {
  async addTodo(todo: Omit<Todo, 'id'>, userId: string): Promise<Todo> {
    if (!supabase) throw new Error('Supabase not available')

    // Insert the main todo
    const { data: todoData, error: todoError } = await supabase
      .from('todos')
      .insert({
        user_id: userId,
        summary: todo.summary,
        description: todo.description || '',
        description_format: todo.descriptionFormat || 'plaintext',
        done: todo.done,
        priority: todo.priority,
        category: todo.category,
        points: todo.points || 5,
        due_date: todo.dueDate || null,
        due_date_time: todo.dueDateTime || null,
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
        done: item.done,
        createdAt: item.created_at,
      })))
    }

    return {
      id: todoData.id,
      summary: todoData.summary,
      description: todoData.description || '',
      descriptionFormat: todoData.description_format,
      done: todoData.done,
      priority: todoData.priority,
      category: todoData.category,
      points: todoData.points,
      dueDate: todoData.due_date,
      dueDateTime: todoData.due_date_time,
      subtasks,
      completedAt: todoData.completed_at,
      createdAt: todoData.created_at,
      updatedAt: todoData.updated_at,
    }
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    if (!supabase) throw new Error('Supabase not available')

    const updateData: Record<string, unknown> = {}
    if (updates.summary !== undefined) updateData.summary = updates.summary
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.descriptionFormat !== undefined) updateData.description_format = updates.descriptionFormat
    if (updates.done !== undefined) updateData.done = updates.done
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.points !== undefined) updateData.points = updates.points
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
    if (updates.dueDateTime !== undefined) updateData.due_date_time = updates.dueDateTime
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt
    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)

    if (error) throw error
  },

  async deleteTodo(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not available')

    // Subtasks will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAllTodos(userId: string): Promise<Todo[]> {
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
      summary: todo.summary,
      description: todo.description || '',
      descriptionFormat: todo.description_format,
      done: todo.done,
      priority: todo.priority,
      category: todo.category,
      points: todo.points,
      dueDate: todo.due_date,
      dueDateTime: todo.due_date_time,
      subtasks: subtasksByTodo[todo.id] || [],
      completedAt: todo.completed_at,
      createdAt: todo.created_at,
      updatedAt: todo.updated_at,
    }))
  },

  async addSubtask(todoId: string, text: string): Promise<Subtask> {
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
      done: data.done,
      createdAt: data.created_at,
    }
  },

  async updateSubtask(subtaskId: string, updates: Partial<Subtask>): Promise<void> {
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
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId)

    if (error) throw error
  },

  async clearAll(userId: string): Promise<void> {
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
  async addTodo(todo: Omit<Todo, 'id' | 'updatedAt'>): Promise<Todo> {
    const database = getDatabase()
    const now = new Date().toISOString()
    const newTodo: Todo = {
      id: uuidv4(),
      updatedAt: now,
      ...todo,
      // Set defaults for required fields if not provided
      subtasks: todo.subtasks || [],
      priority: todo.priority || 'medium',
      category: todo.category || 'other',
    }

    await database.todos.add(newTodo)
    return newTodo
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
    try {
      if (supabase && userId) {
        const { data: todos, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        return (todos || []).map(todo => ({
          id: todo.id,
          summary: todo.summary,
          description: todo.description,
          descriptionFormat: todo.description_format,
          done: todo.done,
          priority: todo.priority,
          category: todo.category,
          points: todo.points,
          dueDate: todo.due_date,
          dueDateTime: todo.due_date_time,
          subtasks: todo.subtasks || [],
          completedAt: todo.completed_at,
          createdAt: todo.created_at,
          updatedAt: todo.updated_at,
        }))
      }
    } catch (error) {
      console.warn('Supabase fetch failed, using local storage:', error)
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
    try {
      if (supabase && userId) {
        const result = await supabaseTasksRepo.addTodo(todo, userId)
        // Also save to local for offline access
        await tasksRepo.addTodo(todo)
        return result
      }
    } catch (error) {
      console.warn('Supabase save failed, using local storage:', error)
    }
    
    return await tasksRepo.addTodo(todo)
  },

  async updateTodo(id: string, updates: Partial<Todo>, userId?: string): Promise<void> {
    try {
      if (supabase && userId) {
        await supabaseTasksRepo.updateTodo(id, updates)
      }
    } catch (error) {
      console.warn('Supabase update failed:', error)
    }
    
    await tasksRepo.updateTodo(id, updates)
  },

  async deleteTodo(id: string, userId?: string): Promise<void> {
    try {
      if (supabase && userId) {
        await supabaseTasksRepo.deleteTodo(id)
      }
    } catch (error) {
      console.warn('Supabase delete failed:', error)
    }
    
    await tasksRepo.deleteTodo(id)
  },

  async getAllTodos(userId?: string): Promise<Todo[]> {
    try {
      if (supabase && userId) {
        return await supabaseTasksRepo.getAllTodos(userId)
      }
    } catch (error) {
      console.warn('Supabase fetch failed, using local storage:', error)
    }
    
    return await tasksRepo.getAllTodos()
  },

  async getTodoById(id: string, userId?: string): Promise<Todo | undefined> {
    try {
      if (supabase && userId) {
        const todos = await supabaseTasksRepo.getAllTodos(userId)
        return todos.find(todo => todo.id === id)
      }
    } catch (error) {
      console.warn('Supabase fetch failed, using local storage:', error)
    }
    
    return await tasksRepo.getTodoById(id)
  },

  async addSubtask(todoId: string, text: string, userId?: string): Promise<Subtask> {
    try {
      if (supabase && userId) {
        const result = await supabaseTasksRepo.addSubtask(todoId, text)
        // Also update local todo
        const localTodo = await tasksRepo.getTodoById(todoId)
        if (localTodo) {
          const newSubtask: Subtask = {
            id: uuidv4(),
            text,
            done: false,
            createdAt: new Date().toISOString(),
          }
          localTodo.subtasks.push(newSubtask)
          await tasksRepo.updateTodo(todoId, localTodo)
        }
        return result
      }
    } catch (error) {
      console.warn('Supabase subtask add failed:', error)
    }
    
    // Fallback to local
    const todo = await tasksRepo.getTodoById(todoId)
    if (!todo) throw new Error('Todo not found')
    
    const newSubtask: Subtask = {
      id: uuidv4(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    }
    
    todo.subtasks.push(newSubtask)
    await tasksRepo.updateTodo(todoId, todo)
    return newSubtask
  },

  async updateSubtask(todoId: string, subtaskId: string, updates: Partial<Subtask>, userId?: string): Promise<void> {
    try {
      if (supabase && userId) {
        await supabaseTasksRepo.updateSubtask(subtaskId, updates)
      }
    } catch (error) {
      console.warn('Supabase subtask update failed:', error)
    }
    
    // Update local
    const todo = await tasksRepo.getTodoById(todoId)
    if (todo) {
      const subtaskIndex = todo.subtasks.findIndex(s => s.id === subtaskId)
      if (subtaskIndex !== -1) {
        todo.subtasks[subtaskIndex] = { ...todo.subtasks[subtaskIndex], ...updates }
        await tasksRepo.updateTodo(todoId, todo)
      }
    }
  },

  async deleteSubtask(todoId: string, subtaskId: string, userId?: string): Promise<void> {
    try {
      if (supabase && userId) {
        await supabaseTasksRepo.deleteSubtask(subtaskId)
      }
    } catch (error) {
      console.warn('Supabase subtask delete failed:', error)
    }
    
    // Update local
    const todo = await tasksRepo.getTodoById(todoId)
    if (todo) {
      todo.subtasks = todo.subtasks.filter(s => s.id !== subtaskId)
      await tasksRepo.updateTodo(todoId, todo)
    }
  },

  async clearAll(userId?: string): Promise<void> {
    try {
      if (supabase && userId) {
        await supabaseTasksRepo.clearAll(userId)
      }
    } catch (error) {
      console.warn('Supabase clear failed:', error)
    }
    
    await tasksRepo.clearAll()
  },
}
