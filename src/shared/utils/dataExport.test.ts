// src/shared/utils/dataExport.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportAllData, getDataSummary, AppDataExport } from './dataExport'

// Mock the repositories
vi.mock('@/modules/weight/repo', () => ({
  weightRepo: {
    getAllWeights: vi.fn()
  }
}))

vi.mock('@/modules/tasks/repo', () => ({
  tasksRepo: {
    getAllTodos: vi.fn()
  }
}))

vi.mock('@/modules/notes/repo', () => ({
  notesRepo: {
    getAllNotes: vi.fn()
  }
}))

describe('Data Export Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDataSummary', () => {
    it('should return correct summary of exported data', () => {
      const mockExportData: AppDataExport = {
        exportDate: '2024-01-15T10:00:00.000Z',
        appVersion: '1.0.0',
        data: {
          weights: [{ id: '1' }, { id: '2' }],
          tasks: [{ id: '1' }],
          notes: [{ id: '1' }, { id: '2' }, { id: '3' }]
        }
      }

      const summary = getDataSummary(mockExportData)

      expect(summary).toEqual({
        totalWeights: 2,
        totalTasks: 1,
        totalNotes: 3,
        exportDate: '1/15/2024',
        appVersion: '1.0.0'
      })
    })

    it('should handle empty data', () => {
      const mockExportData: AppDataExport = {
        exportDate: '2024-01-15T10:00:00.000Z',
        appVersion: '1.0.0',
        data: {
          weights: [],
          tasks: [],
          notes: []
        }
      }

      const summary = getDataSummary(mockExportData)

      expect(summary).toEqual({
        totalWeights: 0,
        totalTasks: 0,
        totalNotes: 0,
        exportDate: '1/15/2024',
        appVersion: '1.0.0'
      })
    })
  })

  describe('exportAllData', () => {
    it('should export data from all modules', async () => {
      // Mock the repository responses
      const { weightRepo } = await import('@/modules/weight/repo')
      const { tasksRepo } = await import('@/modules/tasks/repo')
      const { notesRepo } = await import('@/modules/notes/repo')

      const mockWeights = [{ id: '1', kg: 75, dateISO: '2024-01-15' }]
      const mockTasks = [{ id: '1', text: 'Test task', done: false, createdAt: '2024-01-15T10:00:00.000Z' }]
      const mockNotes = [{ id: '1', title: 'Test note', content: 'Content', createdAt: '2024-01-15T10:00:00.000Z', updatedAt: '2024-01-15T10:00:00.000Z' }]

      vi.mocked(weightRepo.getAllWeights).mockResolvedValue(mockWeights)
      vi.mocked(tasksRepo.getAllTodos).mockResolvedValue(mockTasks)
      vi.mocked(notesRepo.getAllNotes).mockResolvedValue(mockNotes)

      const result = await exportAllData()

      expect(result).toMatchObject({
        appVersion: '1.0.0',
        data: {
          weights: mockWeights,
          tasks: mockTasks,
          notes: mockNotes
        }
      })
      expect(result.exportDate).toBeDefined()
      expect(new Date(result.exportDate)).toBeInstanceOf(Date)
    })

    it('should handle export errors', async () => {
      const { weightRepo } = await import('@/modules/weight/repo')
      
      vi.mocked(weightRepo.getAllWeights).mockRejectedValue(new Error('Database error'))

      await expect(exportAllData()).rejects.toThrow('Failed to export app data')
    })
  })
}) 