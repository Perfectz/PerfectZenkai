import { createClient } from '@supabase/supabase-js'
import { keyVaultService } from '../services/keyVaultService'
import type { Database as SupabaseDatabase } from '../types/supabase'

// Check if we're in a test environment
const isTestEnvironment =
  import.meta.env.MODE === 'test' || process.env.NODE_ENV === 'test'

// Initialize Supabase client with Azure Key Vault integration
let supabaseClient: ReturnType<typeof createClient<SupabaseDatabase>> | null = null

export const initializeSupabase = async () => {
  if (supabaseClient || isTestEnvironment) {
    return supabaseClient
  }

  try {
    console.log('🔧 Initializing Supabase with Azure Key Vault credentials...')
    
    // Get credentials from Azure Key Vault
    const { url, anonKey } = await keyVaultService.getSupabaseConfig()
    
    supabaseClient = createClient<SupabaseDatabase>(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
    
    console.log('✅ Supabase client initialized successfully with Azure Key Vault')
    return supabaseClient
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client with Key Vault:', error)
    console.warn('🔄 Running in offline mode - Key Vault unavailable')
    return null
  }
}

// Export the promise-based client
export const getSupabaseClient = async () => {
  if (!supabaseClient && !isTestEnvironment) {
    await initializeSupabase()
  }
  return supabaseClient
}

// Legacy export for backward compatibility (will be null initially)
export const supabase = supabaseClient

// Re-export the Database type for convenience
export type { Database } from '../types/supabase'
