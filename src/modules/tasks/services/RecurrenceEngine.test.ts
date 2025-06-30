import { describe, test, expect, beforeEach } from 'vitest'
import { RecurrenceEngine } from './RecurrenceEngine'
import { RecurrencePattern, RecurringTodo, TodoCompletion } from '../types'

describe('RecurrenceEngine', () => {
  let engine: RecurrenceEngine

  beforeEach(() => {
    engine = new RecurrenceEngine()
  })

  describe('calculateNextOccurrence', () => {
    test('should calculate next daily occurrence', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1
      }
      
      const result = engine.calculateNextOccurrence(pattern, '2025-01-13T10:00:00Z')
      expect(result).toBe('2025-01-14T10:00:00Z')
    })

    test('should calculate next weekly occurrence', () => {
      const pattern: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5] // Mon, Wed, Fri
      }
      
      // If today is Monday (1), next should be Wednesday (3)
      const result = engine.calculateNextOccurrence(pattern, '2025-01-13T10:00:00Z') // Monday
      expect(result).toBe('2025-01-15T10:00:00Z') // Wednesday
    })

    test('should calculate next monthly occurrence', () => {
      const pattern: RecurrencePattern = {
        type: 'monthly',
        interval: 1
      }
      
      const result = engine.calculateNextOccurrence(pattern, '2025-01-13T10:00:00Z')
      expect(result).toBe('2025-02-13T10:00:00Z')
    })

    test('should handle interval greater than 1', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 3
      }
      
      const result = engine.calculateNextOccurrence(pattern, '2025-01-13T10:00:00Z')
      expect(result).toBe('2025-01-16T10:00:00Z')
    })
  })

  describe('shouldCreateOccurrence', () => {
    test('should return true when task is due', () => {
      const task: Partial<RecurringTodo> = {
        nextDueDate: '2025-01-13T10:00:00Z',
        status: 'active'
      }
      
      const result = engine.shouldCreateOccurrence(task as RecurringTodo, '2025-01-13T11:00:00Z')
      expect(result).toBe(true)
    })

    test('should return false when task is paused', () => {
      const task: Partial<RecurringTodo> = {
        nextDueDate: '2025-01-13T10:00:00Z',
        status: 'paused'
      }
      
      const result = engine.shouldCreateOccurrence(task as RecurringTodo, '2025-01-13T11:00:00Z')
      expect(result).toBe(false)
    })

    test('should return false when not yet due', () => {
      const task: Partial<RecurringTodo> = {
        nextDueDate: '2025-01-14T10:00:00Z',
        status: 'active'
      }
      
      const result = engine.shouldCreateOccurrence(task as RecurringTodo, '2025-01-13T11:00:00Z')
      expect(result).toBe(false)
    })
  })

  describe('updateStreakOnCompletion', () => {
    test('should increment streak for consecutive completions', () => {
      const task: Partial<RecurringTodo> = {
        currentStreak: 5,
        completions: [
          { id: '1', completedAt: '2025-01-12T10:00:00Z', scheduledFor: '2025-01-12T10:00:00Z', points: 5, streakDay: 5 }
        ]
      }
      
      const result = engine.updateStreakOnCompletion(task as RecurringTodo, '2025-01-13T10:00:00Z')
      expect(result).toBe(6)
    })

    test('should reset streak for missed days', () => {
      const task: Partial<RecurringTodo> = {
        currentStreak: 5,
        completions: [
          { id: '1', completedAt: '2025-01-10T10:00:00Z', scheduledFor: '2025-01-10T10:00:00Z', points: 5, streakDay: 5 }
        ]
      }
      
      const result = engine.updateStreakOnCompletion(task as RecurringTodo, '2025-01-13T10:00:00Z')
      expect(result).toBe(1)
    })
  })

  describe('getStreakStatistics', () => {
    test('should calculate streak statistics correctly', () => {
      const completions: TodoCompletion[] = [
        { id: '1', completedAt: '2025-01-10T10:00:00Z', scheduledFor: '2025-01-10T10:00:00Z', points: 5, streakDay: 1 },
        { id: '2', completedAt: '2025-01-11T10:00:00Z', scheduledFor: '2025-01-11T10:00:00Z', points: 5, streakDay: 2 },
        { id: '3', completedAt: '2025-01-12T10:00:00Z', scheduledFor: '2025-01-12T10:00:00Z', points: 5, streakDay: 3 },
      ]
      
      const result = engine.getStreakStatistics(completions)
      expect(result.totalCompletions).toBe(3)
      expect(result.currentStreak).toBe(3)
      expect(result.bestStreak).toBe(3)
      expect(result.consistencyRate).toBeGreaterThan(0)
    })
  })

  describe('pauseRecurrence', () => {
    test('should pause recurring task', async () => {
      const taskId = 'test-task-id'
      
      await expect(engine.pauseRecurrence(taskId)).resolves.toBeUndefined()
    })
  })

  describe('resumeRecurrence', () => {
    test('should resume recurring task', async () => {
      const taskId = 'test-task-id'
      
      await expect(engine.resumeRecurrence(taskId)).resolves.toBeUndefined()
    })
  })

  describe('edge cases', () => {
    test('should handle leap year calculations', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1
      }
      
      const result = engine.calculateNextOccurrence(pattern, '2024-02-29T10:00:00Z') // Leap year
      expect(result).toBe('2024-03-01T10:00:00Z')
    })

    test('should handle end date restrictions', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-14T00:00:00Z'
      }
      
      const task: Partial<RecurringTodo> = {
        nextDueDate: '2025-01-15T10:00:00Z',
        status: 'active',
        recurrence: pattern
      }
      
      const result = engine.shouldCreateOccurrence(task as RecurringTodo, '2025-01-15T11:00:00Z')
      expect(result).toBe(false) // Past end date
    })

    test('should handle max occurrences limit', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        maxOccurrences: 3
      }
      
      const task: Partial<RecurringTodo> = {
        nextDueDate: '2025-01-13T10:00:00Z',
        status: 'active',
        recurrence: pattern,
        completions: [
          { id: '1', completedAt: '2025-01-10T10:00:00Z', scheduledFor: '2025-01-10T10:00:00Z', points: 5, streakDay: 1 },
          { id: '2', completedAt: '2025-01-11T10:00:00Z', scheduledFor: '2025-01-11T10:00:00Z', points: 5, streakDay: 2 },
          { id: '3', completedAt: '2025-01-12T10:00:00Z', scheduledFor: '2025-01-12T10:00:00Z', points: 5, streakDay: 3 },
        ]
      }
      
      const result = engine.shouldCreateOccurrence(task as RecurringTodo, '2025-01-13T11:00:00Z')
      expect(result).toBe(false) // Max occurrences reached
    })
  })
}) 