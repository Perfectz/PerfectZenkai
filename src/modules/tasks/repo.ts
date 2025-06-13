import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { Todo } from './types'

class TasksDatabase extends Dexie {
  todos!: Table<Todo>

  constructor() {
    super('TasksDatabase')
    this.version(1).stores({
      todos: 'id, text, done, createdAt'
    })
  }
}

const db = new TasksDatabase()

export const tasksRepo = {
  async addTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    const newTodo: Todo = {
      id: uuidv4(),
      ...todo
    }
    
    await db.todos.add(newTodo)
    return newTodo
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    await db.todos.update(id, updates)
  },

  async deleteTodo(id: string): Promise<void> {
    await db.todos.delete(id)
  },

  async getAllTodos(): Promise<Todo[]> {
    return await db.todos.orderBy('createdAt').reverse().toArray()
  },

  async getTodoById(id: string): Promise<Todo | undefined> {
    return await db.todos.get(id)
  },

  async clearAll(): Promise<void> {
    await db.todos.clear()
  }
} 