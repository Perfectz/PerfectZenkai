// src/modules/tasks/repositories/SimpleTodoRepo.ts
// Simplified todo repository with single source of truth

import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { Todo, Priority, Category } from '../types'
import { getSupabaseClient } from '@/lib/supabase-client'
import { useAuthStore } from '@/modules/auth'

// Simple database class
class SimpleTodoDatabase extends Dexie {
  todos!: Table<Todo>

  constructor(userId?: string) {
    const dbName = userId ? `SimpleTodoDB_${userId}` : 'SimpleTodoDB'
    super(dbName)
    this.version(1).stores({
      todos: 'id, summary, done, priority, category, dueDate, createdAt, updatedAt',
    })
  }
}

// Global database instance
let database: SimpleTodoDatabase | null = null

function getDatabase(): SimpleTodoDatabase {
  if (!database) {
    const user = useAuthStore.getState().user
    database = new SimpleTodoDatabase(user?.id)
  }
  return database
}

// Single source of truth repository
export const simpleTodoRepo = {
  // Add a new todo
  async addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const db = getDatabase()
    const user = useAuthStore.getState().user
    
    const newTodo: Todo = {
      ...todo,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to local storage first (primary source)
    await db.todos.put(newTodo)

    // Sync to cloud if available
    if (user?.id) {
      try {
        const supabase = await getSupabaseClient()
        if (supabase) {
          await supabase
            .from('todos')
            .insert({
              id: newTodo.id,
              user_id: user.id,
              text: newTodo.summary,
              summary: newTodo.summary,
              done: newTodo.done,
              priority: newTodo.priority,
              category: newTodo.category,
              due_date: newTodo.dueDate || null,
              created_at: newTodo.createdAt,
              updated_at: newTodo.updatedAt,
            })
        }
      } catch (error) {
        console.warn('Cloud sync failed, todo saved locally:', error)
      }
    }

    return newTodo
  },

  // Get all todos (local first, cloud as backup)
  async getAllTodos(): Promise<Todo[]> {
    const db = getDatabase()
    const user = useAuthStore.getState().user

    // Always get from local storage first
    let todos = await db.todos.orderBy('createdAt').reverse().toArray()

    // If we have a user and local storage is empty, try cloud
    if (user?.id && todos.length === 0) {
      try {
        const supabase = await getSupabaseClient()
        if (supabase) {
          const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (!error && data) {
            // Convert cloud data to local format and save
            const cloudTodos: Todo[] = data.map(item => ({
              id: item.id,
              summary: item.summary || item.text || '',
              description: item.description || '',
              descriptionFormat: 'plaintext',
              done: item.done || false,
              priority: (item.priority as Priority) || 'medium',
              category: (item.category as Category) || 'other',
              points: item.points || 5,
              dueDate: item.due_date || undefined,
              subtasks: [],
              createdAt: item.created_at || new Date().toISOString(),
              updatedAt: item.updated_at || item.created_at || new Date().toISOString(),
            }))

            // Save to local storage
            await db.todos.bulkPut(cloudTodos)
            todos = cloudTodos
          }
        }
      } catch (error) {
        console.warn('Cloud sync failed, using local data:', error)
      }
    }

    return todos
  },

  // Update a todo
  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    const db = getDatabase()
    const user = useAuthStore.getState().user

    // Update local storage
    const existingTodo = await db.todos.get(id)
    if (!existingTodo) {
      throw new Error(`Todo with id ${id} not found`)
    }

    const updatedTodo: Todo = {
      ...existingTodo,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await db.todos.put(updatedTodo)

    // Sync to cloud if available
    if (user?.id) {
      try {
        const supabase = await getSupabaseClient()
        if (supabase) {
          await supabase
            .from('todos')
            .update({
              text: updatedTodo.summary,
              summary: updatedTodo.summary,
              done: updatedTodo.done,
              priority: updatedTodo.priority,
              category: updatedTodo.category,
              due_date: updatedTodo.dueDate || null,
              updated_at: updatedTodo.updatedAt,
            })
            .eq('id', id)
            .eq('user_id', user.id)
        }
      } catch (error) {
        console.warn('Cloud sync failed, todo updated locally:', error)
      }
    }
  },

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    const db = getDatabase()
    const user = useAuthStore.getState().user

    // Delete from local storage
    await db.todos.delete(id)

    // Delete from cloud if available
    if (user?.id) {
      try {
        const supabase = await getSupabaseClient()
        if (supabase) {
          await supabase
            .from('todos')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
        }
      } catch (error) {
        console.warn('Cloud sync failed, todo deleted locally:', error)
      }
    }
  },

  // Get a single todo by ID
  async getTodoById(id: string): Promise<Todo | undefined> {
    const db = getDatabase()
    return await db.todos.get(id)
  },

  // Clear all todos
  async clearAll(): Promise<void> {
    const db = getDatabase()
    const user = useAuthStore.getState().user

    // Clear local storage
    await db.todos.clear()

    // Clear cloud if available
    if (user?.id) {
      try {
        const supabase = await getSupabaseClient()
        if (supabase) {
          await supabase
            .from('todos')
            .delete()
            .eq('user_id', user.id)
        }
      } catch (error) {
        console.warn('Cloud sync failed, todos cleared locally:', error)
      }
    }
  },

  // Sync with cloud (pull latest changes)
  async syncWithCloud(): Promise<{ synced: number; errors: number }> {
    const user = useAuthStore.getState().user
    if (!user?.id) {
      return { synced: 0, errors: 0 }
    }

    try {
      const supabase = await getSupabaseClient()
      if (!supabase) {
        return { synced: 0, errors: 1 }
      }

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Failed to sync with cloud:', error)
        return { synced: 0, errors: 1 }
      }

      if (!data || data.length === 0) {
        return { synced: 0, errors: 0 }
      }

      const db = getDatabase()
      const cloudTodos: Todo[] = data.map(item => ({
        id: item.id,
        summary: item.summary || item.text || '',
        description: item.description || '',
        descriptionFormat: 'plaintext',
        done: item.done || false,
        priority: (item.priority as Priority) || 'medium',
        category: (item.category as Category) || 'other',
        points: item.points || 5,
        dueDate: item.due_date || undefined,
        subtasks: [],
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || item.created_at || new Date().toISOString(),
      }))

      // Use bulkPut to handle conflicts (cloud wins)
      await db.todos.bulkPut(cloudTodos)

      return { synced: cloudTodos.length, errors: 0 }
    } catch (error) {
      console.error('Sync failed:', error)
      return { synced: 0, errors: 1 }
    }
  },
} 