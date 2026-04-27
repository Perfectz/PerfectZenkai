// src/scripts/cleanupDuplicates.ts
// Standalone script to cleanup duplicate tasks

import { useTasksStore } from '@/modules/tasks/store'

export async function runDuplicateCleanup() {
  console.log('🧹 Starting duplicate task cleanup...')
  
  try {
    const tasksStore = useTasksStore.getState()
    
    // Get current tasks
    const currentTasks = tasksStore.todos
    console.log(`📊 Found ${currentTasks.length} total tasks`)
    
    // Run cleanup
    const result = await tasksStore.cleanupDuplicates()
    
    console.log('✅ Cleanup complete!')
    console.log(`🗑️ Removed: ${result.cleaned} duplicate tasks`)
    console.log(`📋 Remaining: ${result.remaining} unique tasks`)
    
    return result
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

// Export for browser-console access during local development only.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { cleanupDuplicates: typeof runDuplicateCleanup }).cleanupDuplicates = runDuplicateCleanup
} 
