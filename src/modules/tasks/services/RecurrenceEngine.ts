import { RecurrencePattern, RecurringTodo, TodoCompletion, StreakStats } from '../types'

export class RecurrenceEngine {
  /**
   * Calculate the next occurrence date based on recurrence pattern
   */
  calculateNextOccurrence(pattern: RecurrencePattern, lastCompletion?: string): string {
    const baseDate = lastCompletion ? new Date(lastCompletion) : new Date()
    
    switch (pattern.type) {
      case 'daily': {
        const nextDaily = new Date(baseDate)
        nextDaily.setDate(nextDaily.getDate() + pattern.interval)
        return nextDaily.toISOString().split('.')[0] + 'Z'
      }
        
      case 'weekly':
        return this.calculateNextWeeklyOccurrence(pattern, baseDate)
        
      case 'monthly': {
        const nextMonthly = new Date(baseDate)
        nextMonthly.setMonth(nextMonthly.getMonth() + pattern.interval)
        return nextMonthly.toISOString().split('.')[0] + 'Z'
      }
        
      default:
        throw new Error(`Unsupported recurrence type: ${pattern.type}`)
    }
  }

  /**
   * Calculate next weekly occurrence considering days of week
   */
  private calculateNextWeeklyOccurrence(pattern: RecurrencePattern, baseDate: Date): string {
    if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
      // If no specific days, just add interval weeks
      const nextWeek = new Date(baseDate)
      nextWeek.setDate(nextWeek.getDate() + (7 * pattern.interval))
      return nextWeek.toISOString().split('.')[0] + 'Z'
    }

    // Find next occurrence in the specified days of week
    const currentDayOfWeek = baseDate.getDay()
    const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b)
    
    // Find next day in current week
    const nextDayThisWeek = sortedDays.find(day => day > currentDayOfWeek)
    
    if (nextDayThisWeek !== undefined) {
      // Next occurrence is this week
      const nextDate = new Date(baseDate)
      nextDate.setDate(nextDate.getDate() + (nextDayThisWeek - currentDayOfWeek))
      return nextDate.toISOString().split('.')[0] + 'Z'
    } else {
      // Next occurrence is in next interval week
      const nextDate = new Date(baseDate)
      const daysToAdd = (7 * pattern.interval) - currentDayOfWeek + sortedDays[0]
      nextDate.setDate(nextDate.getDate() + daysToAdd)
      return nextDate.toISOString().split('.')[0] + 'Z'
    }
  }

  /**
   * Determine if a new occurrence should be created for a recurring task
   */
  shouldCreateOccurrence(task: RecurringTodo, currentDate: string): boolean {
    // Don't create if task is paused or completed
    if (task.status !== 'active') {
      return false
    }

    // Check if current time is past the next due date
    const currentTime = new Date(currentDate).getTime()
    const dueTime = new Date(task.nextDueDate).getTime()
    
    if (currentTime < dueTime) {
      return false
    }

    // Check end date restriction
    if (task.recurrence.endDate) {
      const endTime = new Date(task.recurrence.endDate).getTime()
      if (currentTime > endTime) {
        return false
      }
    }

    // Check max occurrences restriction
    if (task.recurrence.maxOccurrences) {
      if (task.completions.length >= task.recurrence.maxOccurrences) {
        return false
      }
    }

    return true
  }

  /**
   * Update streak when a recurring task is completed
   */
  updateStreakOnCompletion(task: RecurringTodo, completionDate: string): number {
    const completionTime = new Date(completionDate)
    const lastCompletion = task.completions[task.completions.length - 1]
    
    if (!lastCompletion) {
      // First completion
      return 1
    }

    const lastCompletionTime = new Date(lastCompletion.completedAt)
    const daysDifference = Math.floor((completionTime.getTime() - lastCompletionTime.getTime()) / (1000 * 60 * 60 * 24))
    
    // For daily tasks, streak continues if completed within 2 days (allowing for some flexibility)
    // For weekly tasks, streak continues if completed within 9 days
    // For monthly tasks, streak continues if completed within 35 days
    let maxGapDays = 2
    if (task.recurrence.type === 'weekly') {
      maxGapDays = 9
    } else if (task.recurrence.type === 'monthly') {
      maxGapDays = 35
    }

    if (daysDifference <= maxGapDays) {
      // Continue streak
      return task.currentStreak + 1
    } else {
      // Reset streak
      return 1
    }
  }

  /**
   * Pause a recurring task
   */
  async pauseRecurrence(taskId: string): Promise<void> {
    // Implementation will be handled by the store/repository layer
    // This is a placeholder for the interface
    console.log(`Pausing recurrence for task: ${taskId}`)
  }

  /**
   * Resume a recurring task
   */
  async resumeRecurrence(taskId: string): Promise<void> {
    // Implementation will be handled by the store/repository layer
    // This is a placeholder for the interface
    console.log(`Resuming recurrence for task: ${taskId}`)
  }

  /**
   * Calculate streak statistics from completion history
   */
  getStreakStatistics(completions: TodoCompletion[]): StreakStats {
    if (completions.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        consistencyRate: 0,
        averageGapDays: 0
      }
    }

    const totalCompletions = completions.length
    
    // Calculate current streak (assuming completions are ordered by date)
    const currentStreak = this.calculateCurrentStreak(completions)
    
    // Calculate best streak
    const bestStreak = this.calculateBestStreak(completions)
    
    // Calculate consistency rate (percentage of scheduled days completed)
    const consistencyRate = this.calculateConsistencyRate(completions)
    
    // Calculate average gap between completions
    const averageGapDays = this.calculateAverageGapDays(completions)

    return {
      currentStreak,
      bestStreak,
      totalCompletions,
      consistencyRate,
      averageGapDays
    }
  }

  /**
   * Calculate current streak from completion history
   */
  private calculateCurrentStreak(completions: TodoCompletion[]): number {
    if (completions.length === 0) return 0
    
    // Assuming completions are sorted by date (newest first)
    const sortedCompletions = [...completions].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    
    let streak = 1
    for (let i = 1; i < sortedCompletions.length; i++) {
      const current = new Date(sortedCompletions[i - 1].completedAt)
      const previous = new Date(sortedCompletions[i].completedAt)
      const daysDiff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= 2) { // Allow some flexibility
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  /**
   * Calculate best streak from completion history
   */
  private calculateBestStreak(completions: TodoCompletion[]): number {
    if (completions.length === 0) return 0
    
    const sortedCompletions = [...completions].sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    )
    
    let bestStreak = 1
    let currentStreak = 1
    
    for (let i = 1; i < sortedCompletions.length; i++) {
      const current = new Date(sortedCompletions[i].completedAt)
      const previous = new Date(sortedCompletions[i - 1].completedAt)
      const daysDiff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= 2) { // Allow some flexibility
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }
    
    return bestStreak
  }

  /**
   * Calculate consistency rate (simplified implementation)
   */
  private calculateConsistencyRate(completions: TodoCompletion[]): number {
    if (completions.length < 2) return 100
    
    // Simple calculation based on completion frequency
    // In a real implementation, this would consider the expected frequency vs actual
    const sortedCompletions = [...completions].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    const totalDays = completions.length > 1 ? 
      Math.floor((new Date(sortedCompletions[sortedCompletions.length - 1].completedAt).getTime() - 
                  new Date(sortedCompletions[0].completedAt).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1
    
    return Math.min(100, (completions.length / totalDays) * 100)
  }

  /**
   * Calculate average gap between completions
   */
  private calculateAverageGapDays(completions: TodoCompletion[]): number {
    if (completions.length < 2) return 0
    
    const sortedCompletions = [...completions].sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    )
    
    let totalGap = 0
    for (let i = 1; i < sortedCompletions.length; i++) {
      const current = new Date(sortedCompletions[i].completedAt)
      const previous = new Date(sortedCompletions[i - 1].completedAt)
      const daysDiff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
      totalGap += daysDiff
    }
    
    return totalGap / (sortedCompletions.length - 1)
  }
} 