// src/modules/ai-chat/types/langchain.types.ts

import { BaseMessage } from '@langchain/core/messages'

export interface LangchainConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  streaming: boolean
  timeout: number
}

export interface UserContext {
  workouts: WorkoutContext[]
  meals: MealContext[]
  weight: WeightContext
  tasks: TaskContext[]
  preferences: UserPreferences
}

export interface WorkoutContext {
  date: string
  exercises: Exercise[]
  duration: number
  intensity: 'low' | 'medium' | 'high'
  caloriesBurned?: number
}

export interface Exercise {
  name: string
  sets?: number
  reps?: number
  weight?: number
  duration?: number
  type: 'strength' | 'cardio' | 'flexibility' | 'martial-arts'
}

export interface MealContext {
  date: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: Food[]
  calories: number
  macros: Macros
}

export interface Food {
  name: string
  quantity: number
  unit: string
  calories: number
}

export interface Macros {
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

export interface WeightContext {
  currentWeight: number
  goalWeight?: number
  trend: 'increasing' | 'decreasing' | 'stable'
  entries: WeightEntry[]
  unit: 'kg' | 'lbs'
}

export interface WeightEntry {
  date: string
  weight: number
  bodyFat?: number
  muscleMass?: number
}

export interface TaskContext {
  completed: number
  pending: number
  overdue: number
  categories: string[]
  productivity: 'low' | 'medium' | 'high'
  streaks: number
}

export interface UserPreferences {
  goals: string[]
  dietaryRestrictions: string[]
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  preferredWorkoutTypes: string[]
  timezone: string
}

export interface ContextBuilder {
  buildContext: (depth: 'shallow' | 'medium' | 'deep') => Promise<UserContext>
  formatContextForPrompt: (context: UserContext) => string
}

export interface MessageProcessor {
  processMessage: (content: string, context: UserContext) => Promise<BaseMessage[]>
  createSystemPrompt: (context: UserContext) => string
}

export interface RateLimiter {
  checkLimit: () => boolean
  waitForLimit: () => Promise<void>
  resetLimit: () => void
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  backoffFactor: number
  jitter: boolean
} 