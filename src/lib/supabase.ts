import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we're in a test environment or if variables are missing
const isTestEnvironment = import.meta.env.MODE === 'test' || process.env.NODE_ENV === 'test'
const hasSupabaseConfig = supabaseUrl && supabaseAnonKey

if (!hasSupabaseConfig && !isTestEnvironment) {
  console.warn('Supabase environment variables not found. Running in offline mode.')
}

// Create client only if we have proper configuration
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Database types (will be auto-generated later)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 