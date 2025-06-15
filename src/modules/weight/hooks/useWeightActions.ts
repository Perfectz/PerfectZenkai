import { useWeightStore } from '../store'
import { useToast } from '@/shared/hooks/useToast'
import { WeightEntry } from '../types'

export function useWeightActions() {
  const { 
    addWeight: addWeightStore, 
    updateWeight: updateWeightStore, 
    deleteWeight: deleteWeightStore,
    refreshWeights: refreshWeightsStore 
  } = useWeightStore()
  const { success, error } = useToast()

  const addWeight = async (entry: Omit<WeightEntry, 'id'>) => {
    try {
      await addWeightStore(entry)
      const weightLbs = (entry.kg * 2.20462).toFixed(1)
      const dateStr = new Date(entry.dateISO).toLocaleDateString()
      success(
        'Weight Logged',
        `${weightLbs}lbs recorded for ${dateStr}`
      )
    } catch (err) {
      error(
        'Failed to Log Weight',
        'Please check your connection and try again'
      )
    }
  }

  const deleteWeight = async (id: string, weight?: number, date?: string) => {
    try {
      await deleteWeightStore(id)
      success(
        'Weight Deleted',
        weight && date
          ? `${weight}kg entry for ${new Date(date).toLocaleDateString()} removed`
          : 'Weight entry removed successfully'
      )
    } catch (err) {
      error(
        'Failed to Delete',
        'Unable to delete weight entry. Please try again.'
      )
    }
  }

  const updateWeight = async (id: string, updates: Partial<Omit<WeightEntry, 'id'>>) => {
    try {
      await updateWeightStore(id, updates)
      const weightLbs = updates.kg ? (updates.kg * 2.20462).toFixed(1) : null
      const dateStr = updates.dateISO ? new Date(updates.dateISO).toLocaleDateString() : null
      
      let message = 'Entry updated successfully'
      if (weightLbs && dateStr) {
        message = `Updated to ${weightLbs}lbs for ${dateStr}`
      } else if (weightLbs) {
        message = `Weight updated to ${weightLbs}lbs`
      } else if (dateStr) {
        message = `Date updated to ${dateStr}`
      }
      
      success('Weight Updated', message)
    } catch (err) {
      console.error('Update weight error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      
      if (errorMessage.includes('not found')) {
        error(
          'Entry Not Found',
          'This weight entry may have been deleted or is out of sync. Refreshing data...'
        )
        // Automatically refresh data to resolve sync issues
        try {
          await refreshWeightsStore()
        } catch (refreshError) {
          console.warn('Failed to refresh after sync error:', refreshError)
        }
      } else if (errorMessage.includes('cloud storage')) {
        error(
          'Sync Issue',
          'Entry updated locally but failed to sync to cloud. It will sync when connection is restored.'
        )
      } else {
        error(
          'Failed to Update Weight',
          'Please check your connection and try again'
        )
      }
    }
  }

  const refreshWeights = async () => {
    try {
      await refreshWeightsStore()
      success(
        'Data Refreshed',
        'Weight data has been synchronized successfully'
      )
    } catch (err) {
      error(
        'Refresh Failed',
        'Unable to refresh weight data. Please try again.'
      )
    }
  }

  return {
    addWeight,
    updateWeight,
    deleteWeight,
    refreshWeights,
  }
}
