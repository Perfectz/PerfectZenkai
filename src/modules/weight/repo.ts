import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { WeightEntry } from './types'

class WeightDatabase extends Dexie {
  weights!: Table<WeightEntry>

  constructor() {
    super('WeightDatabase')
    this.version(1).stores({
      weights: 'id, dateISO, kg'
    })
  }
}

const db = new WeightDatabase()

export const weightRepo = {
  async addWeight(entry: Omit<WeightEntry, 'id'>): Promise<WeightEntry> {
    const newEntry: WeightEntry = {
      id: uuidv4(),
      ...entry
    }
    
    await db.weights.add(newEntry)
    return newEntry
  },

  async deleteWeight(id: string): Promise<void> {
    await db.weights.delete(id)
  },

  async getAllWeights(): Promise<WeightEntry[]> {
    return await db.weights.orderBy('dateISO').reverse().toArray()
  },

  async getWeightById(id: string): Promise<WeightEntry | undefined> {
    return await db.weights.get(id)
  },

  async clearAll(): Promise<void> {
    await db.weights.clear()
  }
} 