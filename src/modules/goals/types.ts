export type GoalCategory = 
  | 'health' 
  | 'career' 
  | 'learning' 
  | 'personal' 
  | 'finance' 
  | 'relationships'
  | 'other'

export interface SimpleGoal {
  id: string
  title: string // Goal name (required)
  category: GoalCategory // Pre-defined categories
  description?: string // Optional brief description
  targetDate?: string // Optional target completion date (ISO date string)
  color: string // Visual identifier (hex color)
  isActive: boolean // Can be paused/archived
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}

export interface GoalProgress {
  goalId: string
  totalTodos: number
  completedTodos: number
  progressPercentage: number
  lastUpdated: string
}

export interface GoalWithProgress extends SimpleGoal {
  progress: GoalProgress
} 