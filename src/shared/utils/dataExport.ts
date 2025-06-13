import { weightRepo } from '@/modules/weight/repo'
import { tasksRepo } from '@/modules/tasks/repo'
import { notesRepo } from '@/modules/notes/repo'
import type { WeightEntry } from '@/modules/weight/types'
import type { Todo } from '@/modules/tasks/types'
import type { Note } from '@/modules/notes/types'

export interface AppDataExport {
  exportDate: string
  appVersion: string
  data: {
    weights: WeightEntry[]
    tasks: Todo[]
    notes: Note[]
  }
}

export const exportAllData = async (): Promise<AppDataExport> => {
  try {
    // Fetch all data from each module
    const [weights, tasks, notes] = await Promise.all([
      weightRepo.getAllWeights(),
      tasksRepo.getAllTodos(),
      notesRepo.getAllNotes()
    ])

    const exportData: AppDataExport = {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0', // You can update this as needed
      data: {
        weights,
        tasks,
        notes
      }
    }

    return exportData
  } catch (error) {
    console.error('Failed to export data:', error)
    throw new Error('Failed to export app data')
  }
}

export const downloadDataAsFile = (data: AppDataExport, filename?: string) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `perfect-zenkai-backup-${new Date().toISOString().split('T')[0]}.json`
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  URL.revokeObjectURL(url)
}

export const getDataSummary = (data: AppDataExport) => {
  return {
    totalWeights: data.data.weights.length,
    totalTasks: data.data.tasks.length,
    totalNotes: data.data.notes.length,
    exportDate: new Date(data.exportDate).toLocaleDateString(),
    appVersion: data.appVersion
  }
} 