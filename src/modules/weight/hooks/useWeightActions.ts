import { useWeightStore } from '../store'
import { useToast } from '@/shared/ui/toast'
import { WeightEntry } from '../types'

export function useWeightActions() {
  const { addWeight: addWeightStore, deleteWeight: deleteWeightStore } = useWeightStore()
  const { success, error } = useToast()

  const addWeight = async (entry: Omit<WeightEntry, 'id'>) => {
    try {
      await addWeightStore(entry)
      success(
        'Weight Logged',
        `${entry.kg}kg recorded for ${new Date(entry.dateISO).toLocaleDateString()}`
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

  return {
    addWeight,
    deleteWeight
  }
} 