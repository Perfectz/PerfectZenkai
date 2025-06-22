import { tasksRepo } from '@/modules/tasks/repo'
import { weightRepo } from '@/modules/weight/repo'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalRecords: number
    validRecords: number
    duplicateRecords: number
    orphanedRecords: number
  }
}

export interface DatabaseValidationReport {
  tasks: ValidationResult
  weights: ValidationResult
  overall: {
    isHealthy: boolean
    criticalIssues: number
    totalWarnings: number
    lastValidated: string
  }
}

// Validate tasks data integrity
export async function validateTasksData(): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  let totalRecords = 0
  let validRecords = 0
  let duplicateRecords = 0
  const orphanedRecords = 0

  try {
    // Get all todos
    const todos = await tasksRepo.getAllTodos()
    totalRecords = todos.length

    // Check for duplicates
    const summaryMap = new Map<string, number>()

    for (const todo of todos) {
      validRecords++

      // Validate required fields
      if (!todo.id) {
        errors.push(`Todo missing ID: ${todo.summary}`)
        validRecords--
      }

      if (!todo.summary || todo.summary.trim() === '') {
        errors.push(`Todo ${todo.id} has empty summary`)
        validRecords--
      }

      if (!todo.createdAt) {
        warnings.push(`Todo ${todo.id} missing creation date`)
      }

      // Check for potential duplicates (same summary + same creation date)
      const summaryKey = `${todo.summary}_${todo.createdAt}`
      if (summaryMap.has(summaryKey)) {
        duplicateRecords++
        warnings.push(`Potential duplicate todo: "${todo.summary}" (${todo.id})`)
      } else {
        summaryMap.set(summaryKey, 1)
      }

      // Validate subtasks
      if (todo.subtasks) {
        for (const subtask of todo.subtasks) {
          if (!subtask.id || !subtask.text) {
            errors.push(`Invalid subtask in todo ${todo.id}`)
          }
        }
      }

      // Validate data types
      if (todo.done !== true && todo.done !== false) {
        errors.push(`Todo ${todo.id} has invalid 'done' value: ${todo.done}`)
        validRecords--
      }

      if (todo.points !== undefined && (todo.points < 1 || todo.points > 10)) {
        warnings.push(`Todo ${todo.id} has invalid points value: ${todo.points}`)
      }
    }

  } catch (error) {
    errors.push(`Failed to validate tasks data: ${error}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalRecords,
      validRecords,
      duplicateRecords,
      orphanedRecords
    }
  }
}

// Validate weight data integrity
export async function validateWeightData(): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  let totalRecords = 0
  let validRecords = 0
  let duplicateRecords = 0
  const orphanedRecords = 0

  try {
    // Get all weight entries
    const weights = await weightRepo.getAllWeights()
    totalRecords = weights.length

    // Check for duplicates and validation
    const dateMap = new Map<string, number>()

    for (const weight of weights) {
      validRecords++

      // Validate required fields
      if (!weight.id) {
        errors.push(`Weight entry missing ID for date: ${weight.dateISO}`)
        validRecords--
      }

      if (!weight.dateISO) {
        errors.push(`Weight entry ${weight.id} missing date`)
        validRecords--
      }

      if (!weight.kg || weight.kg <= 0) {
        errors.push(`Weight entry ${weight.id} has invalid weight: ${weight.kg}`)
        validRecords--
      }

      // Check for unrealistic weight values
      if (weight.kg > 500) {
        warnings.push(`Weight entry ${weight.id} has unusually high weight: ${weight.kg}kg`)
      }

      if (weight.kg < 20) {
        warnings.push(`Weight entry ${weight.id} has unusually low weight: ${weight.kg}kg`)
      }

      // Check for duplicate dates
      if (dateMap.has(weight.dateISO)) {
        duplicateRecords++
        warnings.push(`Duplicate weight entry for date: ${weight.dateISO}`)
      } else {
        dateMap.set(weight.dateISO, 1)
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(weight.dateISO)) {
        errors.push(`Weight entry ${weight.id} has invalid date format: ${weight.dateISO}`)
        validRecords--
      }
    }

  } catch (error) {
    errors.push(`Failed to validate weight data: ${error}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalRecords,
      validRecords,
      duplicateRecords,
      orphanedRecords
    }
  }
}

// Run complete database validation
export async function validateDatabase(): Promise<DatabaseValidationReport> {
  console.log('🔍 Starting database validation...')
  
  const [tasksValidation, weightsValidation] = await Promise.all([
    validateTasksData(),
    validateWeightData()
  ])

  const criticalIssues = tasksValidation.errors.length + weightsValidation.errors.length
  const totalWarnings = tasksValidation.warnings.length + weightsValidation.warnings.length
  const isHealthy = criticalIssues === 0 && totalWarnings < 5

  const report: DatabaseValidationReport = {
    tasks: tasksValidation,
    weights: weightsValidation,
    overall: {
      isHealthy,
      criticalIssues,
      totalWarnings,
      lastValidated: new Date().toISOString()
    }
  }

  // Log results
  console.log('📊 Database Validation Report:')
  console.log(`   Tasks: ${tasksValidation.stats.validRecords}/${tasksValidation.stats.totalRecords} valid`)
  console.log(`   Weights: ${weightsValidation.stats.validRecords}/${weightsValidation.stats.totalRecords} valid`)
  console.log(`   Critical Issues: ${criticalIssues}`)
  console.log(`   Warnings: ${totalWarnings}`)
  console.log(`   Overall Health: ${isHealthy ? '✅ Healthy' : '⚠️ Issues Found'}`)

  if (criticalIssues > 0) {
    console.warn('❌ Critical issues found:')
    tasksValidation.errors.forEach(error => console.warn(`   Tasks: ${error}`))
    weightsValidation.errors.forEach(error => console.warn(`   Weights: ${error}`))
  }

  if (totalWarnings > 0) {
    console.info('⚠️ Warnings found:')
    tasksValidation.warnings.forEach(warning => console.info(`   Tasks: ${warning}`))
    weightsValidation.warnings.forEach(warning => console.info(`   Weights: ${warning}`))
  }

  return report
}

// Clean up duplicate entries (safe operation)
export async function cleanupDuplicates(): Promise<{ cleaned: number; errors: string[] }> {
  console.log('🧹 Starting duplicate cleanup...')
  
  let cleaned = 0
  const errors: string[] = []

  try {
    // Clean up duplicate weight entries (keep the latest one)
    const weights = await weightRepo.getAllWeights()
    const weightsByDate = new Map<string, typeof weights>()

    weights.forEach(weight => {
      if (!weightsByDate.has(weight.dateISO)) {
        weightsByDate.set(weight.dateISO, [])
      }
      weightsByDate.get(weight.dateISO)!.push(weight)
    })

    for (const [, entries] of weightsByDate) {
      if (entries.length > 1) {
        // Sort by ID (newer IDs are typically later) and keep the last one
        entries.sort((a, b) => a.id.localeCompare(b.id))
        const toDelete = entries.slice(0, -1) // All but the last one

        for (const entry of toDelete) {
          try {
            await weightRepo.deleteWeight(entry.id)
            cleaned++
            console.log(`🗑️ Removed duplicate weight entry: ${entry.dateISO} (${entry.id})`)
          } catch (error) {
            errors.push(`Failed to delete duplicate weight ${entry.id}: ${error}`)
          }
        }
      }
    }

  } catch (error) {
    errors.push(`Cleanup failed: ${error}`)
  }

  console.log(`✅ Cleanup complete: ${cleaned} duplicates removed, ${errors.length} errors`)
  return { cleaned, errors }
}

// Export validation functions for individual use
export const databaseValidation = {
  validateTasks: validateTasksData,
  validateWeights: validateWeightData,
  validateAll: validateDatabase,
  cleanup: cleanupDuplicates
} 