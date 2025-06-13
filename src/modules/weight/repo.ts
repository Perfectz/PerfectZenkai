import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { WeightEntry } from './types'
import { supabase } from '@/lib/supabase'

class WeightDatabase extends Dexie {
  weights!: Table<WeightEntry>

  constructor(userId?: string) {
    // Create user-specific database name
    const dbName = userId ? `WeightDatabase_${userId}` : 'WeightDatabase'
    super(dbName)
    this.version(1).stores({
      weights: 'id, dateISO, kg',
    })
  }
}

// Global database instance - will be reinitialized per user
let db: WeightDatabase

// Initialize database for specific user
export const initializeWeightDatabase = (userId: string) => {
  if (db) {
    db.close()
  }
  db = new WeightDatabase(userId)
  return db
}

// Get current database instance
const getDatabase = (): WeightDatabase => {
  if (!db) {
    // Fallback to anonymous database if no user
    db = new WeightDatabase()
  }
  return db
}

// Supabase repository for cloud storage
export const supabaseWeightRepo = {
  async addWeight(entry: Omit<WeightEntry, 'id'>, userId: string): Promise<WeightEntry> {
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('weight_entries')
      .insert({
        user_id: userId,
        date_iso: entry.dateISO,
        kg: entry.kg,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      dateISO: data.date_iso,
      kg: data.kg,
    }
  },

  async deleteWeight(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAllWeights(userId: string): Promise<WeightEntry[]> {
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date_iso', { ascending: false })

    if (error) throw error

    return (data || []).map(item => ({
      id: item.id,
      dateISO: item.date_iso,
      kg: item.kg,
    }))
  },

  async getWeightById(id: string): Promise<WeightEntry | undefined> {
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return undefined

    return {
      id: data.id,
      dateISO: data.date_iso,
      kg: data.kg,
    }
  },

  async clearAll(userId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  },
}

// Original IndexedDB repository (kept for offline functionality)
export const weightRepo = {
  async addWeight(entry: Omit<WeightEntry, 'id'>): Promise<WeightEntry> {
    const database = getDatabase()
    const newEntry: WeightEntry = {
      id: uuidv4(),
      ...entry,
    }

    await database.weights.add(newEntry)
    return newEntry
  },

  async deleteWeight(id: string): Promise<void> {
    const database = getDatabase()
    await database.weights.delete(id)
  },

  async getAllWeights(): Promise<WeightEntry[]> {
    const database = getDatabase()
    return await database.weights.orderBy('dateISO').reverse().toArray()
  },

  async getWeightById(id: string): Promise<WeightEntry | undefined> {
    const database = getDatabase()
    return await database.weights.get(id)
  },

  async clearAll(): Promise<void> {
    const database = getDatabase()
    await database.weights.clear()
  },
}

// Hybrid repository that uses Supabase when available, falls back to IndexedDB
export const hybridWeightRepo = {
  async addWeight(entry: Omit<WeightEntry, 'id'>, userId?: string): Promise<WeightEntry> {
    try {
      if (supabase && userId) {
        // Try Supabase first
        const result = await supabaseWeightRepo.addWeight(entry, userId)
        // Also save to local for offline access
        await weightRepo.addWeight(entry)
        return result
      }
    } catch (error) {
      console.warn('Supabase save failed, using local storage:', error)
    }
    
    // Fallback to local storage
    return await weightRepo.addWeight(entry)
  },

  async deleteWeight(id: string, userId?: string): Promise<void> {
    try {
      if (supabase && userId) {
        await supabaseWeightRepo.deleteWeight(id)
      }
    } catch (error) {
      console.warn('Supabase delete failed:', error)
    }
    
    // Always delete from local
    await weightRepo.deleteWeight(id)
  },

  async getAllWeights(userId?: string): Promise<WeightEntry[]> {
    try {
      if (supabase && userId) {
        // Try to get from Supabase first
        return await supabaseWeightRepo.getAllWeights(userId)
      }
    } catch (error) {
      console.warn('Supabase fetch failed, using local storage:', error)
    }
    
    // Fallback to local storage
    return await weightRepo.getAllWeights()
  },

  async getWeightById(id: string, userId?: string): Promise<WeightEntry | undefined> {
    try {
      if (supabase && userId) {
        return await supabaseWeightRepo.getWeightById(id)
      }
    } catch (error) {
      console.warn('Supabase fetch failed, using local storage:', error)
    }
    
    return await weightRepo.getWeightById(id)
  },

  async clearAll(userId?: string): Promise<void> {
    try {
      if (supabase && userId) {
        await supabaseWeightRepo.clearAll(userId)
      }
    } catch (error) {
      console.warn('Supabase clear failed:', error)
    }
    
    await weightRepo.clearAll()
  },
}
