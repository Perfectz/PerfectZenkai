import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hybridTasksRepo } from '../repo'
import { getSupabaseClientSync } from '../../../lib/supabase-client'

// Mock the supabase client
vi.mock('../../../lib/supabase-client', () => ({
  getSupabaseClientSync: vi.fn(),
}))

const mockGetSupabaseClientSync = vi.mocked(getSupabaseClientSync)

describe('HybridTasksRepo - Supabase Client Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllTodos', () => {
    it('should NOT throw ReferenceError when supabase client is null', async () => {
      // Arrange
      mockGetSupabaseClientSync.mockReturnValue(null)
      
      // Act & Assert - This should NOT throw "supabase is not defined"
      await expect(hybridTasksRepo.getAllTodos('user123')).resolves.not.toThrow()
    })

    it('should handle undefined supabase client gracefully', async () => {
      // Arrange
      mockGetSupabaseClientSync.mockReturnValue(undefined as unknown)
      
      // Act & Assert - This should NOT throw "supabase is not defined"  
      await expect(hybridTasksRepo.getAllTodos('user123')).resolves.not.toThrow()
    })

    it('should return empty array when supabase client unavailable', async () => {
      // Arrange
      mockGetSupabaseClientSync.mockReturnValue(null)
      
      // Act
      const result = await hybridTasksRepo.getAllTodos('user123')
      
      // Assert
      expect(result).toEqual([])
    })
  })

  describe('syncData', () => {
    it('should NOT throw ReferenceError when supabase client is null', async () => {
      // Arrange
      mockGetSupabaseClientSync.mockReturnValue(null)
      
      // Act & Assert - This should NOT throw "supabase is not defined"
      await expect(hybridTasksRepo.syncData('user123')).resolves.not.toThrow()
    })

    it('should return zero sync results when supabase unavailable', async () => {
      // Arrange 
      mockGetSupabaseClientSync.mockReturnValue(null)
      
      // Act
      const result = await hybridTasksRepo.syncData('user123')
      
      // Assert
      expect(result).toEqual({ synced: 0, errors: 0 })
    })
  })

  describe('addSubtask', () => {
    it('should NOT throw ReferenceError when supabase client is null', async () => {
      // Arrange
      mockGetSupabaseClientSync.mockReturnValue(null)
      
      // Act & Assert - This should NOT throw "supabase is not defined"
      await expect(
        hybridTasksRepo.addSubtask('todo123', 'Test subtask', 'user123')
      ).resolves.not.toThrow()
    })
  })

  describe('updateSubtask', () => {
    it('should NOT throw ReferenceError when supabase client is null', async () => {
      // Arrange
      mockGetSupabaseClientSync.mockReturnValue(null)
      
      // Act & Assert - This should NOT throw "supabase is not defined"
      await expect(
        hybridTasksRepo.updateSubtask('todo123', 'subtask123', { done: true }, 'user123')
      ).resolves.not.toThrow()
    })
  })

  describe('deleteSubtask', () => {
    it('should NOT throw ReferenceError when supabase client is null', async () => {
      // Arrange
      mockGetSupabaseClientSync.mockReturnValue(null)
      
      // Act & Assert - This should NOT throw "supabase is not defined"
      await expect(
        hybridTasksRepo.deleteSubtask('todo123', 'subtask123', 'user123')
      ).resolves.not.toThrow()
    })
  })
}) 