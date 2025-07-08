import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hybridTasksRepo } from '../repo'
import { getSupabaseClientSync } from '../../../lib/supabase-client'
import Dexie from 'dexie'

// Mock the supabase client
vi.mock('../../../lib/supabase-client', async () => {
  const actual = await vi.importActual('../../../lib/supabase-client')
  return {
    ...actual,
    getSupabaseClientSync: vi.fn(),
  }
})

// Mock Dexie to prevent IndexedDB access in tests
vi.mock('dexie', () => {
  const createMockTable = () => ({
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(async (id) => {
      // Simulate fetching a todo by ID
      if (id === 'todo123') {
        return { id: 'todo123', summary: 'Test Todo', subtasks: [] };
      }
      return undefined;
    }),
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    toArray: vi.fn(async () => []), // Default to empty array
    orderBy: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
    clear: vi.fn(),
  });

  return {
    __esModule: true,
    default: vi.fn(() => ({
      version: vi.fn().mockReturnThis(),
      stores: vi.fn().mockReturnThis(),
      todos: createMockTable(), // Ensure todos table is mocked
      templates: createMockTable(), // Mock templates table as well if needed
      close: vi.fn(),
    })),
  };
});

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