import { format, subDays, isAfter } from 'date-fns'
import { JournalEntry, JournalAnalytics } from '../types'
import { calculateStreak, getWeekStart, getMonthStart } from './journalHelpers'

export const calculateJournalAnalytics = (entries: JournalEntry[]): JournalAnalytics => {
  const now = new Date()
  const weekStart = getWeekStart(now)
  const monthStart = getMonthStart(now)
  
  // Filter entries by time periods
  const weeklyEntries = entries.filter(entry => 
    isAfter(new Date(entry.entryDate), weekStart) || 
    format(new Date(entry.entryDate), 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd')
  )
  
  const monthlyEntries = entries.filter(entry => 
    isAfter(new Date(entry.entryDate), monthStart) || 
    format(new Date(entry.entryDate), 'yyyy-MM-dd') === format(monthStart, 'yyyy-MM-dd')
  )
  
  // Calculate completion rates
  const completionRate = calculateCompletionRates(entries, weeklyEntries, monthlyEntries)
  
  // Calculate trends (last 30 days)
  const trends = calculateTrends(entries)
  
  // Calculate insights
  const insights = calculateInsights(entries)
  
  // Calculate streaks
  const streaks = calculateStreak(entries)
  const lastEntry = entries.length > 0 
    ? entries.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())[0]
    : null
  
  return {
    completionRate,
    trends,
    insights,
    streaks: {
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      lastEntryDate: lastEntry?.entryDate || '',
    },
  }
}

const calculateCompletionRates = (
  allEntries: JournalEntry[],
  weeklyEntries: JournalEntry[],
  monthlyEntries: JournalEntry[]
): JournalAnalytics['completionRate'] => {
  const now = new Date()
  
  // Calculate days in current week and month
  const daysInWeek = Math.min(7, Math.floor((now.getTime() - getWeekStart(now).getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const daysInMonth = Math.min(31, Math.floor((now.getTime() - getMonthStart(now).getTime()) / (1000 * 60 * 60 * 24)) + 1)
  
  // Count entries by type
  const morningEntries = allEntries.filter(e => e.morningEntry).length
  const eveningEntries = allEntries.filter(e => e.eveningEntry).length
  
  return {
    weekly: Math.round((weeklyEntries.length / daysInWeek) * 100),
    monthly: Math.round((monthlyEntries.length / daysInMonth) * 100),
    morningEntries,
    eveningEntries,
  }
}

const calculateTrends = (entries: JournalEntry[]): JournalAnalytics['trends'] => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i)
    return format(date, 'yyyy-MM-dd')
  }).reverse()
  
  const moodTrend: number[] = []
  const energyTrend: number[] = []
  const productivityTrend: number[] = []
  const sleepQualityTrend: number[] = []
  
  last30Days.forEach(date => {
    const dayEntry = entries.find(e => e.entryDate === date)
    
    // Morning metrics
    moodTrend.push(dayEntry?.morningEntry?.mood || 0)
    energyTrend.push(dayEntry?.morningEntry?.energy || 0)
    sleepQualityTrend.push(dayEntry?.morningEntry?.sleepQuality || 0)
    
    // Evening metrics
    productivityTrend.push(dayEntry?.eveningEntry?.productivity || 0)
  })
  
  return {
    moodTrend,
    energyTrend,
    productivityTrend,
    sleepQualityTrend,
  }
}

const calculateInsights = (entries: JournalEntry[]): JournalAnalytics['insights'] => {
  // Extract all text data for analysis
  const allBlockers: string[] = []
  const allGratitude: string[] = []
  const allImprovements: string[] = []
  const productivityByDay: { [key: string]: number[] } = {}
  
  entries.forEach(entry => {
    // Collect blockers
    if (entry.morningEntry?.blockers) {
      allBlockers.push(...entry.morningEntry.blockers)
    }
    
    // Collect gratitude
    if (entry.eveningEntry?.gratitude) {
      allGratitude.push(...entry.eveningEntry.gratitude)
    }
    
    // Collect improvements
    if (entry.eveningEntry?.improvements) {
      allImprovements.push(...entry.eveningEntry.improvements)
    }
    
    // Collect productivity by day of week
    if (entry.eveningEntry?.productivity) {
      const dayOfWeek = format(new Date(entry.entryDate), 'EEEE')
      if (!productivityByDay[dayOfWeek]) {
        productivityByDay[dayOfWeek] = []
      }
      productivityByDay[dayOfWeek].push(entry.eveningEntry.productivity)
    }
  })
  
  // Find common patterns
  const commonBlockers = findMostCommon(allBlockers, 5)
  const topGratitudeThemes = findMostCommon(allGratitude, 5)
  const improvementAreas = findMostCommon(allImprovements, 5)
  
  // Find most productive days
  const mostProductiveDays = Object.entries(productivityByDay)
    .map(([day, scores]) => ({
      day,
      avgScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)
    .map(item => item.day)
  
  return {
    commonBlockers,
    topGratitudeThemes,
    mostProductiveDays,
    improvementAreas,
  }
}

const findMostCommon = (items: string[], limit: number): string[] => {
  const frequency: { [key: string]: number } = {}
  
  items.forEach(item => {
    const normalized = item.toLowerCase().trim()
    if (normalized.length > 2) { // Only count meaningful items
      frequency[normalized] = (frequency[normalized] || 0) + 1
    }
  })
  
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item)
}

// Trend analysis helpers
export const calculateTrendDirection = (values: number[]): 'up' | 'down' | 'stable' => {
  if (values.length < 2) return 'stable'
  
  const recentValues = values.slice(-7) // Last 7 days
  const olderValues = values.slice(-14, -7) // Previous 7 days
  
  if (recentValues.length === 0 || olderValues.length === 0) return 'stable'
  
  const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length
  const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length
  
  const difference = recentAvg - olderAvg
  
  if (Math.abs(difference) < 0.2) return 'stable'
  return difference > 0 ? 'up' : 'down'
}

export const calculateAverageRating = (values: number[]): number => {
  const validValues = values.filter(v => v > 0)
  if (validValues.length === 0) return 0
  
  return Math.round((validValues.reduce((sum, val) => sum + val, 0) / validValues.length) * 10) / 10
}

// Weekly summary calculations
export const calculateWeeklySummary = (entries: JournalEntry[]) => {
  const weekStart = getWeekStart()
  const weeklyEntries = entries.filter(entry => 
    isAfter(new Date(entry.entryDate), weekStart) || 
    format(new Date(entry.entryDate), 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd')
  )
  
  const totalEntries = weeklyEntries.length
  const morningEntries = weeklyEntries.filter(e => e.morningEntry).length
  const eveningEntries = weeklyEntries.filter(e => e.eveningEntry).length
  
  // Calculate average ratings
  const moodRatings = weeklyEntries.map(e => e.morningEntry?.mood).filter(Boolean) as number[]
  const energyRatings = weeklyEntries.map(e => e.morningEntry?.energy).filter(Boolean) as number[]
  const productivityRatings = weeklyEntries.map(e => e.eveningEntry?.productivity).filter(Boolean) as number[]
  
  return {
    totalEntries,
    morningEntries,
    eveningEntries,
    completionRate: Math.round((totalEntries / 7) * 100),
    averageMood: calculateAverageRating(moodRatings),
    averageEnergy: calculateAverageRating(energyRatings),
    averageProductivity: calculateAverageRating(productivityRatings),
  }
} 