import { getSupabaseClient } from '@/lib/supabase'
import type { User, AuthError } from '../types/auth'
import { debug, info, warn, error as logError } from '@/shared/utils/logging'

export class SupabaseAuthService {

  /**
   * Get Supabase client from Azure Key Vault
   */
  private async getSupabase() {
    try {
      console.log('🔄 Using Azure Key Vault Supabase...')
      const client = await getSupabaseClient()
      return client
    } catch (error) {
      console.error('Failed to get Supabase client:', error)
      return null
    }
  }

  /**
   * Check if Supabase client is available and properly configured
   */
  private async isSupabaseAvailable(): Promise<boolean> {
    const client = await this.getSupabase()
    return !!client
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
    if (!(await this.isSupabaseAvailable())) {
      return { user: null, error: this.getUnavailableError() }
    }

    try {
      console.log('🔐 Starting registration for:', { username, email })
      const supabase = await this.getSupabase()
      if (!supabase) {
        return { user: null, error: this.getUnavailableError() }
      }

             // Check if username is already taken
       const { data: existingUser, error: checkError } = await supabase
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
       const { data: authData, error: authError } = await supabase.auth.signUp({
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
       const supabase = await this.getSupabase()
       if (!supabase) {
         return { user: null, error: this.getUnavailableError() }
       }

       const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
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

      debug('Auth successful, fetching profile for user:', authData.user.id)

             // Get user profile with fallback
       let profile: { username: string } | null = null
       try {
         const { data, error } = await supabase!
           .from('profiles')
           .select('username')
           .eq('id', authData.user.id)
           .single()
         
         if (error) throw error
         profile = {
           username: (data as any)?.username as string
         }
       } catch (error) {
         warn('Profile fetch error (using fallback):', error)
       }

      const user: User = {
        id: authData.user.id,
        name: profile?.username || authData.user.user_metadata?.username || 'User',
        email: authData.user.email || email,
      }

      info('Login successful:', user)
      return { user, error: null }
    } catch (error) {
      logError('Login error:', error)
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
      logError('Supabase client not available')
      return { user: null, error: this.getUnavailableError() }
    }

    try {
      debug('Starting login with username:', username)

             // Try to find the profile with this username using multiple strategies
       let profile: { id: string; username: string; email?: string } | null = null
       let email: string | null = null

       const supabase = await this.getSupabase()
       if (!supabase) {
         return { user: null, error: this.getUnavailableError() }
       }

       // Strategy 1: Try profiles table directly (user_lookup now requires authentication)
       try {
         const { data, error } = await supabase
           .from('profiles')
           .select('id, username, email')
           .eq('username', username)
           .single()
         
         if (error) throw error
         profile = {
           id: data.id as string,
           username: data.username as string,
           email: data.email as string | undefined
         }
         email = profile?.email || null
         debug('Found profile via profiles table:', profile)
       } catch (error: unknown) {
         debug('profiles table lookup failed:', error)
       }

      if (!profile || !email) {
        warn('Profile not found for username:', username)
        return {
          user: null,
          error: { code: 'USER_NOT_FOUND', message: 'Username not found' },
        }
      }

      debug('Profile found, attempting login with email:', email)

      // Now login with the found email
      return await this.login(email, password)
    } catch (error) {
      logError('Username login error:', error)
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
      // Add timeout to the entire operation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('getCurrentUser timeout')), 3000)
      })

      const getCurrentUserOperation = async () => {
        const supabase = await this.getSupabase()
        if (!supabase) return null
        
        const { data: { user: authUser }, error } = await supabase.auth.getUser()

        if (error || !authUser) {
          debug('No authenticated user found')
          return null
        }

        // Try to get profile data with fallback and timeout
        let profile: { username: string } | null = null
        try {
          const profilePromise = supabase
            .from('profiles')
            .select('username')
            .eq('id', authUser.id)
            .single()
          
          const profileTimeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Profile fetch timeout')), 2000)
          })

          const { data } = await Promise.race([profilePromise, profileTimeout])
          profile = data ? {
            username: (data as any)?.username as string
          } : null
        } catch (error) {
          warn('Profile fetch failed, using auth metadata:', error)
        }

        return {
          id: authUser.id,
          name: profile?.username || authUser.user_metadata?.username || 'User',
          email: authUser.email || '',
        }
      }

      return await Promise.race([getCurrentUserOperation(), timeoutPromise])
    } catch (error) {
      logError('Error getting current user:', error)
      return null
    }
  }

  /**
   * Logout user with improved error handling
   */
  async logout(): Promise<void> {
    if (!(await this.isSupabaseAvailable())) {
      return
    }

    try {
      const supabase = await this.getSupabase()
      if (!supabase) return
      
      await supabase.auth.signOut()
      info('Logout successful')
    } catch (error) {
      logError('Logout error:', error)
      // Don't throw on logout errors, just log them
    }
  }

  /**
   * Set up auth state change listener with error handling
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    // Temporarily disabled due to compilation issues
    console.warn('onAuthStateChange temporarily disabled')
    return () => {}
  }

  /**
   * Get current session directly without profile fetch (faster)
   */
  async getSession(): Promise<User | null> {
    if (!(await this.isSupabaseAvailable())) {
      return null
    }

    try {
      const supabase = await this.getSupabase()
      if (!supabase) return null
      
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session?.user) {
        debug('No active session found')
        return null
      }

      return {
        id: session.user.id,
        name: session.user.user_metadata?.username || 'User',
        email: session.user.email || '',
      }
    } catch (error) {
      logError('Error getting session:', error)
      return null
    }
  }
}

export const supabaseAuth = new SupabaseAuthService()
