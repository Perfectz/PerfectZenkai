import { supabase } from '@/lib/supabase'
import type { User, AuthError } from '../types/auth'

export class SupabaseAuthService {

  /**
   * Check if Supabase client is available and properly configured
   */
  private isSupabaseAvailable(): boolean {
    return !!supabase
  }

  /**
   * Get error for when service is unavailable
   */
  private getUnavailableError(): AuthError {
    return {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Authentication service is currently unavailable',
    }
  }

  /**
   * Handle network/connection errors from Supabase
   */
  private handleNetworkError(error: unknown): AuthError {
    console.error('Network error details:', error)

    const errorObj = error as Record<string, unknown>

    // Handle specific Supabase error codes
    if (errorObj?.code === 'invalid_credentials') {
      return { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    }
    
    if (errorObj?.code === 'email_not_confirmed') {
      return { code: 'EMAIL_NOT_CONFIRMED', message: 'Please check your email and click the confirmation link' }
    }

    if (errorObj?.code === 'signup_disabled') {
      return { code: 'SIGNUP_DISABLED', message: 'New registrations are currently disabled' }
    }

    // Handle network/connection errors
    const message = typeof errorObj?.message === 'string' ? errorObj.message : ''
    if (message.includes('fetch') || message.includes('network') || errorObj?.code === 'NETWORK_ERROR') {
      return { code: 'NETWORK_ERROR', message: 'Network connection failed. Please check your internet connection.' }
    }

    // Handle timeout errors
    if (message.includes('timeout') || errorObj?.name === 'AbortError') {
      return { code: 'TIMEOUT', message: 'Request timed out. Please try again.' }
    }

    // Handle database connection errors
    if (errorObj?.code === '42P01' || message.includes('does not exist')) {
      return { code: 'DATABASE_ERROR', message: 'Database configuration error. Please contact support.' }
    }

    // Generic fallback
    return {
      code: 'UNKNOWN_ERROR',
      message: message || 'An unexpected error occurred',
    }
  }





  /**
   * Register a new user with enhanced error handling and retries
   */
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ user: User | null; error: AuthError | null }> {
    if (!this.isSupabaseAvailable()) {
      return { user: null, error: this.getUnavailableError() }
    }

    try {
      console.log('🔐 Starting registration for:', { username, email })

             // Check if username is already taken
       const { data: existingUser, error: checkError } = await supabase!
         .from('profiles')
         .select('username')
         .eq('username', username)
         .maybeSingle()

       if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
         throw checkError
       }

      if (existingUser) {
        console.log('❌ Username already taken:', username)
        return {
          user: null,
          error: { code: 'USERNAME_TAKEN', message: 'Username already taken' },
        }
      }

      console.log('✅ Username available, proceeding with registration')

             // Register user with Supabase Auth
       const { data: authData, error: authError } = await supabase!.auth.signUp({
         email,
         password,
         options: {
           data: { username },
           emailRedirectTo: undefined,
         },
       })

       if (authError) throw authError

      if (!authData.user) {
        return {
          user: null,
          error: { code: 'SIGNUP_FAILED', message: 'Registration failed' },
        }
      }

      // Profile is created automatically via trigger
      const user: User = {
        id: authData.user.id,
        name: username,
        email: authData.user.email || email,
      }

      console.log('🎉 Registration successful:', user)
      return { user, error: null }
    } catch (error: unknown) {
      console.error('Registration exception:', error)
      
      // Handle "User already registered" error specifically
      const errorObj = error as Record<string, unknown>
      const errorMessage = typeof errorObj?.message === 'string' ? errorObj.message : ''
      if (errorMessage.includes('User already registered')) {
        return {
          user: null,
          error: {
            code: 'USER_ALREADY_EXISTS',
            message: 'An account with this email already exists. Please try logging in instead.',
          }
        }
      }
      
      return {
        user: null,
        error: this.handleNetworkError(error),
      }
    }
  }

  /**
   * Login user with email and password with enhanced error handling
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: AuthError | null }> {
    if (!this.isSupabaseAvailable()) {
      return { user: null, error: this.getUnavailableError() }
    }

    try {
      console.log('🔐 Starting login with email:', email)

             // Authenticate with Supabase
       const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
         email,
         password,
       })

       if (authError) throw authError

      if (!authData.user) {
        return {
          user: null,
          error: { code: 'LOGIN_FAILED', message: 'Login failed' },
        }
      }

      console.log('✅ Auth successful, fetching profile for user:', authData.user.id)

             // Get user profile with fallback
       let profile: { username: string } | null = null
       try {
         const { data, error } = await supabase!
           .from('profiles')
           .select('username')
           .eq('id', authData.user.id)
           .single()
         
         if (error) throw error
         profile = data
       } catch (error) {
         console.log('⚠️ Profile fetch error (using fallback):', error)
       }

      const user: User = {
        id: authData.user.id,
        name: profile?.username || authData.user.user_metadata?.username || 'User',
        email: authData.user.email || email,
      }

      console.log('🎉 Login successful:', user)
      return { user, error: null }
    } catch (error) {
      console.error('💥 Login error:', error)
      return {
        user: null,
        error: this.handleNetworkError(error),
      }
    }
  }

  /**
   * Login with username with improved error handling and fallback strategies
   */
  async loginWithUsername(
    username: string,
    password: string
  ): Promise<{ user: User | null; error: AuthError | null }> {
    if (!this.isSupabaseAvailable()) {
      console.error('❌ Supabase client not available')
      return { user: null, error: this.getUnavailableError() }
    }

    try {
      console.log('🔍 Starting login with username:', username)

             // Try to find the profile with this username using multiple strategies
       let profile: { id: string; username: string; email?: string } | null = null
       let email: string | null = null

       // Strategy 1: Try user_lookup view first
       try {
         const { data, error } = await supabase!
           .from('user_lookup')
           .select('id, username, email')
           .eq('username', username)
           .single()
         
         if (error) throw error
         profile = data
         email = profile?.email || null
         console.log('📋 Found profile via user_lookup:', profile)
       } catch (error: unknown) {
         console.log('📋 user_lookup failed, trying profiles table:', error)
         
         // Strategy 2: Fallback to profiles table
         try {
           const { data, error } = await supabase!
             .from('profiles')
             .select('id, username')
             .eq('username', username)
             .single()
           
           if (error) throw error
           profile = data
           console.log('📋 Found profile via profiles table:', profile)
           
           // For profiles table, we need to get email from auth metadata
           if (profile) {
              // We'll get the email after successful auth since we can't access admin functions
              email = `${username}@temp.local` // Temporary placeholder
           }
         } catch (profilesError) {
           console.log('📋 profiles table also failed:', profilesError)
         }
       }

      if (!profile || !email) {
        console.log('❌ Profile not found for username:', username)
        return {
          user: null,
          error: { code: 'USER_NOT_FOUND', message: 'Username not found' },
        }
      }

      console.log('✅ Profile found, attempting login with email:', email)

      // Now login with the found email
      return await this.login(email, password)
    } catch (error) {
      console.error('💥 Username login error:', error)
      return {
        user: null,
        error: this.handleNetworkError(error),
      }
    }
  }

  /**
   * Get current authenticated user with improved error handling
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.isSupabaseAvailable()) {
      return null
    }

    try {
      const { data: { user: authUser }, error } = await supabase!.auth.getUser()

      if (error || !authUser) {
        console.log('No authenticated user found')
        return null
      }

      // Try to get profile data with fallback
      let profile: { username: string } | null = null
      try {
        const { data } = await supabase!
          .from('profiles')
          .select('username')
          .eq('id', authUser.id)
          .single()
        profile = data
      } catch (error) {
        console.log('Profile fetch failed, using auth metadata:', error)
      }

      return {
        id: authUser.id,
        name: profile?.username || authUser.user_metadata?.username || 'User',
        email: authUser.email || '',
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Logout user with improved error handling
   */
  async logout(): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      return
    }

    try {
      await supabase!.auth.signOut()
      console.log('✅ Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
      // Don't throw on logout errors, just log them
    }
  }

  /**
   * Set up auth state change listener with error handling
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    if (!this.isSupabaseAvailable()) {
      return () => {}
    }

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (session?.user) {
          try {
            const user = await this.getCurrentUser()
            callback(user)
          } catch (error) {
            console.error('Error in auth state change:', error)
            callback(null)
          }
        } else {
          callback(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }
}

export const supabaseAuth = new SupabaseAuthService()
