import Dexie, { Table } from 'dexie'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { Exercise, WorkoutEntry, WorkoutGoal, WorkoutTemplate } from './types'

type RecordLike = Record<string, unknown>

class WorkoutDatabase extends Dexie {
  workouts!: Table<WorkoutEntry>
  exercises!: Table<Exercise>
  templates!: Table<WorkoutTemplate>
  goals!: Table<WorkoutGoal>

  constructor(userId?: string) {
    const dbName = userId ? `WorkoutDatabase_${userId}` : 'WorkoutDatabase'
    super(dbName)
    this.version(1).stores({
      workouts: 'id, exerciseId, exerciseName, exerciseType, createdAt, updatedAt',
      exercises: 'id, name, type, category, createdAt, updatedAt',
      templates: 'id, name, difficulty, createdAt, updatedAt',
      goals: 'id, type, period, isActive, createdAt, updatedAt',
    })
  }
}

let db: WorkoutDatabase | null = null
let currentUserId: string | null = null
let initializationPromise: Promise<WorkoutDatabase> | null = null

export const initializeWorkoutDatabase = async (userId: string): Promise<WorkoutDatabase> => {
  if (db && currentUserId === userId && db.isOpen()) {
    return db
  }

  if (initializationPromise && currentUserId === userId) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    if (db && (currentUserId !== userId || !db.isOpen())) {
      db.close()
      db = null
    }

    currentUserId = userId
    db = new WorkoutDatabase(userId)
    await db.open()
    return db
  })()

  try {
    return await initializationPromise
  } finally {
    initializationPromise = null
  }
}

const getDatabase = (): WorkoutDatabase => {
  if (!db || !db.isOpen()) {
    db = new WorkoutDatabase()
    currentUserId = null
  }

  return db
}

const readString = (record: RecordLike, ...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') {
      return value
    }
  }

  return undefined
}

const readNumber = (record: RecordLike, ...keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number') {
      return value
    }
  }

  return undefined
}

const readBoolean = (record: RecordLike, ...keys: string[]): boolean | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') {
      return value
    }
  }

  return undefined
}

const readStringArray = (record: RecordLike, ...keys: string[]): string[] | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
      return value
    }
  }

  return undefined
}

const mapWorkoutRecord = (record: RecordLike): WorkoutEntry => ({
  id: readString(record, 'id') || crypto.randomUUID(),
  exerciseId: readString(record, 'exerciseId', 'exercise_id') || '',
  exerciseName: readString(record, 'exerciseName', 'exercise_name') || '',
  exerciseType: (readString(record, 'exerciseType', 'exercise_type') as WorkoutEntry['exerciseType']) || 'other',
  duration: readNumber(record, 'duration') || 0,
  intensity: (readString(record, 'intensity') as WorkoutEntry['intensity']) || 'moderate',
  calories: readNumber(record, 'calories'),
  notes: readString(record, 'notes'),
  sets: readNumber(record, 'sets'),
  reps: readNumber(record, 'reps'),
  weight: readNumber(record, 'weight'),
  distance: readNumber(record, 'distance'),
  createdAt: readString(record, 'createdAt', 'created_at') || new Date().toISOString(),
  updatedAt: readString(record, 'updatedAt', 'updated_at') || readString(record, 'createdAt', 'created_at') || new Date().toISOString(),
})

const mapExerciseRecord = (record: RecordLike): Exercise => ({
  id: readString(record, 'id') || crypto.randomUUID(),
  name: readString(record, 'name') || '',
  type: (readString(record, 'type') as Exercise['type']) || 'other',
  category: readString(record, 'category') || 'General',
  description: readString(record, 'description'),
  instructions: readString(record, 'instructions'),
  muscleGroups: readStringArray(record, 'muscleGroups', 'muscle_groups'),
  equipment: readStringArray(record, 'equipment'),
  isCustom: readBoolean(record, 'isCustom', 'is_custom') ?? false,
  createdAt: readString(record, 'createdAt', 'created_at') || new Date().toISOString(),
  updatedAt: readString(record, 'updatedAt', 'updated_at') || readString(record, 'createdAt', 'created_at') || new Date().toISOString(),
})

const mapTemplateExercises = (record: RecordLike): WorkoutTemplate['exercises'] => {
  const raw = record.exercises
  if (!Array.isArray(raw)) {
    return []
  }

  return raw.filter((item): item is WorkoutTemplate['exercises'][number] => {
    if (typeof item !== 'object' || item === null) {
      return false
    }

    const entry = item as RecordLike
    return typeof entry.exerciseId === 'string' && typeof entry.exerciseName === 'string'
  })
}

const mapTemplateRecord = (record: RecordLike): WorkoutTemplate => ({
  id: readString(record, 'id') || crypto.randomUUID(),
  name: readString(record, 'name') || '',
  description: readString(record, 'description'),
  exercises: mapTemplateExercises(record),
  estimatedDuration: readNumber(record, 'estimatedDuration', 'estimated_duration') || 0,
  difficulty: (readString(record, 'difficulty') as WorkoutTemplate['difficulty']) || 'moderate',
  tags: readStringArray(record, 'tags') || [],
  isCustom: readBoolean(record, 'isCustom', 'is_custom') ?? true,
  createdAt: readString(record, 'createdAt', 'created_at') || new Date().toISOString(),
  updatedAt: readString(record, 'updatedAt', 'updated_at') || readString(record, 'createdAt', 'created_at') || new Date().toISOString(),
})

const mapGoalRecord = (record: RecordLike): WorkoutGoal => ({
  id: readString(record, 'id') || crypto.randomUUID(),
  type: (readString(record, 'type') as WorkoutGoal['type']) || 'duration',
  target: readNumber(record, 'target') || 0,
  period: (readString(record, 'period') as WorkoutGoal['period']) || 'weekly',
  description: readString(record, 'description') || '',
  isActive: readBoolean(record, 'isActive', 'is_active') ?? false,
  createdAt: readString(record, 'createdAt', 'created_at') || new Date().toISOString(),
  updatedAt: readString(record, 'updatedAt', 'updated_at') || readString(record, 'createdAt', 'created_at') || new Date().toISOString(),
})

const withTimestamps = <T extends object>(record: T): T & { createdAt: string; updatedAt: string } => {
  const now = new Date().toISOString()
  return {
    ...record,
    createdAt: now,
    updatedAt: now,
  }
}

const updateTimestamp = <T extends object>(record: T): T & { updatedAt: string } => ({
  ...record,
  updatedAt: new Date().toISOString(),
})

const workoutLocalRepo = {
  async addWorkout(workout: Omit<WorkoutEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutEntry> {
    const database = getDatabase()
    const newWorkout: WorkoutEntry = {
      ...withTimestamps(workout),
      id: crypto.randomUUID(),
    }
    await database.workouts.put(newWorkout)
    return newWorkout
  },

  async upsertWorkout(workout: WorkoutEntry): Promise<WorkoutEntry> {
    const database = getDatabase()
    await database.workouts.put(workout)
    return workout
  },

  async updateWorkout(id: string, updates: Partial<WorkoutEntry>): Promise<WorkoutEntry> {
    const database = getDatabase()
    const existingWorkout = await database.workouts.get(id)
    if (!existingWorkout) throw new Error('Workout not found')
    const updatedWorkout: WorkoutEntry = { ...existingWorkout, ...updateTimestamp(updates) }
    await database.workouts.put(updatedWorkout)
    return updatedWorkout
  },

  async deleteWorkout(id: string): Promise<void> {
    const database = getDatabase()
    await database.workouts.delete(id)
  },

  async getAllWorkouts(): Promise<WorkoutEntry[]> {
    const database = getDatabase()
    return database.workouts.orderBy('createdAt').reverse().toArray()
  },
}

const exerciseLocalRepo = {
  async addExercise(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise> {
    const database = getDatabase()
    const newExercise: Exercise = {
      ...withTimestamps(exercise),
      id: crypto.randomUUID(),
    }
    await database.exercises.put(newExercise)
    return newExercise
  },

  async upsertExercise(exercise: Exercise): Promise<Exercise> {
    const database = getDatabase()
    await database.exercises.put(exercise)
    return exercise
  },

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    const database = getDatabase()
    const existingExercise = await database.exercises.get(id)
    if (!existingExercise) throw new Error('Exercise not found')
    const updatedExercise: Exercise = { ...existingExercise, ...updateTimestamp(updates) }
    await database.exercises.put(updatedExercise)
    return updatedExercise
  },

  async deleteExercise(id: string): Promise<void> {
    const database = getDatabase()
    await database.exercises.delete(id)
  },

  async getAllExercises(): Promise<Exercise[]> {
    const database = getDatabase()
    return database.exercises.orderBy('name').toArray()
  },
}

const templateLocalRepo = {
  async addTemplate(template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutTemplate> {
    const database = getDatabase()
    const newTemplate: WorkoutTemplate = {
      ...withTimestamps(template),
      id: crypto.randomUUID(),
    }
    await database.templates.put(newTemplate)
    return newTemplate
  },

  async upsertTemplate(template: WorkoutTemplate): Promise<WorkoutTemplate> {
    const database = getDatabase()
    await database.templates.put(template)
    return template
  },

  async updateTemplate(id: string, updates: Partial<WorkoutTemplate>): Promise<WorkoutTemplate> {
    const database = getDatabase()
    const existingTemplate = await database.templates.get(id)
    if (!existingTemplate) throw new Error('Workout template not found')
    const updatedTemplate: WorkoutTemplate = { ...existingTemplate, ...updateTimestamp(updates) }
    await database.templates.put(updatedTemplate)
    return updatedTemplate
  },

  async deleteTemplate(id: string): Promise<void> {
    const database = getDatabase()
    await database.templates.delete(id)
  },

  async getAllTemplates(): Promise<WorkoutTemplate[]> {
    const database = getDatabase()
    return database.templates.orderBy('name').toArray()
  },
}

const goalLocalRepo = {
  async addGoal(goal: Omit<WorkoutGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutGoal> {
    const database = getDatabase()
    const newGoal: WorkoutGoal = {
      ...withTimestamps(goal),
      id: crypto.randomUUID(),
    }
    await database.goals.put(newGoal)
    return newGoal
  },

  async upsertGoal(goal: WorkoutGoal): Promise<WorkoutGoal> {
    const database = getDatabase()
    await database.goals.put(goal)
    return goal
  },

  async updateGoal(id: string, updates: Partial<WorkoutGoal>): Promise<WorkoutGoal> {
    const database = getDatabase()
    const existingGoal = await database.goals.get(id)
    if (!existingGoal) throw new Error('Workout goal not found')
    const updatedGoal: WorkoutGoal = { ...existingGoal, ...updateTimestamp(updates) }
    await database.goals.put(updatedGoal)
    return updatedGoal
  },

  async deleteGoal(id: string): Promise<void> {
    const database = getDatabase()
    await database.goals.delete(id)
  },

  async getAllGoals(): Promise<WorkoutGoal[]> {
    const database = getDatabase()
    return database.goals.orderBy('createdAt').reverse().toArray()
  },
}

const supabaseWorkoutRepo = {
  async getAllWorkouts(): Promise<WorkoutEntry[]> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase.from('workout_entries').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(item => mapWorkoutRecord(item as RecordLike))
  },

  async addWorkout(workout: Omit<WorkoutEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutEntry> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase
      .from('workout_entries')
      .insert([{
        ...workout,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()
    if (error) throw error
    return mapWorkoutRecord(data as RecordLike)
  },

  async updateWorkout(id: string, updates: Partial<WorkoutEntry>): Promise<WorkoutEntry> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase
      .from('workout_entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return mapWorkoutRecord(data as RecordLike)
  },

  async deleteWorkout(id: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { error } = await supabase.from('workout_entries').delete().eq('id', id)
    if (error) throw error
  },
}

const supabaseExerciseRepo = {
  async getAllExercises(): Promise<Exercise[]> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase.from('exercises').select('*').order('name')
    if (error) throw error
    return (data || []).map(item => mapExerciseRecord(item as RecordLike))
  },

  async addExercise(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase
      .from('exercises')
      .insert([{
        name: exercise.name,
        type: exercise.type,
        category: exercise.category,
        description: exercise.description,
        instructions: exercise.instructions,
        muscle_groups: exercise.muscleGroups,
        equipment: exercise.equipment,
        is_custom: exercise.isCustom,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()
    if (error) throw error
    return mapExerciseRecord(data as RecordLike)
  },

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase
      .from('exercises')
      .update({
        name: updates.name,
        type: updates.type,
        category: updates.category,
        description: updates.description,
        instructions: updates.instructions,
        muscle_groups: updates.muscleGroups,
        equipment: updates.equipment,
        is_custom: updates.isCustom,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return mapExerciseRecord(data as RecordLike)
  },

  async deleteExercise(id: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (error) throw error
  },
}

const supabaseTemplateRepo = {
  async getAllTemplates(): Promise<WorkoutTemplate[]> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase.from('workout_templates').select('*').order('name')
    if (error) throw error
    return (data || []).map(item => mapTemplateRecord(item as RecordLike))
  },

  async addTemplate(template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutTemplate> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase
      .from('workout_templates')
      .insert([{
        ...template,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()
    if (error) throw error
    return mapTemplateRecord(data as RecordLike)
  },

  async updateTemplate(id: string, updates: Partial<WorkoutTemplate>): Promise<WorkoutTemplate> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase
      .from('workout_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return mapTemplateRecord(data as RecordLike)
  },

  async deleteTemplate(id: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { error } = await supabase.from('workout_templates').delete().eq('id', id)
    if (error) throw error
  },
}

const supabaseGoalRepo = {
  async getAllGoals(): Promise<WorkoutGoal[]> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase.from('workout_goals').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(item => mapGoalRecord(item as RecordLike))
  },

  async addGoal(goal: Omit<WorkoutGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutGoal> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase
      .from('workout_goals')
      .insert([{
        ...goal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()
    if (error) throw error
    return mapGoalRecord(data as RecordLike)
  },

  async updateGoal(id: string, updates: Partial<WorkoutGoal>): Promise<WorkoutGoal> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { data, error } = await supabase
      .from('workout_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return mapGoalRecord(data as RecordLike)
  },

  async deleteGoal(id: string): Promise<void> {
    const supabase = await getSupabaseClient()
    if (!supabase) throw new Error('Supabase not available')
    const { error } = await supabase.from('workout_goals').delete().eq('id', id)
    if (error) throw error
  },
}

export const hybridWorkoutRepo = {
  async getAllWorkouts(userId?: string): Promise<WorkoutEntry[]> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const workouts = await supabaseWorkoutRepo.getAllWorkouts()
        await Promise.all(workouts.map(workout => workoutLocalRepo.upsertWorkout(workout)))
        return workouts
      }
    } catch (error) {
      console.warn('Supabase workout fetch failed, using local storage:', error)
    }
    return workoutLocalRepo.getAllWorkouts()
  },

  async addWorkout(workout: Omit<WorkoutEntry, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<WorkoutEntry> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const result = await supabaseWorkoutRepo.addWorkout(workout)
        await workoutLocalRepo.upsertWorkout(result)
        return result
      }
    } catch (error) {
      console.warn('Supabase workout save failed, using local storage:', error)
    }
    return workoutLocalRepo.addWorkout(workout)
  },

  async updateWorkout(id: string, updates: Partial<WorkoutEntry>, userId?: string): Promise<WorkoutEntry> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const result = await supabaseWorkoutRepo.updateWorkout(id, updates)
        await workoutLocalRepo.upsertWorkout(result)
        return result
      }
    } catch (error) {
      console.warn('Supabase workout update failed, using local storage:', error)
    }
    return workoutLocalRepo.updateWorkout(id, updates)
  },

  async deleteWorkout(id: string, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        await supabaseWorkoutRepo.deleteWorkout(id)
      }
    } catch (error) {
      console.warn('Supabase workout delete failed, continuing with local storage:', error)
    }
    await workoutLocalRepo.deleteWorkout(id)
  },

  async getAllExercises(userId?: string): Promise<Exercise[]> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const exercises = await supabaseExerciseRepo.getAllExercises()
        await Promise.all(exercises.map(exercise => exerciseLocalRepo.upsertExercise(exercise)))
        return exercises
      }
    } catch (error) {
      console.warn('Supabase exercise fetch failed, using local storage:', error)
    }
    return exerciseLocalRepo.getAllExercises()
  },

  async addExercise(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<Exercise> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const result = await supabaseExerciseRepo.addExercise(exercise)
        await exerciseLocalRepo.upsertExercise(result)
        return result
      }
    } catch (error) {
      console.warn('Supabase exercise save failed, using local storage:', error)
    }
    return exerciseLocalRepo.addExercise(exercise)
  },

  async updateExercise(id: string, updates: Partial<Exercise>, userId?: string): Promise<Exercise> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const result = await supabaseExerciseRepo.updateExercise(id, updates)
        await exerciseLocalRepo.upsertExercise(result)
        return result
      }
    } catch (error) {
      console.warn('Supabase exercise update failed, using local storage:', error)
    }
    return exerciseLocalRepo.updateExercise(id, updates)
  },

  async deleteExercise(id: string, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        await supabaseExerciseRepo.deleteExercise(id)
      }
    } catch (error) {
      console.warn('Supabase exercise delete failed, continuing with local storage:', error)
    }
    await exerciseLocalRepo.deleteExercise(id)
  },

  async seedExercises(exercises: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>[], userId?: string): Promise<Exercise[]> {
    const existingExercises = await this.getAllExercises(userId)
    const existingNames = new Set(existingExercises.map(exercise => exercise.name))
    const missingExercises = exercises.filter(exercise => !existingNames.has(exercise.name))

    if (missingExercises.length === 0) {
      return []
    }

    const insertedExercises: Exercise[] = []
    for (const exercise of missingExercises) {
      insertedExercises.push(await this.addExercise(exercise, userId))
    }

    return insertedExercises
  },

  async getAllTemplates(userId?: string): Promise<WorkoutTemplate[]> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const templates = await supabaseTemplateRepo.getAllTemplates()
        await Promise.all(templates.map(template => templateLocalRepo.upsertTemplate(template)))
        return templates
      }
    } catch (error) {
      console.warn('Supabase template fetch failed, using local storage:', error)
    }
    return templateLocalRepo.getAllTemplates()
  },

  async addTemplate(template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<WorkoutTemplate> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const result = await supabaseTemplateRepo.addTemplate(template)
        await templateLocalRepo.upsertTemplate(result)
        return result
      }
    } catch (error) {
      console.warn('Supabase template save failed, using local storage:', error)
    }
    return templateLocalRepo.addTemplate(template)
  },

  async updateTemplate(id: string, updates: Partial<WorkoutTemplate>, userId?: string): Promise<WorkoutTemplate> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const result = await supabaseTemplateRepo.updateTemplate(id, updates)
        await templateLocalRepo.upsertTemplate(result)
        return result
      }
    } catch (error) {
      console.warn('Supabase template update failed, using local storage:', error)
    }
    return templateLocalRepo.updateTemplate(id, updates)
  },

  async deleteTemplate(id: string, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        await supabaseTemplateRepo.deleteTemplate(id)
      }
    } catch (error) {
      console.warn('Supabase template delete failed, continuing with local storage:', error)
    }
    await templateLocalRepo.deleteTemplate(id)
  },

  async getAllGoals(userId?: string): Promise<WorkoutGoal[]> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const goals = await supabaseGoalRepo.getAllGoals()
        await Promise.all(goals.map(goal => goalLocalRepo.upsertGoal(goal)))
        return goals
      }
    } catch (error) {
      console.warn('Supabase workout goal fetch failed, using local storage:', error)
    }
    return goalLocalRepo.getAllGoals()
  },

  async addGoal(goal: Omit<WorkoutGoal, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<WorkoutGoal> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const result = await supabaseGoalRepo.addGoal(goal)
        await goalLocalRepo.upsertGoal(result)
        return result
      }
    } catch (error) {
      console.warn('Supabase workout goal save failed, using local storage:', error)
    }
    return goalLocalRepo.addGoal(goal)
  },

  async updateGoal(id: string, updates: Partial<WorkoutGoal>, userId?: string): Promise<WorkoutGoal> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        const result = await supabaseGoalRepo.updateGoal(id, updates)
        await goalLocalRepo.upsertGoal(result)
        return result
      }
    } catch (error) {
      console.warn('Supabase workout goal update failed, using local storage:', error)
    }
    return goalLocalRepo.updateGoal(id, updates)
  },

  async deleteGoal(id: string, userId?: string): Promise<void> {
    const supabase = await getSupabaseClient()
    try {
      if (supabase && userId) {
        await supabaseGoalRepo.deleteGoal(id)
      }
    } catch (error) {
      console.warn('Supabase workout goal delete failed, continuing with local storage:', error)
    }
    await goalLocalRepo.deleteGoal(id)
  },
}
