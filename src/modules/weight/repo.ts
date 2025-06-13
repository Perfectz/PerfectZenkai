import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { WeightEntry } from './types'

class WeightDatabase extends Dexie {
  weights!: Table<WeightEntry>

  constructor(userId?: string) {
    // Create user-specific database name
    const dbName = userId ? `WeightDatabase_${userId}` : 'WeightDatabase'
    super(dbName)
    this.version(1).stores({
      weights: 'id, dateISO, kg'
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

export const weightRepo = {
  async addWeight(entry: Omit<WeightEntry, 'id'>): Promise<WeightEntry> {
    const database = getDatabase()
    const newEntry: WeightEntry = {
      id: uuidv4(),
      ...entry
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
  }
} 