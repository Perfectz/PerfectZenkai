import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { WeightEntry, WeightGoal, WeightGoalInput } from './types'
import { supabase } from '@/lib/supabase'

class WeightDatabase extends Dexie {
  weights!: Table<WeightEntry>
  goals!: Table<WeightGoal>

  constructor(userId?: string) {
    // Create user-specific database name
    const dbName = userId ? `WeightDatabase_${userId}` : 'WeightDatabase'
    super(dbName)
    this.version(1).stores({
      weights: 'id, dateISO, kg',
    })
    this.version(2).stores({
      weights: 'id, dateISO, kg',
      goals: 'id, targetWeight, goalType, targetDate, startingWeight, isActive, createdAt, updatedAt',
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

// Supabase repository for weight goals
export const supabaseWeightGoalRepo = {
  async addGoal(goal: WeightGoalInput, userId: string): Promise<WeightGoal> {
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('weight_goals')
      .insert({
        user_id: userId,
        target_weight: goal.targetWeight,
        goal_type: goal.goalType,
        target_date: goal.targetDate || null,
        starting_weight: goal.startingWeight || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      targetWeight: data.target_weight,
      goalType: data.goal_type,
      targetDate: data.target_date,
      startingWeight: data.starting_weight,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  async updateGoal(id: string, goal: Partial<WeightGoalInput>): Promise<WeightGoal> {
    if (!supabase) throw new Error('Supabase not available')

    const updateData: Record<string, unknown> = {}
    if (goal.targetWeight !== undefined) updateData.target_weight = goal.targetWeight
    if (goal.goalType !== undefined) updateData.goal_type = goal.goalType
    if (goal.targetDate !== undefined) updateData.target_date = goal.targetDate
    if (goal.startingWeight !== undefined) updateData.starting_weight = goal.startingWeight

    const { data, error } = await supabase
      .from('weight_goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      targetWeight: data.target_weight,
      goalType: data.goal_type,
      targetDate: data.target_date,
      startingWeight: data.starting_weight,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  async getActiveGoal(userId: string): Promise<WeightGoal | null> {
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('weight_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return {
      id: data.id,
      userId: data.user_id,
      targetWeight: data.target_weight,
      goalType: data.goal_type,
      targetDate: data.target_date,
      startingWeight: data.starting_weight,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  async deactivateGoal(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('weight_goals')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  },

  async getAllGoals(userId: string): Promise<WeightGoal[]> {
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('weight_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      targetWeight: item.target_weight,
      goalType: item.goal_type,
      targetDate: item.target_date,
      startingWeight: item.starting_weight,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  },
}

// Local IndexedDB repository for goals (offline functionality)
export const weightGoalRepo = {
  async addGoal(goal: WeightGoalInput): Promise<WeightGoal> {
    const database = getDatabase()
    
    // Deactivate existing active goals
    const existingGoals = await database.goals.where('isActive').equals(1).toArray()
    for (const existingGoal of existingGoals) {
      await database.goals.update(existingGoal.id, { isActive: false, updatedAt: new Date().toISOString() })
    }

    const newGoal: WeightGoal = {
      id: uuidv4(),
      targetWeight: goal.targetWeight,
      goalType: goal.goalType,
      targetDate: goal.targetDate,
      startingWeight: goal.startingWeight,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await database.goals.add(newGoal)
    return newGoal
  },

  async updateGoal(id: string, goal: Partial<WeightGoalInput>): Promise<WeightGoal> {
    const database = getDatabase()
    const updateData = {
      ...goal,
      updatedAt: new Date().toISOString(),
    }
    
    await database.goals.update(id, updateData)
    const updatedGoal = await database.goals.get(id)
    if (!updatedGoal) throw new Error('Goal not found')
    
    return updatedGoal
  },

  async getActiveGoal(): Promise<WeightGoal | null> {
    const database = getDatabase()
    const activeGoal = await database.goals.where('isActive').equals(1).first()
    return activeGoal || null
  },

  async deactivateGoal(id: string): Promise<void> {
    const database = getDatabase()
    await database.goals.update(id, { 
      isActive: false, 
      updatedAt: new Date().toISOString() 
    })
  },

  async getAllGoals(): Promise<WeightGoal[]> {
    const database = getDatabase()
    return await database.goals.orderBy('createdAt').reverse().toArray()
  },
}

// Hybrid repository for goals
export const hybridWeightGoalRepo = {
  async addGoal(goal: WeightGoalInput, userId?: string): Promise<WeightGoal> {
    try {
      if (supabase && userId) {
        // Try Supabase first
        const result = await supabaseWeightGoalRepo.addGoal(goal, userId)
        // Also save to local for offline access
        await weightGoalRepo.addGoal(goal)
        return result
      }
    } catch (error) {
      console.warn('Supabase goal save failed, using local storage:', error)
    }
    
    // Fallback to local storage
    return await weightGoalRepo.addGoal(goal)
  },

  async updateGoal(id: string, goal: Partial<WeightGoalInput>, userId?: string): Promise<WeightGoal> {
    try {
      if (supabase && userId) {
        const result = await supabaseWeightGoalRepo.updateGoal(id, goal)
        // Also update local
        await weightGoalRepo.updateGoal(id, goal)
        return result
      }
    } catch (error) {
      console.warn('Supabase goal update failed, using local storage:', error)
    }
    
    return await weightGoalRepo.updateGoal(id, goal)
  },

  async getActiveGoal(userId?: string): Promise<WeightGoal | null> {
    try {
      if (supabase && userId) {
        return await supabaseWeightGoalRepo.getActiveGoal(userId)
      }
    } catch (error) {
      console.warn('Supabase goal fetch failed, using local storage:', error)
    }
    
    return await weightGoalRepo.getActiveGoal()
  },

  async deactivateGoal(id: string, userId?: string): Promise<void> {
    try {
      if (supabase && userId) {
        await supabaseWeightGoalRepo.deactivateGoal(id)
      }
    } catch (error) {
      console.warn('Supabase goal deactivation failed:', error)
    }
    
    await weightGoalRepo.deactivateGoal(id)
  },

  async getAllGoals(userId?: string): Promise<WeightGoal[]> {
    try {
      if (supabase && userId) {
        return await supabaseWeightGoalRepo.getAllGoals(userId)
      }
    } catch (error) {
      console.warn('Supabase goals fetch failed, using local storage:', error)
    }
    
    return await weightGoalRepo.getAllGoals()
  },
}
