import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { Note } from './types'

class NotesDatabase extends Dexie {
  notes!: Table<Note>

  constructor() {
    super('NotesDatabase')
    this.version(1).stores({
      notes: 'id, title, content, createdAt, updatedAt'
    })
  }
}

const db = new NotesDatabase()

export const notesRepo = {
  async addNote(note: Omit<Note, 'id'>): Promise<Note> {
    const newNote: Note = {
      id: uuidv4(),
      ...note
    }
    
    await db.notes.add(newNote)
    return newNote
  },

  async updateNote(id: string, updates: Partial<Omit<Note, 'id'>>): Promise<void> {
    await db.notes.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  },

  async deleteNote(id: string): Promise<void> {
    await db.notes.delete(id)
  },

  async getAllNotes(): Promise<Note[]> {
    return await db.notes.orderBy('updatedAt').reverse().toArray()
  },

  async getNoteById(id: string): Promise<Note | undefined> {
    return await db.notes.get(id)
  },

  async clearAll(): Promise<void> {
    await db.notes.clear()
  }
} 