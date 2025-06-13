import { initializeWeightDatabase } from '@/modules/weight/repo'
import { initializeTasksDatabase } from '@/modules/tasks/repo'
import { initializeNotesDatabase } from '@/modules/notes/repo'

/**
 * Initialize all user-specific databases for data isolation
 * This ensures each user has their own separate data storage
 */
export const initializeUserDatabases = (userId: string) => {
  console.log(`Initializing databases for user: ${userId}`)
  
  try {
    // Initialize all module databases with user-specific names
    initializeWeightDatabase(userId)
    initializeTasksDatabase(userId)
    initializeNotesDatabase(userId)
    
    console.log('User databases initialized successfully')
  } catch (error) {
    console.error('Failed to initialize user databases:', error)
    throw error
  }
}

/**
 * Clear all user-specific databases (used during logout)
 * This only clears the current user's data, not all users
 */
export const clearUserDatabases = async (userId: string) => {
  console.log(`Clearing databases for user: ${userId}`)
  
  try {
    // Get database names for this user
    const dbNames = [
      `WeightDatabase_${userId}`,
      `TasksDatabase_${userId}`,
      `NotesDatabase_${userId}`
    ]
    
    // Delete user-specific databases
    await Promise.all(
      dbNames.map(dbName => {
        return new Promise<void>((resolve, reject) => {
          const deleteReq = indexedDB.deleteDatabase(dbName)
          deleteReq.onsuccess = () => {
            console.log(`Deleted database: ${dbName}`)
            resolve()
          }
          deleteReq.onerror = () => {
            console.error(`Failed to delete database: ${dbName}`)
            reject(deleteReq.error)
          }
        })
      })
    )
    
    console.log('User databases cleared successfully')
  } catch (error) {
    console.error('Failed to clear user databases:', error)
    throw error
  }
}

/**
 * Get sanitized user ID for database naming
 * Removes special characters that might cause issues with IndexedDB
 */
export const sanitizeUserId = (userId: string): string => {
  return userId.replace(/[^a-zA-Z0-9_-]/g, '_')
} 