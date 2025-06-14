export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface NutritionSummary {
  calories: number
  protein: number // grams
  carbs: number   // grams
  fat: number     // grams
  fiber: number   // grams
}

export interface FoodItem {
  id: string
  name: string
  quantity: number
  unit: 'gram' | 'cup' | 'piece' | 'tbsp' | 'serving'
  calories: number
  macros: {
    protein: number // grams
    carbs: number   // grams
    fat: number     // grams
    fiber: number   // grams
  }
}

export interface MealPhoto {
  id: string
  mealId: string
  url: string
  thumbnail: string
  timestamp: string
  location?: GeolocationCoordinates
  size: number // bytes
  compressed: boolean
}

export interface MealContext {
  location?: string
  voiceNotes?: string[]
  tags: string[]
  mood?: 'great' | 'good' | 'neutral' | 'poor'
  hunger?: 1 | 2 | 3 | 4 | 5
  satisfaction?: 1 | 2 | 3 | 4 | 5
}

export interface MealEntry {
  id: string // UUID v4
  userId?: string // User ID for Supabase
  type: MealType
  timestamp: string // ISO timestamp
  foods: FoodItem[]
  photos?: string[]
  notes?: string
  location?: string
  nutrition: NutritionSummary
  context?: MealContext
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}

export interface MealEntryInput {
  type: MealType
  timestamp?: string // defaults to now
  foods: Omit<FoodItem, 'id'>[]
  photos?: string[]
  notes?: string
  location?: string
  context?: Partial<MealContext>
}

// Diet Hub Types
export type DietTab = 'weight' | 'meals'

export interface DietCorrelation {
  weeklyTrends: {
    weightChange: number // in lbs
    calorieAverage: number
    correlation: number // -1 to 1
  }
  insights: string[]
  recommendations: string[]
}

export interface DietAnalytics {
  totalMeals: number
  averageCalories: number
  weeklyCalories: number
  monthlyCalories: number
  macroBalance: {
    protein: number // percentage
    carbs: number   // percentage
    fat: number     // percentage
  }
  mealFrequency: Record<MealType, number>
  streak: number // days with logged meals
}

// Smart Suggestions
export interface MealSuggestions {
  byTimeOfDay: Record<string, string[]> // "08:00" -> ["oatmeal", "coffee"]
  recentFoods: FoodItem[]
  popularFoods: FoodItem[]
  customFoods: FoodItem[]
}

export interface SmartSuggestionEngine {
  getSuggestionsForTime: (time: Date) => FoodItem[]
  getRecentFoods: (userId: string, limit: number) => FoodItem[]
  searchFoods: (query: string) => FoodItem[]
  createCustomFood: (food: Partial<FoodItem>) => FoodItem
}

// Insights
export interface DietInsight {
  id: string
  type: 'correlation' | 'pattern' | 'recommendation' | 'achievement'
  title: string
  description: string
  actionable: boolean
  action?: string
  confidence: number // 0-1
  dataPoints: number
  trend: 'positive' | 'negative' | 'neutral'
}

// Common food database
export interface CommonFood {
  id: string
  name: string
  category: string
  defaultUnit: FoodItem['unit']
  defaultQuantity: number
  caloriesPerUnit: number
  macrosPerUnit: {
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  mealTypes: MealType[] // which meals this food is commonly eaten for
} 