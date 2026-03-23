import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { JournalEntry, JournalEntryRow } from './types'
import { transformEntryToRow, transformRowToEntry } from './utils/journalHelpers'

class JournalDatabase extends Dexie {
  entries!: Table<JournalEntry>

  constructor(userId?: string) {
    const dbName = userId ? `JournalDatabase_${userId}` : 'JournalDatabase'
    super(dbName)
    this.version(1).stores({
      entries: 'id, entryDate, entryType, createdAt, updatedAt',
    })
  }
}

let db: JournalDatabase | null = null
let currentUserId: string | null = null

export const initializeJournalDatabase = (userId: string) => {
  if (db && currentUserId === userId && db.isOpen()) {
    return db
  }

  if (db && (currentUserId !== userId || !db.isOpen())) {
    db.close()
  }

  db = new JournalDatabase(userId)
  currentUserId = userId
  return db
}

const getDatabase = (): JournalDatabase => {
  if (!db || !db.isOpen()) {
    db = new JournalDatabase()
    currentUserId = null
  }

  return db
}

export const journalRepo = {
  async addEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    const database = getDatabase()
    const now = new Date().toISOString()
    const newEntry: JournalEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }

    await database.entries.put(newEntry)
    return newEntry
  },

  async upsertEntry(entry: JournalEntry): Promise<JournalEntry> {
    const database = getDatabase()
    await database.entries.put(entry)
    return entry
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const database = getDatabase()
    const existingEntry = await database.entries.get(id)

    if (!existingEntry) {
      throw new Error('Journal entry not found')
    }

    const updatedEntry: JournalEntry = {
      ...existingEntry,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await database.entries.put(updatedEntry)
    return updatedEntry
  },

  async deleteEntry(id: string): Promise<void> {
    const database = getDatabase()
    await database.entries.delete(id)
  },

  async getAllEntries(): Promise<JournalEntry[]> {
    const database = getDatabase()
    return database.entries.orderBy('entryDate').reverse().toArray()
  },

  async clearAll(): Promise<void> {
    const database = getDatabase()
    await database.entries.clear()
  },
}

export const supabaseJournalRepo = {
  async addEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<JournalEntry> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const rowData = transformEntryToRow(entry)
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: userId,
        entry_date: rowData.entry_date || new Date().toISOString().split('T')[0],
        entry_type: rowData.entry_type || 'both',
        morning_entry: rowData.morning_entry,
        evening_entry: rowData.evening_entry,
        created_at: now,
        updated_at: now,
      }])
      .select()
      .single()

    if (error) throw error

    return transformRowToEntry(data as JournalEntryRow)
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const rowData = transformEntryToRow(updates)
    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        entry_date: rowData.entry_date,
        entry_type: rowData.entry_type,
        morning_entry: rowData.morning_entry,
        evening_entry: rowData.evening_entry,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return transformRowToEntry(data as JournalEntryRow)
  },

  async deleteEntry(id: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAllEntries(userId: string): Promise<JournalEntry[]> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })

    if (error) throw error

    return (data || []).map(item => transformRowToEntry(item as JournalEntryRow))
  },
}

export const hybridJournalRepo = {
  async addEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<JournalEntry> {
    const supabase = await getSupabaseClient()

    try {
      if (supabase && userId) {
        const result = await supabaseJournalRepo.addEntry(entry, userId)
        await journalRepo.upsertEntry(result)
        return result
      }
    } catch (error) {
      console.warn('Supabase journal save failed, using local storage:', error)
    }

    return journalRepo.addEntry(entry)
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>, userId?: string): Promise<JournalEntry> {
    const supabase = await getSupabaseClient()

    try {
      if (supabase && userId) {
        const result = await supabaseJournalRepo.updateEntry(id, updates)
        await journalRepo.upsertEntry(result)
        return result
      }
    } catch (error) {
      console.warn('Supabase journal update failed, using local storage:', error)
    }

    return journalRepo.updateEntry(id, updates)
  },

  async deleteEntry(id: string, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient()

    try {
      if (supabase && userId) {
        await supabaseJournalRepo.deleteEntry(id)
      }
    } catch (error) {
      console.warn('Supabase journal delete failed, continuing with local storage:', error)
    }

    await journalRepo.deleteEntry(id)
  },

  async getAllEntries(userId?: string): Promise<JournalEntry[]> {
    const supabase = await getSupabaseClient()

    try {
      if (supabase && userId) {
        const entries = await supabaseJournalRepo.getAllEntries(userId)
        await Promise.all(entries.map(entry => journalRepo.upsertEntry(entry)))
        return entries
      }
    } catch (error) {
      console.warn('Supabase journal fetch failed, using local storage:', error)
    }

    return journalRepo.getAllEntries()
  },
}