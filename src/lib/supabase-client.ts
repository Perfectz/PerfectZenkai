import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'
import { keyVaultService } from '../services/keyVaultService'

type TypedSupabaseClient = SupabaseClient<Database>

let supabaseClient: TypedSupabaseClient | null = null
let initializationPromise: Promise<TypedSupabaseClient | null> | null = null

const isTestEnvironment = import.meta.env.MODE === 'test' || process.env.NODE_ENV === 'test'

async function initializeSupabaseClient(): Promise<TypedSupabaseClient | null> {
  if (supabaseClient || isTestEnvironment) {
    return supabaseClient
  }

  try {
    console.log('🔧 Initializing Supabase with Azure Key Vault credentials...')
    
    const { url, anonKey } = await keyVaultService.getSupabaseConfig()
    
    supabaseClient = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
    
    console.log('✅ Supabase client initialized successfully')
    return supabaseClient
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error)
    console.warn('🔄 Running in offline mode')
    return null
  }
}

export async function getSupabaseClient(): Promise<TypedSupabaseClient | null> {
  if (supabaseClient) {
    return supabaseClient
  }

  if (!initializationPromise) {
    initializationPromise = initializeSupabaseClient()
  }

  return await initializationPromise
}

// For repositories that need a synchronous client (temporary fallback)
export function getSupabaseClientSync(): TypedSupabaseClient | null {
  return supabaseClient
}

export type { Database } 