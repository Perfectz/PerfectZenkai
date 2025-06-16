import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWeightStore } from './store'
import { hybridWeightRepo } from './repo'
import { WeightEntry } from './types'

// Mock the hybrid weight repository
vi.mock('./repo', () => ({
  hybridWeightRepo: {
    addWeight: vi.fn(),
    deleteWeight: vi.fn(),
    getAllWeights: vi.fn(),
    clearAll: vi.fn(),
  },
}))

const mockHybridWeightRepo = vi.mocked(hybridWeightRepo)

describe('Weight Store', () => {
  beforeEach(() => {
    // Reset store state
    useWeightStore.setState({
      weights: [],
      isLoading: false,
      error: null,
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('addWeight', () => {
    it('should add weight entry to store and call repo', async () => {
      const mockEntry: WeightEntry = {
        id: 'test-id',
        dateISO: '2024-01-15',
        kg: 75.5,
      }

      mockHybridWeightRepo.addWeight.mockResolvedValue(mockEntry)

      const { addWeight } = useWeightStore.getState()

      await addWeight({ dateISO: '2024-01-15', kg: 75.5 })

      // Should call repo with entry without id and user id
      expect(mockHybridWeightRepo.addWeight).toHaveBeenCalledWith({
        dateISO: '2024-01-15',
        kg: 75.5,
      }, undefined) // No user logged in for test

      // Should update store with new entry
      const state = useWeightStore.getState()
      expect(state.weights).toHaveLength(1)
      expect(state.weights[0]).toEqual(mockEntry)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when adding weight', async () => {
      const error = new Error('Database error')
      mockHybridWeightRepo.addWeight.mockRejectedValue(error)

      const { addWeight } = useWeightStore.getState()

      await expect(
        addWeight({ dateISO: '2024-01-15', kg: 75.5 })
      ).rejects.toThrow('Database error')

      const state = useWeightStore.getState()
      expect(state.error).toBe('Database error')
      expect(state.isLoading).toBe(false)
      expect(state.weights).toHaveLength(0)
    })

    it('should sort weights by date (newest first)', async () => {
      const entry1: WeightEntry = { id: '1', dateISO: '2024-01-15', kg: 75.0 }
      const entry2: WeightEntry = { id: '2', dateISO: '2024-01-16', kg: 76.0 }

      // Add first entry
      mockHybridWeightRepo.addWeight.mockResolvedValueOnce(entry1)
      await useWeightStore
        .getState()
        .addWeight({ dateISO: '2024-01-15', kg: 75.0 })

      // Add second entry (newer date)
      mockHybridWeightRepo.addWeight.mockResolvedValueOnce(entry2)
      await useWeightStore
        .getState()
        .addWeight({ dateISO: '2024-01-16', kg: 76.0 })

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
        kg: 75.5,
      }

      useWeightStore.setState({ weights: [initialEntry] })
      mockHybridWeightRepo.deleteWeight.mockResolvedValue()

      const { deleteWeight } = useWeightStore.getState()

      await deleteWeight('test-id')

      // Should call repo with correct id and user id
      expect(mockHybridWeightRepo.deleteWeight).toHaveBeenCalledWith('test-id', undefined)

      // Should remove entry from store
      const state = useWeightStore.getState()
      expect(state.weights).toHaveLength(0)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when deleting weight', async () => {
      const error = new Error('Delete failed')
      mockHybridWeightRepo.deleteWeight.mockRejectedValue(error)

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
        { id: '2', dateISO: '2024-01-15', kg: 75.0 },
      ]

      mockHybridWeightRepo.getAllWeights.mockResolvedValue(mockWeights)

      const { loadWeights } = useWeightStore.getState()

      await loadWeights()

      expect(mockHybridWeightRepo.getAllWeights).toHaveBeenCalledWith(undefined)

      const state = useWeightStore.getState()
      expect(state.weights).toEqual(mockWeights)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle errors when loading weights', async () => {
      const error = new Error('Load failed')
      mockHybridWeightRepo.getAllWeights.mockRejectedValue(error)

      const { loadWeights } = useWeightStore.getState()

      await loadWeights()

      const state = useWeightStore.getState()
      expect(state.error).toBe('Load failed')
      expect(state.isLoading).toBe(false)
      expect(state.weights).toHaveLength(0)
    })
  })

  describe('loadWeights (hydration)', () => {
    it('should call loadWeights to hydrate store from repo', async () => {
      const mockWeights: WeightEntry[] = [
        { id: '1', dateISO: '2024-01-15', kg: 75.0 },
      ]

      mockHybridWeightRepo.getAllWeights.mockResolvedValue(mockWeights)

      const { loadWeights } = useWeightStore.getState()

      await loadWeights()

      expect(mockHybridWeightRepo.getAllWeights).toHaveBeenCalledWith(undefined)

      const state = useWeightStore.getState()
      expect(state.weights).toEqual(mockWeights)
    })
  })

  describe('error handling', () => {
    it('should handle error state from failed operations', async () => {
      const error = new Error('Some error')
      mockHybridWeightRepo.addWeight.mockRejectedValue(error)

      const { addWeight } = useWeightStore.getState()

      await expect(
        addWeight({ dateISO: '2024-01-15', kg: 75.5 })
      ).rejects.toThrow('Some error')

      const state = useWeightStore.getState()
      expect(state.error).toBe('Some error')
    })
  })
})
