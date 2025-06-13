import { supabase } from '@/lib/supabase'
import type { User, AuthError } from '../types/auth'

export class SupabaseAuthService {
  
  /**
   * Check if Supabase client is available
   */
  private isSupabaseAvailable(): boolean {
    return supabase !== null
  }

  /**
   * Get error for unavailable Supabase
   */
  private getUnavailableError(): AuthError {
    return { code: 'SERVICE_UNAVAILABLE', message: 'Authentication service is not available' }
  }

  /**
   * Register a new user with email and password
   */
  async register(username: string, email: string, password: string): Promise<{ user: User | null, error: AuthError | null }> {
    if (!this.isSupabaseAvailable()) {
      return { user: null, error: this.getUnavailableError() }
    }

    try {
      // Check if username is already taken
      const { data: existingProfile } = await supabase!
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (existingProfile) {
        return {
          user: null,
          error: { code: 'USERNAME_TAKEN', message: 'Username already taken' }
        }
      }

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          },
          emailRedirectTo: undefined // Disable email confirmation for development
        }
      })

      if (authError) {
        return {
          user: null,
          error: { code: 'SIGNUP_ERROR', message: authError.message }
        }
      }

      if (!authData.user) {
        return {
          user: null,
          error: { code: 'SIGNUP_FAILED', message: 'Registration failed' }
        }
      }

      // Create user profile
      const { error: profileError } = await supabase!
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          email
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      const user: User = {
        id: authData.user.id,
        name: username,
        email: authData.user.email || email
      }

      return { user, error: null }
    } catch (error) {
      return {
        user: null,
        error: { code: 'REGISTER_ERROR', message: error instanceof Error ? error.message : 'Registration failed' }
      }
    }
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<{ user: User | null, error: AuthError | null }> {
    if (!this.isSupabaseAvailable()) {
      return { user: null, error: this.getUnavailableError() }
    }

    try {
      console.log('🔐 Starting login with email:', email)
      
      const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
        email,
        password
      })

      console.log('🔑 Supabase auth result:', { authData, authError })

      if (authError) {
        console.log('❌ Auth error:', authError)
        return {
          user: null,
          error: { code: 'LOGIN_ERROR', message: authError.message }
        }
      }

      if (!authData.user) {
        console.log('❌ No user in auth data')
        return {
          user: null,
          error: { code: 'LOGIN_FAILED', message: 'Login failed' }
        }
      }

      console.log('✅ Auth successful, fetching profile for user:', authData.user.id)

      // Get user profile
      const { data: profile } = await supabase!
        .from('profiles')
        .select('username')
        .eq('id', authData.user.id)
        .single()

      console.log('👤 Profile data:', profile)

      const user: User = {
        id: authData.user.id,
        name: profile?.username || authData.user.user_metadata?.username || 'User',
        email: authData.user.email || email
      }

      console.log('🎉 Login successful, user object:', user)

      return { user, error: null }
    } catch (error) {
      console.error('💥 Login error:', error)
      return {
        user: null,
        error: { code: 'LOGIN_ERROR', message: error instanceof Error ? error.message : 'Login failed' }
      }
    }
  }

  /**
   * Login with username instead of email
   */
  async loginWithUsername(username: string, password: string): Promise<{ user: User | null, error: AuthError | null }> {
    if (!this.isSupabaseAvailable()) {
      console.error('❌ Supabase client not available')
      return { user: null, error: this.getUnavailableError() }
    }

    try {
      console.log('🔍 Starting login with username:', username)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout after 10 seconds')), 10000)
      })
      
      // First, find the profile with this username and get the associated email
      const profilePromise = supabase!
        .from('profiles')
        .select('id, username, email')
        .eq('username', username)
        .single()
      
      const { data: profile, error: profileError } = await Promise.race([profilePromise, timeoutPromise])

      console.log('📋 Profile query result:', { profile, profileError })

      if (profileError || !profile) {
        console.log('❌ Profile not found or error:', profileError)
        return {
          user: null,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' }
        }
      }

      if (!profile.email) {
        console.log('❌ Profile found but no email stored')
        return {
          user: null,
          error: { code: 'INVALID_CREDENTIALS', message: 'Account configuration error' }
        }
      }

      console.log('✅ Profile found, attempting login with email:', profile.email)
      
      // Now login with the stored email and password
      const loginPromise = this.login(profile.email, password)
      const loginResult = await Promise.race([loginPromise, timeoutPromise])
      console.log('🔐 Login result:', loginResult)
      
      return loginResult
    } catch (error) {
      console.error('💥 Login with username error:', error)
      return {
        user: null,
        error: { code: 'LOGIN_ERROR', message: error instanceof Error ? error.message : 'Login failed' }
      }
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.isSupabaseAvailable()) {
      return null
    }

    try {
      const { data: { user: authUser } } = await supabase!.auth.getUser()
      
      if (!authUser) {
        return null
      }

      // Get user profile
      const { data: profile } = await supabase!
        .from('profiles')
        .select('username')
        .eq('id', authUser.id)
        .single()

      return {
        id: authUser.id,
        name: profile?.username || authUser.user_metadata?.username || 'User',
        email: authUser.email || ''
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      return
    }
    await supabase!.auth.signOut()
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    if (!this.isSupabaseAvailable()) {
      // Return a no-op unsubscribe function
      return { data: { subscription: null }, error: null }
    }

    return supabase!.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}

export const supabaseAuth = new SupabaseAuthService() 