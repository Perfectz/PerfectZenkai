export interface WeightEntry {
  id: string // UUID v4
  dateISO: string // ISO date string (YYYY-MM-DD)
  kg: number // Weight in kilograms (stored as kg for consistency, but displayed as lbs)
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
