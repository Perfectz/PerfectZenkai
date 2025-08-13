// scripts/immediateCleanup.ts
// Emergency duplicate cleanup for browser console

import { getDatabase } from '@/modules/tasks/repo'
import { useAuthStore } from '@/modules/auth'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { Todo } from '@/modules/tasks/types'

export async function runImmediateCleanup() {
  console.log('🧹 Starting immediate duplicate cleanup...')
  
  const database = getDatabase()
  
  // Get all todos
  const allTodos = await database.todos.toArray()
  console.log(`📋 Found ${allTodos.length} total todos`)
  
  // Group by summary to find duplicates
  const todoGroups = new Map<string, Todo[]>()
  for (const todo of allTodos) {
    const key = todo.summary.trim().toLowerCase()
    if (!todoGroups.has(key)) {
      todoGroups.set(key, [])
    }
    todoGroups.get(key)!.push(todo)
  }
  
  // Find groups with duplicates
  const duplicateGroups = Array.from(todoGroups.entries())
    .filter(([_, todos]) => todos.length > 1)
  
  console.log(`🔍 Found ${duplicateGroups.length} groups with duplicates`)
  
  let deletedCount = 0
  
  // For each duplicate group, keep the most recent and delete the rest
  for (const [summary, todos] of duplicateGroups) {
    // Sort by createdAt (newest first)
    const sortedTodos = todos.sort((a: Todo, b: Todo) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    // Keep the first (newest) and delete the rest
    const toDelete = sortedTodos.slice(1)
    
    console.log(`📝 "${summary}": keeping 1, deleting ${toDelete.length}`)
    
    // Delete duplicates
    for (const todo of toDelete) {
      await database.todos.delete(todo.id)
      deletedCount++
    }
  }
  
  // Verify cleanup
  const remainingTodos = await database.todos.toArray()
  
  console.log('✅ Cleanup complete!')
  console.log(`🗑️  Deleted: ${deletedCount} duplicate todos`)
  console.log(`📋 Remaining: ${remainingTodos.length} unique todos`)
  console.log('🔄 Please refresh the page to see updated list')
  
  return { deleted: deletedCount, remaining: remainingTodos.length }
}

// NEW: Complete reset function to wipe everything
export async function runCompleteReset() {
  console.log('🚨 Starting COMPLETE task reset (all tasks will be deleted)...')
  
  const user = useAuthStore.getState().user
  const userId = user?.id
  
  if (!userId) {
    console.error('❌ No user found - cannot reset cloud data')
    return
  }
  
  let cloudCleared = false
  let localCleared = false
  
  // 1. Clear cloud data (Supabase)
  try {
    const supabase = await getSupabaseClient()
    if (supabase) {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('user_id', userId)
      
      if (error) throw error
      cloudCleared = true
      console.log('✅ All cloud tasks deleted from Supabase')
    }
  } catch (error) {
    console.error('❌ Failed to clear cloud tasks:', error)
  }
  
  // 2. Clear local data (IndexedDB)
  try {
    const database = getDatabase()
    await database.todos.clear()
    localCleared = true
    console.log('✅ All local tasks deleted from IndexedDB')
  } catch (error) {
    console.error('❌ Failed to clear local tasks:', error)
  }
  
  console.log('🚨 COMPLETE RESET FINISHED!')
  console.log(`☁️  Cloud cleared: ${cloudCleared}`)
  console.log(`💾 Local cleared: ${localCleared}`)
  console.log('🔄 Please refresh the page - you should have 0 tasks')
  
  return { cloudCleared, localCleared }
}

// NEW: Smart cleanup that analyzes and removes only actual duplicates
export async function runSmartCleanup() {
  console.log('🤖 Starting SMART duplicate cleanup...')
  
  const user = useAuthStore.getState().user
  const userId = user?.id
  
  if (!userId) {
    console.error('❌ No user found - using local cleanup only')
    return runImmediateCleanup()
  }
  
  // Get cloud tasks
  let cloudTasks: Todo[] = []
  try {
    const supabase = await getSupabaseClient()
    if (supabase) {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Map Supabase data to Todo format
      cloudTasks = (data || []).map(item => ({
        id: item.id,
        summary: item.summary || item.text || '',
        description: item.description || '',
        descriptionFormat: 'plaintext',
        done: item.done || false,
        priority: item.priority || 'medium',
        category: item.category || 'other',
        points: item.points || 5,
        dueDate: item.due_date,
        subtasks: [],
        createdAt: item.created_at,
        updatedAt: item.updated_at || item.created_at,
      }))
      
      console.log(`☁️  Found ${cloudTasks.length} cloud tasks`)
    }
  } catch (error) {
    console.error('❌ Failed to fetch cloud tasks:', error)
  }
  
  if (cloudTasks.length === 0) {
    console.log('✅ No cloud tasks found - data is already clean!')
    return { cleaned: 0, remaining: 0 }
  }
  
  // Find duplicates in cloud tasks
  const uniqueTasks = new Map<string, Todo>()
  const duplicatesToDelete: string[] = []
  
  for (const task of cloudTasks) {
    const key = `${task.summary.trim().toLowerCase()}_${task.category}_${task.priority}_${task.done}`
    
    if (uniqueTasks.has(key)) {
      // This is a duplicate - mark for deletion
      duplicatesToDelete.push(task.id)
      console.log(`🔄 Marking duplicate for deletion: "${task.summary}" (${task.id})`)
    } else {
      // This is unique - keep it
      uniqueTasks.set(key, task)
    }
  }
  
  console.log(`📊 Analysis complete:`)
  console.log(`   Total tasks: ${cloudTasks.length}`)
  console.log(`   Unique tasks: ${uniqueTasks.size}`)
  console.log(`   Duplicates to delete: ${duplicatesToDelete.length}`)
  
  // Delete duplicates from cloud
  if (duplicatesToDelete.length > 0) {
    try {
      const supabase = await getSupabaseClient()
      if (supabase) {
        const { error } = await supabase
          .from('todos')
          .delete()
          .in('id', duplicatesToDelete)
        
        if (error) throw error
        console.log(`✅ Deleted ${duplicatesToDelete.length} duplicate tasks from cloud`)
      }
    } catch (error) {
      console.error('❌ Failed to delete duplicates from cloud:', error)
    }
  }
  
  // Also clean local storage
  try {
    const database = getDatabase()
    await database.todos.clear()
    console.log('✅ Cleared local storage for fresh sync')
  } catch (error) {
    console.error('❌ Failed to clear local storage:', error)
  }
  
  console.log('🤖 SMART CLEANUP COMPLETE!')
  console.log(`🗑️  Removed: ${duplicatesToDelete.length} duplicates`)
  console.log(`📋 Remaining: ${uniqueTasks.size} unique tasks`)
  console.log('🔄 Please refresh the page to see clean data')
  
  return { cleaned: duplicatesToDelete.length, remaining: uniqueTasks.size }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as unknown as { runImmediateCleanup: typeof runImmediateCleanup }).runImmediateCleanup = runImmediateCleanup
} 