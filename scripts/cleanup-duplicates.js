// scripts/cleanup-duplicates.js
// Direct database cleanup script for duplicate tasks

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kslvxxoykdkstnkjgpnd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbHZ4eG95a2Rrc3Rua2pncG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTk5NTQsImV4cCI6MjA2NTM5NTk1NH0.PMSopl6yPSus2Gtvzqnd_0a6MRbMulIhk6MAwH33pc4'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupDuplicates() {
  try {
    console.log('🔍 Starting duplicate cleanup process...')
    
    // Step 1: Use known user ID from export data
    const targetUserId = 'dcf69673-c38e-4de0-b8aa-c3f4b9e0259c' // From your export data
    console.log(`✅ Using user ID: ${targetUserId}`)
    
    // Step 2: Analyze current duplicates
    const { data: beforeStats, error: beforeError } = await supabase
      .from('todos')
      .select('summary')
      .eq('user_id', targetUserId)
    
    if (beforeError) throw beforeError
    
    const totalTasks = beforeStats.length
    const uniqueTasks = new Set(beforeStats.map(t => t.summary)).size
    const duplicateCount = totalTasks - uniqueTasks
    
    console.log(`📊 BEFORE CLEANUP:`)
    console.log(`   Total tasks: ${totalTasks}`)
    console.log(`   Unique tasks: ${uniqueTasks}`)
    console.log(`   Duplicates: ${duplicateCount}`)
    
    if (duplicateCount === 0) {
      console.log('✅ No duplicates found!')
      return
    }
    
    // Step 3: Create backup
    console.log('💾 Creating backup...')
    const { data: backupData, error: backupError } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', targetUserId)
    
    if (backupError) throw backupError
    
    // Write backup to file
    fs.writeFileSync('todos-backup-emergency.json', JSON.stringify(backupData, null, 2))
    console.log(`✅ Backup created: todos-backup-emergency.json (${backupData.length} tasks)`)
    
    // Step 4: Find duplicates to delete
    const taskGroups = {}
    backupData.forEach(task => {
      const key = `${task.summary}_${task.category}_${task.priority}_${task.done}`
      if (!taskGroups[key]) {
        taskGroups[key] = []
      }
      taskGroups[key].push(task)
    })
    
    const tasksToDelete = []
    Object.values(taskGroups).forEach(group => {
      if (group.length > 1) {
        // Sort by updated_at desc, then created_at desc
        group.sort((a, b) => {
          const aTime = new Date(a.updated_at || a.created_at).getTime()
          const bTime = new Date(b.updated_at || b.created_at).getTime()
          return bTime - aTime
        })
        
        // Keep the first (newest), delete the rest
        for (let i = 1; i < group.length; i++) {
          tasksToDelete.push(group[i].id)
        }
      }
    })
    
    console.log(`🗑️  Will delete ${tasksToDelete.length} duplicate tasks`)
    
    // Step 5: Delete duplicates
    if (tasksToDelete.length > 0) {
      console.log('🧹 Deleting duplicates...')
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .in('id', tasksToDelete)
      
      if (deleteError) throw deleteError
      console.log(`✅ Deleted ${tasksToDelete.length} duplicate tasks`)
    }
    
    // Step 6: Verify cleanup
    const { data: afterStats, error: afterError } = await supabase
      .from('todos')
      .select('summary')
      .eq('user_id', targetUserId)
    
    if (afterError) throw afterError
    
    const finalTotal = afterStats.length
    const finalUnique = new Set(afterStats.map(t => t.summary)).size
    const remainingDuplicates = finalTotal - finalUnique
    
    console.log(`📊 AFTER CLEANUP:`)
    console.log(`   Total tasks: ${finalTotal}`)
    console.log(`   Unique tasks: ${finalUnique}`)
    console.log(`   Remaining duplicates: ${remainingDuplicates}`)
    
    if (remainingDuplicates === 0) {
      console.log('🎉 SUCCESS! All duplicates removed!')
    } else {
      console.log('⚠️  Some duplicates may remain - check manually')
    }
    
    console.log('\n✅ Cleanup process completed!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message)
    console.error('Full error:', error)
  }
}

// Run the cleanup
cleanupDuplicates() 