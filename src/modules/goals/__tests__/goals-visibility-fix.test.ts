import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGoalsStore } from '../store'
import { getSupabaseClient } from '../../../lib/supabase-client'

// Mock the supabase client
vi.mock('../../../lib/supabase-client', () => ({
  getSupabaseClient: vi.fn(),
}))

const mockGetSupabaseClient = vi.mocked(getSupabaseClient)

describe('Goals Store - Visibility Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useGoalsStore.setState({
      goals: [],
      isLoading: false, 
      error: null
    })
  })

  describe('loadGoals', () => {
    it('should load goals from Supabase when available', async () => {
      // Arrange
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: '1',
                  title: 'Test Goal',
                  category: 'health',
                  description: 'Test description',
                  target_date: '2024-06-01',
                  color: '#10B981',
                  is_active: true,
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2024-01-01T00:00:00Z',
                }
              ],
              error: null
            })
          })
        })
      }
      mockGetSupabaseClient.mockResolvedValue(mockSupabase as any)
      
      // Act
      await useGoalsStore.getState().loadGoals()
      
      // Assert
      const goals = useGoalsStore.getState().goals
      expect(goals).toHaveLength(1)
      expect(goals[0].title).toBe('Test Goal')
    })

    it('should fallback to mock data when Supabase unavailable', async () => {
      // Arrange
      mockGetSupabaseClient.mockResolvedValue(null)
      
      // Act
      await useGoalsStore.getState().loadGoals()
      
      // Assert - Should have mock goals, not empty
      const goals = useGoalsStore.getState().goals
      expect(goals.length).toBeGreaterThan(0)
    })

    it('should handle Supabase errors gracefully', async () => {
      // Arrange
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database connection failed')
            })
          })
        })
      }
      mockGetSupabaseClient.mockResolvedValue(mockSupabase as any)
      
      // Act
      await useGoalsStore.getState().loadGoals()
      
      // Assert - Should not crash, should set error state
      const state = useGoalsStore.getState()
      expect(state.error).toBeTruthy()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('goal deduplication', () => {
    it('should not create duplicate goals with same ID', async () => {
      // This test will verify that goals are properly deduplicated
      // Initial setup with mock goals
      const initialGoals = [
        {
          id: '1',
          title: 'Duplicate Goal',
          category: 'health' as const,
          description: 'Original',
          color: '#10B981',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        }
      ]
      
      useGoalsStore.setState({ goals: initialGoals })
      
             // Simulate adding the same goal again (this should be prevented)
       await useGoalsStore.getState().addGoal({
         title: 'Duplicate Goal',
         category: 'health',
         description: 'Duplicate attempt',
         color: '#10B981',
         isActive: true,
       })
      
      // Assert - Should still have only one goal, not duplicated
      const goals = useGoalsStore.getState().goals
      expect(goals).toHaveLength(1)
    })
  })
}) 