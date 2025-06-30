export type Priority = 'low' | 'medium' | 'high'
export type Category = 'work' | 'personal' | 'health' | 'learning' | 'other'
export type DescriptionFormat = 'markdown' | 'plaintext' | 'html'
export type ReminderType = 'notification' | 'email' | 'sms'

export interface Subtask {
  id: string // UUID v4
  text: string // Subtask description
  done: boolean // Completion status
  createdAt: string // ISO timestamp
}

export interface Reminder {
  id: string // UUID v4
  todoId: string // Reference to parent todo
  type: ReminderType // Type of reminder
  offsetMinutes: number // Minutes before due date
  enabled: boolean // Whether reminder is active
  sent?: boolean // Track if reminder was sent
  createdAt: string // ISO timestamp
}

export interface TaskTemplate {
  id: string // UUID v4
  name: string // Template name
  text: string // Default task text
  priority: Priority // Default priority
  category: Category // Default category
  subtasks: Omit<Subtask, 'id' | 'createdAt'>[] // Default subtasks
  createdAt: string // ISO timestamp
}

// Enhanced Todo interface for MVP 11
export interface Todo {
  id: string // UUID v4
  summary: string // Brief one-line task description (replaces old 'text')
  description?: string // Detailed rich text description
  descriptionFormat?: DescriptionFormat // Format of description content
  done: boolean // Completion status
  priority: Priority // Task priority
  category: Category // Task category
  points?: number // Task difficulty/importance score (1-10 scale)
  dueDate?: string // ISO date string (legacy - keep for backward compatibility)
  dueDateTime?: string // ISO datetime string with time
  reminders?: Reminder[] // Array of reminder settings
  subtasks: Subtask[] // Array of subtasks
  templateId?: string // Reference to template (optional)
  goalId?: string // Reference to goal (MVP 14 - Simple Goals)
  completedAt?: string // ISO timestamp when task was completed
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp for last edit
}

// Points statistics interfaces
export interface PointsStats {
  dailyPoints: number // Points earned today
  weeklyPoints: number // Points earned this week
  monthlyPoints: number // Points earned this month
  totalEarnedPoints: number // Total points earned from completed tasks
  totalPossiblePoints: number // Total points from all tasks
  averageTaskPoints: number // Average points per completed task
  completionRate: number // Percentage of tasks completed
  completedTasks: number // Number of completed tasks
  totalTasks: number // Total number of tasks
  currentStreak: number // Current completion streak in days
  longestStreak: number // Longest completion streak achieved
}

export interface DailyPointsEntry {
  date: string // ISO date string
  points: number // Points earned on this date
  completedTasks: number // Tasks completed on this date
  averagePoints: number // Average points per task on this date
}

// Natural language date parsing results
export interface ParsedDateTime {
  dateTime: string // ISO datetime string
  originalInput: string // Original user input
  confidence: number // Confidence level (0-1)
  isRelative: boolean // Whether input was relative ("tomorrow")
  hasTime: boolean // Whether time was specified
  parsedComponents: {
    date?: string // Parsed date component
    time?: string // Parsed time component
    timezone?: string // Detected timezone
  }
}

// Reminder scheduling interface
export interface ScheduledReminder {
  id: string // Reminder ID
  todoId: string // Todo ID
  todoSummary: string // Todo summary for notification
  dueDateTime: string // When todo is due
  reminderDateTime: string // When to show reminder
  type: ReminderType // Type of reminder
  enabled: boolean // Whether reminder is enabled
}

// Inline editing state
export interface EditingState {
  todoId: string | null // Currently editing todo
  field: keyof Todo | null // Currently editing field
  originalValue: unknown // Original value for rollback
  isEditing: boolean // Whether in editing mode
}

// Backwards compatibility: Legacy Todo interface (for migration)
export interface LegacyTodo {
  id: string
  text: string // Will be migrated to 'summary'
  done: boolean
  priority: Priority
  category: Category
  dueDate?: string
  subtasks: Subtask[]
  templateId?: string
  createdAt: string
  updatedAt: string
}

// === MVP-21: Recurring Tasks System Types ===

export type RecurrenceType = 'daily' | 'weekly' | 'monthly'
export type RecurrenceStatus = 'active' | 'paused' | 'completed'

export interface RecurrencePattern {
  type: RecurrenceType
  interval: number // Every N days/weeks/months
  daysOfWeek?: number[] // For weekly: [0,1,2,3,4,5,6] (Sun-Sat)
  endDate?: string // Optional end date
  maxOccurrences?: number // Optional max completions
}

export interface TodoCompletion {
  id: string
  completedAt: string
  scheduledFor: string
  points: number
  streakDay: number
}

export interface RecurringTodo extends Omit<Todo, 'done' | 'completedAt'> {
  isRecurring: true
  recurrence: RecurrencePattern
  status: RecurrenceStatus
  completions: TodoCompletion[]
  nextDueDate: string
  currentStreak: number
  bestStreak: number
}

export interface StreakStats {
  currentStreak: number
  bestStreak: number
  totalCompletions: number
  consistencyRate: number // percentage
  averageGapDays: number
}

// Union type for all task types
export type AnyTodo = Todo | RecurringTodo

// Type guards
export function isRecurringTodo(todo: AnyTodo): todo is RecurringTodo {
  return 'isRecurring' in todo && todo.isRecurring === true
}

export function isRegularTodo(todo: AnyTodo): todo is Todo {
  return !('isRecurring' in todo) || todo.isRecurring !== true
}
