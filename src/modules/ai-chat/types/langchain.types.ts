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
  correlations?: ContextCorrelations
}

export interface WorkoutContext {
  date: string
  exercises: Exercise[]
  duration: number
  intensity: 'low' | 'medium' | 'high'
  caloriesBurned?: number
  performanceMetrics?: {
    averageHeartRate?: number
    maxHeartRate?: number
    recoveryTime?: number
  }
  progressTrend?: 'improving' | 'maintaining' | 'declining'
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
  nutritionScore?: number
  dietaryPatterns?: string[]
  healthMetrics?: {
    fiber: number
    sugar: number
    sodium: number
  }
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
  // Enhanced macro analysis
  proteinRatio?: number
  carbRatio?: number
  fatRatio?: number
}

export interface WeightContext {
  currentWeight: number
  goalWeight?: number
  trend: 'increasing' | 'decreasing' | 'stable'
  entries: WeightEntry[]
  unit: 'kg' | 'lbs'
  progressAnalysis?: string
  predictedGoalDate?: string
  weeklyAverage?: number
  volatility?: number
  changeRate?: number
  consistency?: number
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
  productivityPatterns?: {
    bestTimeOfDay: string
    mostProductiveDays: string[]
    averageCompletionTime: number
  }
  completionTrends?: {
    weeklyRate: number
    monthlyRate: number
    trend: 'improving' | 'stable' | 'declining'
  }
  focusAreas?: string[]
  completionRate?: number
  currentStreak?: number
  longestStreak?: number
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

export interface ContextCorrelations {
  workoutWeightCorrelation?: {
    correlation: number
    significance: 'strong' | 'moderate' | 'weak' | 'none'
    insights: string[]
  }
  nutritionPerformanceCorrelation?: {
    correlation: number
    significance: 'strong' | 'moderate' | 'weak' | 'none'
    insights: string[]
  }
  mealTimingImpact?: {
    preWorkoutMeals: string
    postWorkoutMeals: string
    energyCorrelation: number
  }
  healthProductivityCorrelation?: {
    correlation: number
    significance: 'strong' | 'moderate' | 'weak' | 'none'
    insights: string[]
  }
  exerciseTaskCorrelation?: {
    correlation: number
    significance: 'strong' | 'moderate' | 'weak' | 'none'
    insights: string[]
  }
} 