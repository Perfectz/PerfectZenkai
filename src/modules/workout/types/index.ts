export type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other'
export type IntensityLevel = 'light' | 'moderate' | 'intense'
export type HealthTab = 'weight' | 'meals' | 'workout'

export interface Exercise {
  id: string
  name: string
  type: ExerciseType
  category: string
  description?: string
  instructions?: string
  muscleGroups?: string[]
  equipment?: string[]
  isCustom: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkoutEntry {
  id: string
  exerciseId: string
  exerciseName: string
  exerciseType: ExerciseType
  duration: number // in minutes
  intensity: IntensityLevel
  calories?: number
  notes?: string
  sets?: number
  reps?: number
  weight?: number // in kg for strength training
  distance?: number // in km for cardio
  createdAt: string
  updatedAt: string
}

export interface WorkoutTemplate {
  id: string
  name: string
  description?: string
  exercises: {
    exerciseId: string
    exerciseName: string
    duration: number
    intensity: IntensityLevel
    sets?: number
    reps?: number
    weight?: number
    restTime?: number
  }[]
  estimatedDuration: number
  difficulty: IntensityLevel
  tags: string[]
  isCustom: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkoutAnalytics {
  totalWorkouts: number
  totalDuration: number // in minutes
  totalCalories: number
  currentStreak: number
  longestStreak: number
  averageIntensity: number
  favoriteExerciseType: ExerciseType
  weeklyGoal: number // minutes per week
  weeklyProgress: number // current week minutes
  monthlyStats: {
    workouts: number
    duration: number
    calories: number
  }
  exerciseTypeBreakdown: Record<ExerciseType, {
    count: number
    duration: number
    calories: number
  }>
}

export interface WorkoutGoal {
  id: string
  type: 'duration' | 'frequency' | 'calories' | 'streak'
  target: number
  period: 'daily' | 'weekly' | 'monthly'
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Common exercise library
export const EXERCISE_LIBRARY: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>[] = [
  // Cardio
  { name: 'Running', type: 'cardio', category: 'Running', muscleGroups: ['legs', 'core'], equipment: [] },
  { name: 'Walking', type: 'cardio', category: 'Walking', muscleGroups: ['legs'], equipment: [] },
  { name: 'Cycling', type: 'cardio', category: 'Cycling', muscleGroups: ['legs', 'core'], equipment: ['bike'] },
  { name: 'Swimming', type: 'cardio', category: 'Swimming', muscleGroups: ['full-body'], equipment: ['pool'] },
  { name: 'Jump Rope', type: 'cardio', category: 'HIIT', muscleGroups: ['legs', 'arms', 'core'], equipment: ['jump-rope'] },
  
  // Strength
  { name: 'Push-ups', type: 'strength', category: 'Bodyweight', muscleGroups: ['chest', 'arms', 'core'], equipment: [] },
  { name: 'Pull-ups', type: 'strength', category: 'Bodyweight', muscleGroups: ['back', 'arms'], equipment: ['pull-up-bar'] },
  { name: 'Squats', type: 'strength', category: 'Bodyweight', muscleGroups: ['legs', 'glutes'], equipment: [] },
  { name: 'Deadlifts', type: 'strength', category: 'Weightlifting', muscleGroups: ['back', 'legs', 'core'], equipment: ['barbell'] },
  { name: 'Bench Press', type: 'strength', category: 'Weightlifting', muscleGroups: ['chest', 'arms'], equipment: ['barbell', 'bench'] },
  
  // Flexibility
  { name: 'Yoga', type: 'flexibility', category: 'Yoga', muscleGroups: ['full-body'], equipment: ['yoga-mat'] },
  { name: 'Stretching', type: 'flexibility', category: 'Stretching', muscleGroups: ['full-body'], equipment: [] },
  { name: 'Pilates', type: 'flexibility', category: 'Pilates', muscleGroups: ['core', 'full-body'], equipment: ['yoga-mat'] },
  
  // Sports
  { name: 'Basketball', type: 'sports', category: 'Team Sports', muscleGroups: ['legs', 'core'], equipment: ['basketball'] },
  { name: 'Tennis', type: 'sports', category: 'Racquet Sports', muscleGroups: ['arms', 'legs', 'core'], equipment: ['tennis-racquet'] },
  { name: 'Soccer', type: 'sports', category: 'Team Sports', muscleGroups: ['legs', 'core'], equipment: ['soccer-ball'] },
]

// Utility functions
export const getExerciseTypeColor = (type: ExerciseType): string => {
  switch (type) {
    case 'cardio': return 'text-red-400'
    case 'strength': return 'text-blue-400'
    case 'flexibility': return 'text-green-400'
    case 'sports': return 'text-purple-400'
    case 'other': return 'text-gray-400'
  }
}

export const getIntensityColor = (intensity: IntensityLevel): string => {
  switch (intensity) {
    case 'light': return 'text-green-400'
    case 'moderate': return 'text-yellow-400'
    case 'intense': return 'text-red-400'
  }
}

export const calculateCalories = (
  exerciseType: ExerciseType,
  duration: number,
  intensity: IntensityLevel,
  weight: number = 70 // default weight in kg
): number => {
  // Base MET values for different exercise types
  const baseMET: Record<ExerciseType, number> = {
    cardio: 8,
    strength: 6,
    flexibility: 3,
    sports: 7,
    other: 5
  }
  
  // Intensity multipliers
  const intensityMultiplier: Record<IntensityLevel, number> = {
    light: 0.7,
    moderate: 1.0,
    intense: 1.4
  }
  
  const met = baseMET[exerciseType] * intensityMultiplier[intensity]
  return Math.round((met * weight * duration) / 60)
} 