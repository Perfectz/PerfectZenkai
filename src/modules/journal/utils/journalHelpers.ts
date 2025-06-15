import { format, parseISO, isToday, isYesterday, startOfWeek, startOfMonth } from 'date-fns'
import { JournalEntry, JournalEntryRow, MorningEntry, EveningEntry } from '../types'

// Date formatting utilities
export const formatJournalDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(dateObj)) return 'Today'
  if (isYesterday(dateObj)) return 'Yesterday'
  
  return format(dateObj, 'MMM d, yyyy')
}

export const formatTimeBlock = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`
}

export const getCurrentDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd')
}

// Data transformation utilities
export const transformRowToEntry = (row: JournalEntryRow): JournalEntry => {
  return {
    id: row.id,
    entryDate: row.entry_date,
    entryType: row.entry_type,
    morningEntry: row.morning_entry || undefined,
    eveningEntry: row.evening_entry || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const transformEntryToRow = (entry: Partial<JournalEntry>): Partial<JournalEntryRow> => {
  return {
    entry_date: entry.entryDate,
    entry_type: entry.entryType,
    morning_entry: entry.morningEntry || null,
    evening_entry: entry.eveningEntry || null,
  }
}

// Validation utilities
export const validateMorningEntry = (entry: Partial<MorningEntry>): string[] => {
  const errors: string[] = []
  
  if (!entry.mood || entry.mood < 1 || entry.mood > 5) {
    errors.push('Mood rating is required (1-5)')
  }
  
  if (!entry.energy || entry.energy < 1 || entry.energy > 5) {
    errors.push('Energy rating is required (1-5)')
  }
  
  if (!entry.sleepQuality || entry.sleepQuality < 1 || entry.sleepQuality > 5) {
    errors.push('Sleep quality rating is required (1-5)')
  }
  
  if (!entry.topPriorities || entry.topPriorities.length === 0) {
    errors.push('At least one priority is required')
  }
  
  if (entry.topPriorities && entry.topPriorities.length > 3) {
    errors.push('Maximum 3 priorities allowed')
  }
  
  return errors
}

export const validateEveningEntry = (entry: Partial<EveningEntry>): string[] => {
  const errors: string[] = []
  
  if (!entry.productivity || entry.productivity < 1 || entry.productivity > 5) {
    errors.push('Productivity rating is required (1-5)')
  }
  
  if (!entry.stressLevel || entry.stressLevel < 1 || entry.stressLevel > 5) {
    errors.push('Stress level rating is required (1-5)')
  }
  
  if (!entry.satisfaction || entry.satisfaction < 1 || entry.satisfaction > 5) {
    errors.push('Satisfaction rating is required (1-5)')
  }
  
  if (!entry.gratitude || entry.gratitude.length === 0) {
    errors.push('At least one gratitude item is required')
  }
  
  if (entry.gratitude && entry.gratitude.length > 3) {
    errors.push('Maximum 3 gratitude items allowed')
  }
  
  return errors
}

// Default entry creators
export const createDefaultMorningEntry = (): MorningEntry => ({
  yesterdayAccomplishments: [],
  todayPlans: [],
  blockers: [],
  mood: 3,
  energy: 3,
  sleepQuality: 3,
  topPriorities: [],
  timeBlocks: [],
  notes: '',
})

export const createDefaultEveningEntry = (): EveningEntry => ({
  accomplishments: [],
  challenges: [],
  learnings: [],
  tomorrowFocus: [],
  unfinishedTasks: [],
  gratitude: [],
  improvements: [],
  productivity: 3,
  stressLevel: 3,
  satisfaction: 3,
  notes: '',
})

// Rating helpers
export const getRatingLabel = (rating: number): string => {
  const labels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Moderate',
    4: 'Good',
    5: 'Excellent',
  }
  return labels[rating as keyof typeof labels] || 'Unknown'
}

export const getRatingColor = (rating: number): string => {
  const colors = {
    1: 'text-red-500',
    2: 'text-orange-500',
    3: 'text-yellow-500',
    4: 'text-green-500',
    5: 'text-emerald-500',
  }
  return colors[rating as keyof typeof colors] || 'text-gray-500'
}

// Time utilities
export const generateTimeOptions = (): string[] => {
  const times: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      times.push(timeString)
    }
  }
  return times
}

// Analytics helpers
export const getWeekStart = (date: Date = new Date()): Date => {
  return startOfWeek(date, { weekStartsOn: 1 }) // Monday start
}

export const getMonthStart = (date: Date = new Date()): Date => {
  return startOfMonth(date)
}

export const calculateStreak = (entries: JournalEntry[]): { current: number; longest: number } => {
  if (entries.length === 0) return { current: 0, longest: 0 }
  
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  )
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  
  const today = new Date()
  const entryDates = new Set(sortedEntries.map(e => e.entryDate))
  
  // Calculate current streak
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateString = format(checkDate, 'yyyy-MM-dd')
    
    if (entryDates.has(dateString)) {
      if (i === 0 || currentStreak > 0) currentStreak++
    } else if (i > 0) {
      break
    }
  }
  
  // Calculate longest streak
  const allDates = sortedEntries.map(e => new Date(e.entryDate)).sort((a, b) => a.getTime() - b.getTime())
  
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const daysDiff = Math.floor((allDates[i].getTime() - allDates[i - 1].getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff === 1) {
        tempStreak++
      } else {
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)
  }
  
  return { current: currentStreak, longest: longestStreak }
} 