
import { create } from 'zustand'
import { offlineSyncService } from '@/shared/services/OfflineSyncService'
import { useAuthStore } from '@/modules/auth'
import { hybridWorkoutRepo, initializeWorkoutDatabase } from '../repo'

import { 
  WorkoutEntry, 
  Exercise, 
  WorkoutTemplate, 
  WorkoutAnalytics,
  WorkoutGoal,
  EXERCISE_LIBRARY,
  calculateCalories
} from '../types'

interface WorkoutStore {
  // State
  workouts: WorkoutEntry[]
  exercises: Exercise[]
  templates: WorkoutTemplate[]
  analytics: WorkoutAnalytics | null
  goals: WorkoutGoal[]
  isLoading: boolean
  error: string | null

  // Actions
  loadWorkouts: () => Promise<void>
  loadExercises: () => Promise<void>
  loadTemplates: () => Promise<void>
  loadAnalytics: () => Promise<void>
  loadGoals: () => Promise<void>
  
  addWorkout: (workout: Omit<WorkoutEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateWorkout: (id: string, updates: Partial<WorkoutEntry>) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
  
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>
  deleteExercise: (id: string) => Promise<void>
  
  addTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTemplate: (id: string, updates: Partial<WorkoutTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  
  addGoal: (goal: Omit<WorkoutGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<WorkoutGoal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  
  initializeExerciseLibrary: () => Promise<void>
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  // Initial state
  workouts: [],
  exercises: [],
  templates: [],
  analytics: null,
  goals: [],
  isLoading: false,
  error: null,

  // Load workouts
  loadWorkouts: async () => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        if (userId) {
          await initializeWorkoutDatabase(userId)
        }

        const workouts = await hybridWorkoutRepo.getAllWorkouts(userId)
        set({ workouts, isLoading: false })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to load workouts (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Load exercises
  loadExercises: async () => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        if (userId) {
          await initializeWorkoutDatabase(userId)
        }

        const mappedData = await hybridWorkoutRepo.getAllExercises(userId)
        
        set({ exercises: mappedData, isLoading: false })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to load exercises (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Load templates
  loadTemplates: async () => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        if (userId) {
          await initializeWorkoutDatabase(userId)
        }

        const templates = await hybridWorkoutRepo.getAllTemplates(userId)
        set({ templates, isLoading: false })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to load templates (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Load analytics
  loadAnalytics: async () => {
    const { workouts } = get()
    if (workouts.length === 0) return

    try {
      // Calculate analytics from workouts
      const totalWorkouts = workouts.length
      const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)
      const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0)
      
      // Calculate streak
      const sortedWorkouts = [...workouts].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      
      const today = new Date()
      const workoutDates = new Set(
        sortedWorkouts.map(w => new Date(w.createdAt).toDateString())
      )
      
      // Calculate current streak
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        
        if (workoutDates.has(checkDate.toDateString())) {
          if (i === 0 || currentStreak > 0) currentStreak++
        } else if (i > 0) {
          break
        }
      }
      
      // Calculate longest streak
      sortedWorkouts.forEach((workout, index) => {
        const workoutDate = new Date(workout.createdAt)
        const prevWorkoutDate = index > 0 ? new Date(sortedWorkouts[index - 1].createdAt) : null
        
        if (!prevWorkoutDate || 
            Math.abs(workoutDate.getTime() - prevWorkoutDate.getTime()) <= 24 * 60 * 60 * 1000) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          tempStreak = 1
        }
      })
      
      // Calculate average intensity
      const intensityValues = { light: 1, moderate: 2, intense: 3 }
      const avgIntensity = workouts.reduce((sum, w) => 
        sum + intensityValues[w.intensity], 0) / workouts.length
      
      // Exercise type breakdown
      const exerciseTypeBreakdown = workouts.reduce((acc, workout) => {
        const type = workout.exerciseType
        if (!acc[type]) {
          acc[type] = { count: 0, duration: 0, calories: 0 }
        }
        acc[type].count++
        acc[type].duration += workout.duration
        acc[type].calories += workout.calories || 0
        return acc
      }, {} as Record<string, { count: number; duration: number; calories: number }>)
      
      // Find favorite exercise type
      const favoriteExerciseType = Object.entries(exerciseTypeBreakdown)
        .sort(([,a], [,b]) => b.count - a.count)[0]?.[0] || 'cardio'
      
      // Weekly progress
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)
      
      const weeklyProgress = workouts
        .filter(w => new Date(w.createdAt) >= weekStart)
        .reduce((sum, w) => sum + w.duration, 0)
      
      // Monthly stats
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthlyWorkouts = workouts.filter(w => new Date(w.createdAt) >= monthStart)
      const monthlyStats = {
        workouts: monthlyWorkouts.length,
        duration: monthlyWorkouts.reduce((sum, w) => sum + w.duration, 0),
        calories: monthlyWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0)
      }

      const analytics: WorkoutAnalytics = {
        totalWorkouts,
        totalDuration,
        totalCalories,
        currentStreak,
        longestStreak,
        averageIntensity: avgIntensity,
        favoriteExerciseType: favoriteExerciseType as 'cardio' | 'strength' | 'flexibility' | 'sports',
        weeklyGoal: 150, // Default WHO recommendation
        weeklyProgress,
        monthlyStats,
        exerciseTypeBreakdown
      }

      set({ analytics })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  // Load goals
  loadGoals: async () => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        if (userId) {
          await initializeWorkoutDatabase(userId)
        }

        const goals = await hybridWorkoutRepo.getAllGoals(userId)
        set({ goals, isLoading: false })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to load goals (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Add workout
  addWorkout: async (workoutData) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        // Calculate calories if not provided
        const calories = workoutData.calories || calculateCalories(
          workoutData.exerciseType,
          workoutData.duration,
          workoutData.intensity
        )

        const userId = useAuthStore.getState().user?.id
        const mappedWorkout = await hybridWorkoutRepo.addWorkout({
          ...workoutData,
          calories,
        }, userId)

        const { workouts } = get()
        set({ 
          workouts: [mappedWorkout, ...workouts],
          isLoading: false 
        })

        // Refresh analytics
        get().loadAnalytics()

        offlineSyncService.queueOperation({
          type: 'CREATE',
          table: 'workout_entries',
          data: mappedWorkout,
          localId: mappedWorkout.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to add workout (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Update workout
  updateWorkout: async (id, updates) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        const mappedWorkout = await hybridWorkoutRepo.updateWorkout(id, updates, userId)

        const { workouts } = get()
        set({
          workouts: workouts.map(w => w.id === id ? mappedWorkout : w),
          isLoading: false
        })

        // Refresh analytics
        get().loadAnalytics()

        offlineSyncService.queueOperation({
          type: 'UPDATE',
          table: 'workout_entries',
          data: mappedWorkout,
          localId: mappedWorkout.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to update workout (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Delete workout
  deleteWorkout: async (id) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        await hybridWorkoutRepo.deleteWorkout(id, userId)

        const { workouts } = get()
        set({
          workouts: workouts.filter(w => w.id !== id),
          isLoading: false
        })

        // Refresh analytics
        get().loadAnalytics()

        offlineSyncService.queueOperation({
          type: 'DELETE',
          table: 'workout_entries',
          data: { id },
          localId: id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to delete workout (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Add exercise
  addExercise: async (exerciseData) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        // Map camelCase fields to snake_case for database
        const dbData = {
          name: exerciseData.name,
          type: exerciseData.type,
          category: exerciseData.category,
          description: exerciseData.description,
          instructions: exerciseData.instructions,
          muscle_groups: exerciseData.muscleGroups, // camelCase to snake_case
          equipment: exerciseData.equipment,
          is_custom: exerciseData.isCustom, // camelCase to snake_case
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const userId = useAuthStore.getState().user?.id
        const mappedData = await hybridWorkoutRepo.addExercise({
          name: dbData.name,
          type: dbData.type,
          category: dbData.category,
          description: dbData.description,
          instructions: dbData.instructions,
          muscleGroups: dbData.muscle_groups,
          equipment: dbData.equipment,
          isCustom: dbData.is_custom,
        }, userId)

        const { exercises } = get()
        set({ 
          exercises: [...exercises, mappedData],
          isLoading: false 
        })

        offlineSyncService.queueOperation({
          type: 'CREATE',
          table: 'exercises',
          data: mappedData,
          localId: mappedData.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to add exercise (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Update exercise
  updateExercise: async (id, updates) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        // Map camelCase fields to snake_case for database
        const dbUpdates: Record<string, unknown> = {
          updated_at: new Date().toISOString()
        }
        
        if (updates.name !== undefined) dbUpdates.name = updates.name
        if (updates.type !== undefined) dbUpdates.type = updates.type
        if (updates.category !== undefined) dbUpdates.category = updates.category
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.instructions !== undefined) dbUpdates.instructions = updates.instructions
        if (updates.muscleGroups !== undefined) dbUpdates.muscle_groups = updates.muscleGroups
        if (updates.equipment !== undefined) dbUpdates.equipment = updates.equipment
        if (updates.isCustom !== undefined) dbUpdates.is_custom = updates.isCustom

        const userId = useAuthStore.getState().user?.id
        const mappedData = await hybridWorkoutRepo.updateExercise(id, updates, userId)

        const { exercises } = get()
        set({
          exercises: exercises.map(e => e.id === id ? mappedData : e),
          isLoading: false
        })

        offlineSyncService.queueOperation({
          type: 'UPDATE',
          table: 'exercises',
          data: mappedData,
          localId: mappedData.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to update exercise (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Delete exercise
  deleteExercise: async (id) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        await hybridWorkoutRepo.deleteExercise(id, userId)

        const { exercises } = get()
        set({
          exercises: exercises.filter(e => e.id !== id),
          isLoading: false
        })

        offlineSyncService.queueOperation({
          type: 'DELETE',
          table: 'exercises',
          data: { id },
          localId: id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to delete exercise (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Add template
  addTemplate: async (templateData) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        const mappedTemplate = await hybridWorkoutRepo.addTemplate(templateData, userId)

        const { templates } = get()
        set({ 
          templates: [...templates, mappedTemplate],
          isLoading: false 
        })

        offlineSyncService.queueOperation({
          type: 'CREATE',
          table: 'workout_templates',
          data: mappedTemplate,
          localId: mappedTemplate.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to add template (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Update template
  updateTemplate: async (id, updates) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        const mappedTemplate = await hybridWorkoutRepo.updateTemplate(id, updates, userId)

        const { templates } = get()
        set({
          templates: templates.map(t => t.id === id ? mappedTemplate : t),
          isLoading: false
        })

        offlineSyncService.queueOperation({
          type: 'UPDATE',
          table: 'workout_templates',
          data: mappedTemplate,
          localId: mappedTemplate.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to update template (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Delete template
  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        await hybridWorkoutRepo.deleteTemplate(id, userId)

        const { templates } = get()
        set({
          templates: templates.filter(t => t.id !== id),
          isLoading: false
        })

        offlineSyncService.queueOperation({
          type: 'DELETE',
          table: 'workout_templates',
          data: { id },
          localId: id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to delete template (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Add goal
  addGoal: async (goalData) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        const data = await hybridWorkoutRepo.addGoal(goalData, userId)

        const { goals } = get()
        set({ 
          goals: [data, ...goals],
          isLoading: false 
        })

        offlineSyncService.queueOperation({
          type: 'CREATE',
          table: 'workout_goals',
          data: data,
          localId: data.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to add goal (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Update goal
  updateGoal: async (id, updates) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        const data = await hybridWorkoutRepo.updateGoal(id, updates, userId)

        const { goals } = get()
        set({
          goals: goals.map(g => g.id === id ? data : g),
          isLoading: false
        })

        offlineSyncService.queueOperation({
          type: 'UPDATE',
          table: 'workout_goals',
          data: data,
          localId: data.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to update goal (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Delete goal
  deleteGoal: async (id) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const userId = useAuthStore.getState().user?.id
        await hybridWorkoutRepo.deleteGoal(id, userId)

        const { goals } = get()
        set({
          goals: goals.filter(g => g.id !== id),
          isLoading: false
        })

        offlineSyncService.queueOperation({
          type: 'DELETE',
          table: 'workout_goals',
          data: { id },
          localId: id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to delete goal (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },

  // Initialize exercise library
  initializeExerciseLibrary: async () => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const { exercises } = get()
        
        // Only add exercises that don't already exist
        const existingNames = new Set(exercises.map(e => e.name))
        const newExercises = EXERCISE_LIBRARY.filter(e => !existingNames.has(e.name))
        
        if (newExercises.length > 0) {
          const userId = useAuthStore.getState().user?.id
          const mappedData = await hybridWorkoutRepo.seedExercises(
            newExercises.map(exercise => ({
              ...exercise,
              isCustom: false,
            })),
            userId
          )

          set({ 
            exercises: [...exercises, ...mappedData],
            isLoading: false 
          })
        } else {
          set({ isLoading: false })
        }
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to initialize exercise library (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      }
    }
  },
})) 