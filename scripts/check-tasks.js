// scripts/check-tasks.js
// Debug script to see what's actually in the database

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kslvxxoykdkstnkjgpnd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbHZ4eG95a2Rrc3Rua2pncG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTk5NTQsImV4cCI6MjA2NTM5NTk1NH0.PMSopl6yPSus2Gtvzqnd_0a6MRbMulIhk6MAwH33pc4'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTasks() {
  try {
    console.log('🔍 Comprehensive Supabase database check...')
    console.log('📡 Using URL:', supabaseUrl)
    
    // Your user ID from export data
    const targetUserId = 'dcf69673-c38e-4de0-b8aa-c3f4b9e0259c'
    
    console.log('\\n=== CHECKING TODOS TABLE ===')
    
    // 1. Check todos table for specific user
    const { data: userTodos, error: userError } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
    
    if (userError) {
      console.error('❌ Error fetching user todos:', userError)
    } else {
      console.log(`📊 Found ${userTodos.length} todos for user ${targetUserId}`)
    }
    
    // 2. Check ALL todos in database (any user)
    const { data: allTodos, error: allError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200) // Get up to 200 records
    
    if (allError) {
      console.error('❌ Error fetching all todos:', allError)
    } else {
      console.log(`📊 Found ${allTodos.length} total todos in database (all users)`)
      
      // Group by user_id
      const userGroups = {}
      allTodos.forEach(todo => {
        const userId = todo.user_id || 'null'
        if (!userGroups[userId]) userGroups[userId] = []
        userGroups[userId].push(todo)
      })
      
      console.log('\\n👥 Tasks by user:')
      Object.entries(userGroups).forEach(([userId, todos]) => {
        console.log(`   ${userId}: ${todos.length} tasks`)
        if (userId === targetUserId && todos.length > 0) {
          console.log('   ✅ THIS IS YOUR USER - analyzing duplicates...')
          analyzeDuplicates(todos)
        }
      })
    }
    
    // 3. Check other possible table names
    console.log('\\n=== CHECKING OTHER POSSIBLE TABLES ===')
    const tablesToCheck = ['tasks', 'todo_items', 'user_todos', 'task_items']
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(5)
        
        if (!error && data) {
          console.log(`✅ Found table '${tableName}' with ${data.length} sample records`)
        }
      } catch (err) {
        console.log(`❌ Table '${tableName}' not found or not accessible`)
      }
    }
    
    // 4. Check current user authentication
    console.log('\\n=== CHECKING AUTHENTICATION ===')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('❌ Not authenticated:', authError.message)
    } else if (user) {
      console.log('✅ Authenticated as:', user.id, user.email)
      if (user.id !== targetUserId) {
        console.log('⚠️  WARNING: Authenticated user ID differs from target user ID')
        console.log(`   Auth user: ${user.id}`)
        console.log(`   Target user: ${targetUserId}`)
      }
    } else {
      console.log('❌ No authenticated user')
    }
    
    // Save debug data
    if (allTodos && allTodos.length > 0) {
      const debugData = {
        targetUserId,
        totalTodos: allTodos.length,
        userTodos: userTodos || [],
        allTodos: allTodos,
        userGroups: Object.keys(userGroups).map(userId => ({
          userId,
          count: userGroups[userId].length
        }))
      }
      
      fs.writeFileSync('supabase-debug-full.json', JSON.stringify(debugData, null, 2))
      console.log('\\n💾 Full debug data saved to: supabase-debug-full.json')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  }
}

function analyzeDuplicates(todos) {
  const summaryCount = {}
  todos.forEach(todo => {
    const summary = todo.summary || todo.text || 'No summary'
    summaryCount[summary] = (summaryCount[summary] || 0) + 1
  })
  
  console.log('\\n📋 Duplicate analysis:')
  Object.entries(summaryCount).forEach(([summary, count]) => {
    if (count > 1) {
      console.log(`   🔁 "${summary}" - ${count} duplicates`)
    }
  })
  
  const duplicateCount = Object.values(summaryCount).filter(count => count > 1).reduce((sum, count) => sum + count, 0)
  const uniqueCount = Object.keys(summaryCount).length
  
  console.log(`\\n🔢 Summary:`)
  console.log(`   Total tasks: ${todos.length}`)
  console.log(`   Unique tasks: ${uniqueCount}`)
  console.log(`   Duplicate tasks: ${duplicateCount}`)
}

// Run the check
checkTasks() 