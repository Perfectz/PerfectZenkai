export interface WeightEntry {
  id: string // UUID v4
  dateISO: string // ISO date string (YYYY-MM-DD)
  kg: number // Weight in kilograms (stored as kg for consistency, but displayed as lbs)
  weight?: number // Alias for kg to support both property names (optional for backward compatibility)
}

export interface WeightGoal {
  id: string // UUID v4
  userId?: string // User ID for Supabase
  targetWeight: number // Target weight in kg (stored as kg, displayed as lbs)
  goalType: 'lose' | 'gain' | 'maintain'
  targetDate?: string // ISO date string (YYYY-MM-DD)
  startingWeight?: number // Starting weight in kg (stored as kg, displayed as lbs)
  isActive: boolean
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}

export interface WeightGoalInput {
  targetWeight: number // Input in lbs, converted to kg for storage
  goalType: 'lose' | 'gain' | 'maintain'
  targetDate?: string
  startingWeight?: number // Input in lbs, converted to kg for storage
}

// Utility functions for weight conversion
export const kgToLbs = (kg: number): number => kg * 2.20462
export const lbsToKg = (lbs: number): number => lbs / 2.20462

// === WEIGHT MANAGEMENT AGENT TYPES ===

export interface WeightTrendAnalysis {
  trend: 'losing' | 'gaining' | 'maintaining' | 'fluctuating'
  rate: number // kg per week
  confidence: number // 0-1
  totalChange: number
  streakDays: number
  volatility: number // Added for enhanced analytics
}

export interface WeightStatistics {
  mean: number
  median: number
  standardDeviation: number
  variance: number
  minWeight: number
  maxWeight: number
  range: number
  quartiles: { q1: number, q3: number } // Added for enhanced analytics
  outliers: WeightEntry[] // Added for outlier detection
}

export interface WeightPlateau {
  startDate: string
  endDate: string
  duration: number // days
  averageWeight: number
  variance: number
}

export interface GoalRecommendation {
  type: 'lose' | 'gain' | 'maintain'
  targetWeight: number
  targetDate: string
  feasibility: 'high' | 'medium' | 'low'
  ratePerWeek: number
  reasoning: string
  healthRisk: 'low' | 'medium' | 'high'
  confidence: number
}

export interface WeightMilestone {
  weight: number
  targetDate: string
  description: string
  progress: number // 0-100
  achieved: boolean
}

export interface ProgressPrediction {
  predictedWeight: number
  date: string
  confidence: number
  upperBound: number
  lowerBound: number
  methodology: 'linear' | 'seasonal' | 'adaptive'
}

export interface WeightCoaching {
  message: string
  type: 'encouragement' | 'concern' | 'milestone' | 'adjustment'
  priority: 'low' | 'medium' | 'high'
  actionItems: string[]
  nextCheckIn: string
}

export interface WeightInsight {
  id: string
  type: 'trend' | 'goal' | 'prediction' | 'recommendation'
  title: string
  description: string
  importance: 'low' | 'medium' | 'high'
  generatedAt: string
  data: Record<string, unknown>
}
