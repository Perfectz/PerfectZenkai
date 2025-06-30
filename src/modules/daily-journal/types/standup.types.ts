// Daily Journal Types
export interface Priority {
  id: string
  description: string
  category: 'work' | 'personal' | 'health' | 'learning' | 'other'
  estimatedTime: number // in minutes
  importance: number // 1-5 scale
  urgency: number // 1-5 scale
  linkedTaskIds: string[]
  linkedGoalId?: string
}

export interface DailyStandup {
  id: string
  userId: string
  date: string // YYYY-MM-DD format
  
  // Yesterday's Review
  yesterdayAccomplishments: string[]
  yesterdayBlockers: string[]
  yesterdayLessons: string
  
  // Today's Planning
  todayPriorities: Priority[]
  todayEnergyLevel: number // 1-10 scale
  todayMood: string
  todayAvailableHours: number
  todayFocusAreas: string[]
  currentChallenges: string[]
  neededResources: string[]
  motivationLevel: number // 1-10 scale
  
  // Metadata
  createdAt: string
  completionTime: number // in seconds
}

export interface EveningReflection {
  id: string
  userId: string
  date: string // YYYY-MM-DD format
  standupId: string
  
  // Progress Tracking
  prioritiesCompleted: string[] // Priority IDs
  prioritiesPartial: string[] // Priority IDs
  prioritiesSkipped: string[] // Priority IDs
  unexpectedTasks: string[]
  
  // Goal Integration
  goalProgress: Array<{
    goalId: string
    progressMade: string
    completionPercentage: number
  }>
  goalBlockers: string[]
  goalInsights: string
  
  // Energy & Mood Tracking
  endEnergyLevel: number // 1-10 scale
  endMood: string
  energyPeaks: Array<{ time: string; activity: string }>
  energyDips: Array<{ time: string; cause: string }>
  
  // Reflection
  dayHighlights: string[]
  dayLowlights: string[]
  lessonsLearned: string
  improvementAreas: string[]
  
  // Tomorrow Planning
  tomorrowPriorities: string[]
  tomorrowConcerns: string[]
  tomorrowOpportunities: string[]
  
  // Scoring
  satisfactionScore: number // 1-10 scale
  
  // Metadata
  createdAt: string
  completionTime: number // in seconds
}

// Analysis Types
export interface ProgressAnalysis {
  completionRate: number
  partialCompletionRate: number
  totalProductivityScore: number
  timeEstimationAccuracy: number
}

export interface CompletionPatterns {
  averageCompletionRate: number
  consistencyScore: number
  trendDirection: 'improving' | 'declining' | 'stable'
  bestPerformanceDays: string[]
  challengingDays: string[]
}

export interface ProductivityPatterns {
  energyPatterns: {
    peakHours: string[]
    lowHours: string[]
    averageEnergyLevel: number
  }
  moodProductivityCorrelation: number
  optimalWorkingHours: number
  preferredTaskTypes: string[]
}

// Form Types
export interface StandupFormData {
  yesterdayAccomplishments: string
  yesterdayBlockers: string
  yesterdayLessons: string
  todayPriorities: Array<{
    description: string
    category: Priority['category']
    importance: number
    urgency: number
    estimatedTime?: number
  }>
  todayEnergyLevel: number
  todayMood: string
  todayAvailableHours: number
  motivationLevel: number
}

export interface ReflectionFormData {
  prioritiesCompleted: string[]
  prioritiesPartial: string[]
  prioritiesSkipped: string[]
  unexpectedTasks: string[]
  endEnergyLevel: number
  endMood: string
  dayHighlights: string[]
  dayLowlights: string[]
  lessonsLearned: string
  improvementAreas: string[]
  tomorrowPriorities: string[]
  satisfactionScore: number
}

// Store Types
export interface DailyJournalStore {
  // State
  standups: DailyStandup[]
  reflections: EveningReflection[]
  currentStandup: DailyStandup | null
  currentReflection: EveningReflection | null
  isLoading: boolean
  error: string | null
  
  // Actions
  createStandup: (data: Partial<DailyStandup>) => Promise<DailyStandup>
  updateStandup: (id: string, data: Partial<DailyStandup>) => Promise<DailyStandup>
  getStandup: (date: string) => Promise<DailyStandup | null>
  
  createReflection: (data: Partial<EveningReflection>) => Promise<EveningReflection>
  updateReflection: (id: string, data: Partial<EveningReflection>) => Promise<EveningReflection>
  getReflection: (date: string) => Promise<EveningReflection | null>
  
  // Analytics
  analyzeProgress: (standup: DailyStandup, reflection: EveningReflection) => ProgressAnalysis
  getCompletionPatterns: (reflections: EveningReflection[]) => CompletionPatterns
  getProductivityPatterns: (standups: DailyStandup[], reflections: EveningReflection[]) => ProductivityPatterns
  
  // Utilities
  clearError: () => void
  setLoading: (loading: boolean) => void
}

// Component Props
export interface StandupFormProps {
  onSubmit: (data: StandupFormData) => void
  onCancel: () => void
  initialData?: Partial<StandupFormData>
  aiInsights?: string[]
  availableGoals?: Array<{ id: string; title: string }>
  availableTasks?: Array<{ id: string; title: string }>
}

export interface ReflectionFormProps {
  onSubmit: (data: ReflectionFormData) => void
  onCancel: () => void
  standup: DailyStandup
  initialData?: Partial<ReflectionFormData>
}

// Mood Options
export const MOOD_OPTIONS = [
  'energetic',
  'focused',
  'optimistic',
  'calm',
  'neutral',
  'tired',
  'stressed',
  'frustrated',
  'anxious',
  'overwhelmed'
] as const

export type MoodType = typeof MOOD_OPTIONS[number]

// Category Options
export const CATEGORY_OPTIONS = [
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'personal', label: 'Personal', icon: '🏠' },
  { value: 'health', label: 'Health', icon: '💪' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'other', label: 'Other', icon: '📝' }
] as const 