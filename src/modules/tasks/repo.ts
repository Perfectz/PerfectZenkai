import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { Todo } from './types'

class TasksDatabase extends Dexie {
  todos!: Table<Todo>

  constructor(userId?: string) {
    // Create user-specific database name
    const dbName = userId ? `TasksDatabase_${userId}` : 'TasksDatabase'
    super(dbName)
    this.version(1).stores({
      todos: 'id, text, done, createdAt'
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
  async addTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    const database = getDatabase()
    const newTodo: Todo = {
      id: uuidv4(),
      ...todo
    }
    
    await database.todos.add(newTodo)
    return newTodo
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    const database = getDatabase()
    await database.todos.update(id, updates)
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

  async clearAll(): Promise<void> {
    const database = getDatabase()
    await database.todos.clear()
  }
} 