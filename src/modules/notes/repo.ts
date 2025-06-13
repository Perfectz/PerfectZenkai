import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { Note } from './types'

class NotesDatabase extends Dexie {
  notes!: Table<Note>

  constructor(userId?: string) {
    // Create user-specific database name
    const dbName = userId ? `NotesDatabase_${userId}` : 'NotesDatabase'
    super(dbName)
    this.version(1).stores({
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
