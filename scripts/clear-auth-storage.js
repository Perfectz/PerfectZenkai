console.log('🧹 Clearing authentication storage...')

// Clear all auth-related localStorage keys
const authKeys = [
  'auth-storage',
  'zenkai_users',
  'zenkai_current_user'
]

authKeys.forEach(key => {
  if (typeof localStorage !== 'undefined') {
    const value = localStorage.getItem(key)
    if (value) {
      console.log(`  Removing ${key}:`, JSON.parse(value))
      localStorage.removeItem(key)
    } else {
      console.log(`  ${key}: not found`)
    }
  }
})

console.log('✅ Authentication storage cleared')
console.log('💡 Please refresh the browser to test the fix') 