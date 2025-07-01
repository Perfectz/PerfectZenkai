import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { Note } from './types'
import { getSupabaseClient } from '@/lib/supabase-client'

// Supabase database row interface
interface SupabaseNote {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
  updated_at: string
}

class NotesDatabase extends Dexie {
  notes!: Table<Note>

  constructor(userId?: string) {
    // Create user-specific database name
    const dbName = userId ? `NotesDatabase_${userId}` : 'NotesDatabase'
    super(dbName)
    this.version(33).stores({
      notes: 'id, title, content, createdAt, updatedAt',
    })
  }
}

// Global database instance - will be reinitialized per user
let db: NotesDatabase

// Initialize database for specific user
export const initializeNotesDatabase = (userId: string) => {
  if (db) {
    db.close()
  }
  db = new NotesDatabase(userId)
  return db
}

// Get current database instance
const getDatabase = (): NotesDatabase => {
  if (!db) {
    // Fallback to anonymous database if no user
    db = new NotesDatabase()
  }
  return db
}

// Supabase repository for cloud storage
export const supabaseNotesRepo = {
  async addNote(note: Omit<Note, 'id'>, userId: string): Promise<Note> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title: note.title,
        content: note.content,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title ?? '',
      content: data.content ?? '',
      createdAt: data.created_at ?? new Date().toISOString(),
      updatedAt: data.updated_at ?? new Date().toISOString(),
    }
  },

  async updateNote(id: string, updates: Partial<Omit<Note, 'id'>>): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('notes')
      .update({
        title: updates.title,
        content: updates.content,
      })
      .eq('id', id)

    if (error) throw error
  },

  async deleteNote(id: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAllNotes(userId: string): Promise<Note[]> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return (data || []).map((item: SupabaseNote) => ({
      id: item.id,
      title: item.title ?? '',
      content: item.content ?? '',
      createdAt: item.created_at ?? new Date().toISOString(),
      updatedAt: item.updated_at ?? new Date().toISOString(),
    }))
  },

  async getNoteById(id: string): Promise<Note | undefined> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return undefined

    return {
      id: data.id,
      title: data.title ?? '',
      content: data.content ?? '',
      createdAt: data.created_at ?? new Date().toISOString(),
      updatedAt: data.updated_at ?? new Date().toISOString(),
    }
  },

  async clearAll(userId: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  },
}

// Original IndexedDB repository (kept for offline functionality)
export const notesRepo = {
  async addNote(note: Omit<Note, 'id'>): Promise<Note> {
    const database = getDatabase()
    const newNote: Note = {
      id: uuidv4(),
      ...note,
    }

    await database.notes.add(newNote)
    return newNote
  },

  async updateNote(
    id: string,
    updates: Partial<Omit<Note, 'id'>>
  ): Promise<void> {
    const database = getDatabase()
    await database.notes.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })
  },

  async deleteNote(id: string): Promise<void> {
    const database = getDatabase()
    await database.notes.delete(id)
  },

  async getAllNotes(): Promise<Note[]> {
    const database = getDatabase()
    return await database.notes.orderBy('updatedAt').reverse().toArray()
  },

  async getNoteById(id: string): Promise<Note | undefined> {
    const database = getDatabase()
    return await database.notes.get(id)
  },

  async clearAll(): Promise<void> {
    const database = getDatabase()
    await database.notes.clear()
  },
}

// Hybrid repository that uses Supabase when available, falls back to IndexedDB
export const hybridNotesRepo = {
  async addNote(note: Omit<Note, 'id'>, userId?: string): Promise<Note> {
    if (!userId) {
      return await notesRepo.addNote(note)
    }
    const result = await supabaseNotesRepo.addNote(note, userId)
    await notesRepo.addNote(note) // Always save to local for offline access
    return result
  },

  async updateNote(id: string, updates: Partial<Omit<Note, 'id'>>, userId?: string): Promise<void> {
    if (!userId) {
      return await notesRepo.updateNote(id, updates)
    }
    await supabaseNotesRepo.updateNote(id, updates)
    await notesRepo.updateNote(id, updates) // Always update local for offline access
  },

  async deleteNote(id: string, userId?: string): Promise<void> {
    if (!userId) {
      return await notesRepo.deleteNote(id)
    }
    await supabaseNotesRepo.deleteNote(id)
    await notesRepo.deleteNote(id) // Always delete from local
  },

  async getAllNotes(userId?: string): Promise<Note[]> {
    if (!userId) {
      return await notesRepo.getAllNotes()
    }
    return await supabaseNotesRepo.getAllNotes(userId)
  },

  async getNoteById(id: string, userId?: string): Promise<Note | undefined> {
    if (!userId) {
      return await notesRepo.getNoteById(id)
    }
    return await supabaseNotesRepo.getNoteById(id)
  },

  async clearAll(userId?: string): Promise<void> {
    if (!userId) {
      return await notesRepo.clearAll()
    }
    await supabaseNotesRepo.clearAll(userId)
    await notesRepo.clearAll() // Always clear local
  },
}
