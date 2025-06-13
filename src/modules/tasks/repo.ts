import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { Todo, TaskTemplate, Subtask } from './types'

class TasksDatabase extends Dexie {
  todos!: Table<Todo>
  templates!: Table<TaskTemplate>

  constructor(userId?: string) {
    // Create user-specific database name
    const dbName = userId ? `TasksDatabase_${userId}` : 'TasksDatabase'
    super(dbName)
    this.version(2).stores({
      todos: 'id, text, done, priority, category, dueDate, createdAt, updatedAt',
      templates: 'id, name, createdAt'
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
      category: todo.category || 'other'
    }
    
    await database.todos.add(newTodo)
    return newTodo
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    const database = getDatabase()
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    }
    await database.todos.update(id, updateData)
  },

  async deleteTodo(id: string): Promise<void> {
    const database = getDatabase()
    await database.todos.delete(id)
  },

  async getAllTodos(): Promise<Todo[]> {
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
      .and(todo => !todo.done)
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
      createdAt: new Date().toISOString()
    }

    const updatedSubtasks = [...todo.subtasks, newSubtask]
    await this.updateTodo(todoId, { subtasks: updatedSubtasks })
  },

  async updateSubtask(todoId: string, subtaskId: string, updates: Partial<Subtask>): Promise<void> {
    const database = getDatabase()
    const todo = await database.todos.get(todoId)
    if (!todo) return

    const updatedSubtasks = todo.subtasks.map(subtask =>
      subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
    )
    await this.updateTodo(todoId, { subtasks: updatedSubtasks })
  },

  async deleteSubtask(todoId: string, subtaskId: string): Promise<void> {
    const database = getDatabase()
    const todo = await database.todos.get(todoId)
    if (!todo) return

    const updatedSubtasks = todo.subtasks.filter(subtask => subtask.id !== subtaskId)
    await this.updateTodo(todoId, { subtasks: updatedSubtasks })
  },

  // Template methods
  async addTemplate(template: Omit<TaskTemplate, 'id'>): Promise<TaskTemplate> {
    const database = getDatabase()
    const newTemplate: TaskTemplate = {
      id: uuidv4(),
      ...template
    }
    
    await database.templates.add(newTemplate)
    return newTemplate
  },

  async updateTemplate(id: string, updates: Partial<TaskTemplate>): Promise<void> {
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

    const now = new Date().toISOString()
    const subtasks: Subtask[] = template.subtasks.map(subtask => ({
      id: uuidv4(),
      createdAt: now,
      ...subtask
    }))

    return await this.addTodo({
      text: template.text,
      done: false,
      priority: template.priority,
      category: template.category,
      subtasks,
      templateId,
      createdAt: now
    })
  },

  async clearAll(): Promise<void> {
    const database = getDatabase()
    await database.todos.clear()
    await database.templates.clear()
  }
} 