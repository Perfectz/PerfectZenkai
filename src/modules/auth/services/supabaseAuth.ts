import { supabase } from '@/lib/supabase'
import type { User, AuthError } from '../types/auth'

export class SupabaseAuthService {
  
  /**
   * Register a new user with email and password
   */
  async register(username: string, email: string, password: string): Promise<{ user: User | null, error: AuthError | null }> {
    try {
      // Check if username is already taken
      const { data: existingProfile } = await supabase
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
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
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username
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
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        return {
          user: null,
          error: { code: 'LOGIN_ERROR', message: authError.message }
        }
      }

      if (!authData.user) {
        return {
          user: null,
          error: { code: 'LOGIN_FAILED', message: 'Login failed' }
        }
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', authData.user.id)
        .single()

      const user: User = {
        id: authData.user.id,
        name: profile?.username || authData.user.user_metadata?.username || 'User',
        email: authData.user.email || email
      }

      return { user, error: null }
    } catch (error) {
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
    try {
      // First, find the email associated with this username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

      if (profileError || !profile) {
        return {
          user: null,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' }
        }
      }

      // Get the user's email from auth.users
      const { data: { user: authUser }, error: userError } = await supabase.auth.admin.getUserById(profile.id)
      
      if (userError || !authUser?.email) {
        return {
          user: null,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' }
        }
      }

      // Now login with email and password
      return this.login(authUser.email, password)
    } catch (error) {
      return {
        user: null,
        error: { code: 'LOGIN_ERROR', message: 'Invalid username or password' }
      }
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        return null
      }

      // Get user profile
      const { data: profile } = await supabase
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
    await supabase.auth.signOut()
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
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