import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'
import { keyVaultService } from '../services/keyVaultService'

type TypedSupabaseClient = SupabaseClient<Database>

let supabaseClient: TypedSupabaseClient | null = null
let initializationPromise: Promise<TypedSupabaseClient | null> | null = null

const isTestEnvironment = import.meta.env.MODE === 'test' || process.env.NODE_ENV === 'test'

async function initializeSupabase(): Promise<TypedSupabaseClient | null> {
  // This function should only be called once.
  if (supabaseClient) {
    return supabaseClient;
  }

  if (isTestEnvironment) {
    // In a test environment, we might not want to connect to Supabase.
    // Or we might want to use a mock client. For now, returning null.
    return null;
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
    initializationPromise = initializeSupabase()
  }

  return await initializationPromise
}

export type { Database }