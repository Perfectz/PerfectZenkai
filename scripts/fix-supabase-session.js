// scripts/fix-supabase-session.js
// Run this in your browser console to fix stuck Supabase sessions

console.log('🔧 Fixing stuck Supabase session...')

// Clear all auth-related localStorage
const authKeys = [
  'auth-storage',
  'zenkai_users',
  'zenkai_current_user',
  'sb-localhost-auth-token',
  'supabase.auth.token'
]

authKeys.forEach(key => {
  const value = localStorage.getItem(key)
  if (value) {
    console.log(`  Removing ${key}`)
    localStorage.removeItem(key)
  }
})

// Clear sessionStorage as well
const sessionKeys = [
  'sb-localhost-auth-token',
  'supabase.auth.token'
]

sessionKeys.forEach(key => {
  const value = sessionStorage.getItem(key)
  if (value) {
    console.log(`  Removing session ${key}`)
    sessionStorage.removeItem(key)
  }
})

// Clear all Supabase-related keys
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('sb-')) {
    console.log(`  Removing Supabase key: ${key}`)
    localStorage.removeItem(key)
  }
})

Object.keys(sessionStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('sb-')) {
    console.log(`  Removing Supabase session key: ${key}`)
    sessionStorage.removeItem(key)
  }
})

console.log('✅ Supabase session cleared')
console.log('🔄 Reloading page...')
location.reload() 