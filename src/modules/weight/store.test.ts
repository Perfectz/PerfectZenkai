import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWeightStore } from './store'
import { weightRepo } from './repo'
import { WeightEntry } from './types'

// Mock the weight repository
vi.mock('./repo', () => ({
  weightRepo: {
    addWeight: vi.fn(),
    deleteWeight: vi.fn(),
    getAllWeights: vi.fn(),
    clearAll: vi.fn()
  }
}))

const mockWeightRepo = vi.mocked(weightRepo)

describe('Weight Store', () => {
  beforeEach(() => {
    // Reset store state
    useWeightStore.setState({
      weights: [],
      isLoading: false,
      error: null
    })
    
    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('addWeight', () => {
    it('should add weight entry to store and call repo', async () => {
      const mockEntry: WeightEntry = {
        id: 'test-id',
        dateISO: '2024-01-15',
        kg: 75.5
      }

      mockWeightRepo.addWeight.mockResolvedValue(mockEntry)

      const { addWeight } = useWeightStore.getState()
      
      await addWeight({ dateISO: '2024-01-15', kg: 75.5 })

      // Should call repo with entry without id
      expect(mockWeightRepo.addWeight).toHaveBeenCalledWith({
        dateISO: '2024-01-15',
        kg: 75.5
      })

      // Should update store with new entry
      const state = useWeightStore.getState()
      expect(state.weights).toHaveLength(1)
      expect(state.weights[0]).toEqual(mockEntry)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when adding weight', async () => {
      const error = new Error('Database error')
      mockWeightRepo.addWeight.mockRejectedValue(error)

      const { addWeight } = useWeightStore.getState()
      
      await expect(addWeight({ dateISO: '2024-01-15', kg: 75.5 })).rejects.toThrow('Database error')

      const state = useWeightStore.getState()
      expect(state.error).toBe('Database error')
      expect(state.isLoading).toBe(false)
      expect(state.weights).toHaveLength(0)
    })

    it('should sort weights by date (newest first)', async () => {
      const entry1: WeightEntry = { id: '1', dateISO: '2024-01-15', kg: 75.0 }
      const entry2: WeightEntry = { id: '2', dateISO: '2024-01-16', kg: 76.0 }

      // Add first entry
      mockWeightRepo.addWeight.mockResolvedValueOnce(entry1)
      await useWeightStore.getState().addWeight({ dateISO: '2024-01-15', kg: 75.0 })

      // Add second entry (newer date)
      mockWeightRepo.addWeight.mockResolvedValueOnce(entry2)
      await useWeightStore.getState().addWeight({ dateISO: '2024-01-16', kg: 76.0 })

      const state = useWeightStore.getState()
      expect(state.weights).toHaveLength(2)
      expect(state.weights[0].dateISO).toBe('2024-01-16') // Newer first
      expect(state.weights[1].dateISO).toBe('2024-01-15')
    })
  })

  describe('deleteWeight', () => {
    it('should remove weight from store and call repo', async () => {
      // Setup initial state with a weight entry
      const initialEntry: WeightEntry = {
        id: 'test-id',
        dateISO: '2024-01-15',
        kg: 75.5
      }
      
      useWeightStore.setState({ weights: [initialEntry] })
      mockWeightRepo.deleteWeight.mockResolvedValue()

      const { deleteWeight } = useWeightStore.getState()
      
      await deleteWeight('test-id')

      // Should call repo with correct id
      expect(mockWeightRepo.deleteWeight).toHaveBeenCalledWith('test-id')

      // Should remove entry from store
      const state = useWeightStore.getState()
      expect(state.weights).toHaveLength(0)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when deleting weight', async () => {
      const error = new Error('Delete failed')
      mockWeightRepo.deleteWeight.mockRejectedValue(error)

      const { deleteWeight } = useWeightStore.getState()
      
      await expect(deleteWeight('test-id')).rejects.toThrow('Delete failed')

      const state = useWeightStore.getState()
      expect(state.error).toBe('Delete failed')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('loadWeights', () => {
    it('should load weights from repo into store', async () => {
      const mockWeights: WeightEntry[] = [
        { id: '1', dateISO: '2024-01-16', kg: 76.0 },
        { id: '2', dateISO: '2024-01-15', kg: 75.0 }
      ]

      mockWeightRepo.getAllWeights.mockResolvedValue(mockWeights)

      const { loadWeights } = useWeightStore.getState()
      
      await loadWeights()

      expect(mockWeightRepo.getAllWeights).toHaveBeenCalled()

      const state = useWeightStore.getState()
      expect(state.weights).toEqual(mockWeights)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when loading weights', async () => {
      const error = new Error('Load failed')
      mockWeightRepo.getAllWeights.mockRejectedValue(error)

      const { loadWeights } = useWeightStore.getState()
      
      await loadWeights()

      const state = useWeightStore.getState()
      expect(state.error).toBe('Load failed')
      expect(state.isLoading).toBe(false)
      expect(state.weights).toHaveLength(0)
    })
  })

  describe('hydrate', () => {
    it('should call loadWeights to hydrate store from repo', async () => {
      const mockWeights: WeightEntry[] = [
        { id: '1', dateISO: '2024-01-15', kg: 75.0 }
      ]

      mockWeightRepo.getAllWeights.mockResolvedValue(mockWeights)

      const { hydrate } = useWeightStore.getState()
      
      await hydrate()

      expect(mockWeightRepo.getAllWeights).toHaveBeenCalled()

      const state = useWeightStore.getState()
      expect(state.weights).toEqual(mockWeights)
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      // Set error state
      useWeightStore.setState({ error: 'Some error' })

      const { clearError } = useWeightStore.getState()
      clearError()

      const state = useWeightStore.getState()
      expect(state.error).toBeNull()
    })
  })
}) 