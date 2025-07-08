import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { WeightEntry, WeightGoal, WeightGoalInput } from './types'
import { getSupabaseClient } from '@/lib/supabase-client'

// Supabase database row interfaces
interface SupabaseWeightEntry {
  id: string
  date_iso: string
  kg: number
  user_id: string
  created_at?: string
  updated_at?: string
}

interface SupabaseWeightGoal {
  id: string
  goal_type: 'lose' | 'gain' | 'maintain'
  target_weight: number
  target_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

class WeightDatabase extends Dexie {
  weights!: Table<WeightEntry>
  goals!: Table<WeightGoal>

  constructor(userId?: string) {
    // Create user-specific database name
    const dbName = userId ? `WeightDatabase_${userId}` : 'WeightDatabase'
    super(dbName)
    this.version(32).stores({
      weights: 'id, dateISO, kg',
      goals: 'id, targetWeight, goalType, targetDate, startingWeight, isActive, createdAt, updatedAt',
    })
  }
}

// Global database instance - will be reinitialized per user
let db: WeightDatabase | null = null
let currentUserId: string | null = null
let initializationPromise: Promise<WeightDatabase> | null = null

// Initialize database for specific user with proper singleton management
export const initializeWeightDatabase = async (userId: string): Promise<WeightDatabase> => {
  // If we already have a database for this user, return it
  if (db && currentUserId === userId && !db.hasBeenClosed()) {
    return db
  }

  // If there's already an initialization in progress for this user, wait for it
  if (initializationPromise && currentUserId === userId) {
    return initializationPromise
  }

  // Create new initialization promise
  initializationPromise = (async () => {
    try {
      // Close existing database if it exists and is for a different user
      if (db && (currentUserId !== userId || db.hasBeenClosed())) {
        try {
          if (!db.hasBeenClosed()) {
            await db.close()
          }
        } catch (error) {
          console.warn('Warning: Error closing existing database:', error)
        }
        db = null
      }

      // Create new database instance
      currentUserId = userId
      db = new WeightDatabase(userId)
      
      // Wait for database to be ready by attempting to open
      await db.open()
      
      console.log(`✅ Weight database initialized for user: ${userId}`)
      return db
    } catch (error) {
      console.error('❌ Failed to initialize weight database:', error)
      db = null
      currentUserId = null
      throw error
    } finally {
      initializationPromise = null
    }
  })()

  return initializationPromise
}

// Get current database instance
const getDatabase = (): WeightDatabase => {
  if (!db || db.hasBeenClosed()) {
    // Fallback to anonymous database if no user or database is closed
    console.warn('⚠️ Database not initialized or has been closed, creating fallback instance')
    db = new WeightDatabase()
  }
  return db
}

// Supabase repository for cloud storage
export const supabaseWeightRepo = {
  async addWeight(entry: Omit<WeightEntry, 'id'>, userId: string): Promise<WeightEntry> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    // First try to insert
    const { data, error } = await supabase
      .from('weight_entries')
      .insert({
        user_id: userId,
        date_iso: entry.dateISO,
        kg: entry.kg,
      })
      .select()
      .single()

    // If duplicate key error, update the existing entry instead
    if (error && error.code === '23505') {
      const { data: updateData, error: updateError } = await supabase
        .from('weight_entries')
        .update({
          kg: entry.kg,
        })
        .eq('user_id', userId)
        .eq('date_iso', entry.dateISO)
        .select()
        .single()

      if (updateError) throw updateError

      return {
        id: updateData.id,
        dateISO: updateData.date_iso ?? '',
        kg: updateData.kg ?? 0,
        weight: updateData.kg ?? 0, // Alias for kg to support both property names
      }
    }

    if (error) throw error

    return {
      id: data.id,
      dateISO: data.date_iso ?? '',
      kg: data.kg ?? 0,
      weight: data.kg ?? 0, // Alias for kg to support both property names
    }
  },

  async deleteWeight(id: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getAllWeights(userId: string): Promise<WeightEntry[]> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date_iso', { ascending: false })

    if (error) throw error

    return (data || []).map((item: SupabaseWeightEntry) => ({
      id: item.id,
      dateISO: item.date_iso ?? '',
      kg: item.kg ?? 0,
      weight: item.kg ?? 0, // Alias for kg to support both property names
    }))
  },

  async getWeightById(id: string): Promise<WeightEntry | undefined> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined // Entry not found
      }
      throw error
    }

    return {
      id: data.id,
      dateISO: data.date_iso ?? '',
      kg: data.kg ?? 0,
      weight: data.kg ?? 0, // Alias for kg to support both property names
    }
  },

  async updateWeight(id: string, updates: Partial<Omit<WeightEntry, 'id'>>): Promise<WeightEntry> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const updateData: Record<string, unknown> = {}
    if (updates.dateISO !== undefined) updateData.date_iso = updates.dateISO
    if (updates.kg !== undefined) updateData.kg = updates.kg

    const { data, error } = await supabase
      .from('weight_entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // If entry not found, it might be a local-only entry
      if (error.code === 'PGRST116') {
        throw new Error('Weight entry not found in cloud storage')
      }
      throw error
    }

    return {
      id: data.id,
      dateISO: data.date_iso ?? '',
      kg: data.kg ?? 0,
      weight: data.kg ?? 0, // Alias for kg to support both property names
    }
  },

  async clearAll(userId: string): Promise<void> {
    const supabase = await getSupabaseClient()
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
    
    // Check if entry already exists for this date
    const existingEntry = await database.weights
      .where('dateISO')
      .equals(entry.dateISO)
      .first()

    if (existingEntry) {
      // Update existing entry
      const updatedEntry: WeightEntry = {
        ...existingEntry,
        kg: entry.kg,
      }
      await database.weights.put(updatedEntry)
      return updatedEntry
    } else {
      // Create new entry
      const newEntry: WeightEntry = {
        id: uuidv4(),
        ...entry,
      }
      await database.weights.add(newEntry)
      return newEntry
    }
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

  async updateWeight(id: string, updates: Partial<Omit<WeightEntry, 'id'>>): Promise<WeightEntry> {
    const database = getDatabase()
    
    // Get the existing entry
    const existing = await database.weights.get(id)
    if (!existing) {
      throw new Error('Weight entry not found')
    }

    // Create updated entry
    const updatedEntry: WeightEntry = {
      ...existing,
      ...updates,
    }

    // Update in database
    await database.weights.put(updatedEntry)
    return updatedEntry
  },

  async clearAll(): Promise<void> {
    const database = getDatabase()
    await database.weights.clear()
  },
}

// Hybrid repository that uses Supabase when available, falls back to IndexedDB
export const hybridWeightRepo = {
  async addWeight(entry: Omit<WeightEntry, 'id'>, userId?: string): Promise<WeightEntry> {
    const supabase = await getSupabaseClient()
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
    const supabase = await getSupabaseClient()
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
    const supabase = await getSupabaseClient()
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
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        return await supabaseWeightRepo.getWeightById(id)
      }
    } catch (error) {
      console.warn('Supabase fetch failed, using local storage:', error)
    }
    
    return await weightRepo.getWeightById(id)
  },

  async updateWeight(id: string, updates: Partial<Omit<WeightEntry, 'id'>>, userId?: string): Promise<WeightEntry> {
    const supabase = await getSupabaseClient()
    let cloudResult: WeightEntry | null = null

    // Try Supabase first if available
    if (supabase && userId) {
      try {
        cloudResult = await supabaseWeightRepo.updateWeight(id, updates)
      } catch (error) {
        console.warn('Supabase update failed:', error)
        
        // If the entry doesn't exist in Supabase, try to create it
        if (error instanceof Error && error.message.includes('not found in cloud storage')) {
          try {
            // Get the full entry from local storage first
            const localEntry = await weightRepo.getWeightById(id)
            if (localEntry) {
              // Create the entry in Supabase with the updates applied
              const entryToCreate = { ...localEntry, ...updates }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              delete (entryToCreate as any).id // Remove id for creation
              cloudResult = await supabaseWeightRepo.addWeight(entryToCreate, userId)
              console.log('✅ Created missing entry in Supabase:', cloudResult)
            }
          } catch (createError) {
            console.warn('Failed to create entry in Supabase:', createError)
          }
        }
      }
    }
    
    // Try to update local storage, but handle missing entries gracefully
    let localResult: WeightEntry
    try {
      localResult = await weightRepo.updateWeight(id, updates)
    } catch (localError) {
      // If local entry doesn't exist, try to create it (this is normal for cloud sync)
      if (localError instanceof Error && localError.message.includes('Weight entry not found')) {
        console.info('🔄 Local entry not found, syncing from cloud data (normal behavior)')
        
        try {
          // If we have a cloud result, use that to create local entry
          if (cloudResult) {
            await weightRepo.addWeight({
              dateISO: cloudResult.dateISO,
              kg: cloudResult.kg,
              weight: cloudResult.kg
            })
            localResult = cloudResult
            console.info('✅ Successfully synced entry to local storage:', { id: cloudResult.id, dateISO: cloudResult.dateISO })
          } else {
            // Create a new entry with the updates (fallback)
            const newEntry = {
              dateISO: updates.dateISO || new Date().toISOString().split('T')[0],
              kg: updates.kg || 0,
              weight: updates.kg || 0
            }
            localResult = await weightRepo.addWeight(newEntry)
            console.info('✅ Created new local entry as fallback:', { id: localResult.id, dateISO: localResult.dateISO })
          }
        } catch (createError) {
          console.error('❌ Failed to sync entry to local storage:', createError)
          // If all else fails, return cloud result or throw
          if (cloudResult) {
            console.info('📤 Returning cloud result despite local sync failure')
            return cloudResult
          }
          throw localError
        }
      } else {
        // This is an unexpected error, log it properly
        console.error('❌ Unexpected local storage error:', localError)
        throw localError
      }
    }
    
    // Return cloud result if successful, otherwise local result
    return cloudResult || localResult
  },

  async clearAll(userId?: string): Promise<void> {
    const supabase = await getSupabaseClient()
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
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    // First, deactivate any existing active goals
    await supabase
      .from('weight_goals')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)

    const { data, error } = await supabase
      .from('weight_goals')
      .insert({
        user_id: userId,
        goal_type: goal.goalType,
        target_weight: goal.targetWeight,
        target_date: goal.targetDate,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      goalType: data.goal_type,
      targetWeight: data.target_weight ?? 0,
      targetDate: data.target_date ?? '',
      isActive: data.is_active ?? false,
      createdAt: data.created_at ?? new Date().toISOString(),
      updatedAt: data.updated_at ?? new Date().toISOString(),
    }
  },

  async updateGoal(id: string, goal: Partial<WeightGoalInput>): Promise<WeightGoal> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const updateData: Record<string, unknown> = {}
    if (goal.goalType !== undefined) updateData.goal_type = goal.goalType
    if (goal.targetWeight !== undefined) updateData.target_weight = goal.targetWeight
    if (goal.targetDate !== undefined) updateData.target_date = goal.targetDate

    const { data, error } = await supabase
      .from('weight_goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      goalType: data.goal_type,
      targetWeight: data.target_weight ?? 0,
      targetDate: data.target_date ?? '',
      isActive: data.is_active ?? false,
      createdAt: data.created_at ?? new Date().toISOString(),
      updatedAt: data.updated_at ?? new Date().toISOString(),
    }
  },

  async getActiveGoal(userId: string): Promise<WeightGoal | null> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('weight_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No active goal found
      }
      // Log the full error for debugging 406 issues
      console.error('Supabase getActiveGoal error:', error.message, error.code, error.details, error.hint)
      throw error
    }

    if (!data) {
      return null // Explicitly return null if no data is found
    }

    return {
      id: data.id,
      goalType: data.goal_type,
      targetWeight: data.target_weight ?? 0,
      targetDate: data.target_date ?? '',
      isActive: data.is_active ?? false,
      createdAt: data.created_at ?? new Date().toISOString(),
      updatedAt: data.updated_at ?? new Date().toISOString(),
    }
  },

  async deactivateGoal(id: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { error } = await supabase
      .from('weight_goals')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  },

  async getAllGoals(userId: string): Promise<WeightGoal[]> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')

    const { data, error } = await supabase
      .from('weight_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((item: SupabaseWeightGoal) => ({
      id: item.id,
      goalType: item.goal_type,
      targetWeight: item.target_weight ?? 0,
      targetDate: item.target_date ?? '',
      isActive: item.is_active ?? false,
      createdAt: item.created_at ?? new Date().toISOString(),
      updatedAt: item.updated_at ?? new Date().toISOString(),
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
    const supabase = await getSupabaseClient()
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
    const supabase = await getSupabaseClient()
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
    const supabase = await getSupabaseClient()
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
    const supabase = await getSupabaseClient()
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
    const supabase = await getSupabaseClient()
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
