import { User } from '../types/auth'

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterData {
  username: string
  password: string
  email?: string
  name?: string
}

interface StoredUser {
  id: string
  username: string
  email?: string
  name?: string
  passwordHash: string
  createdAt: string
}

export class LocalAuthService {
  private readonly USERS_KEY = 'zenkai_users'
  private readonly CURRENT_USER_KEY = 'zenkai_current_user'

  /**
   * Simple hash function for passwords (in production, use bcrypt or similar)
   */
  private hashPassword(password: string): string {
    // Simple hash for demo - in production use proper hashing
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  /**
   * Get all stored users
   */
  private getStoredUsers(): StoredUser[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY)
      return users ? JSON.parse(users) : []
    } catch {
      return []
    }
  }

  /**
   * Save users to localStorage
   */
  private saveUsers(users: StoredUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<User> {
    const users = this.getStoredUsers()

    // Check if username already exists
    if (users.find((user) => user.username === data.username)) {
      throw new Error('Username already exists')
    }

    // Create new user
    const newUser: StoredUser = {
      id: this.generateUserId(),
      username: data.username,
      email: data.email,
      name: data.name || data.username,
      passwordHash: this.hashPassword(data.password),
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    this.saveUsers(users)

    // Return public user info
    const publicUser: User = {
      id: newUser.id,
      email: newUser.email || '',
      name: newUser.name || newUser.username,
      username: newUser.username,
    }

    return publicUser
  }

  /**
   * Login user
   */
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> {
    const users = this.getStoredUsers()
    const passwordHash = this.hashPassword(credentials.password)

    const storedUser = users.find(
      (user) =>
        user.username === credentials.username &&
        user.passwordHash === passwordHash
    )

    if (!storedUser) {
      throw new Error('Invalid username or password')
    }

    // Create session token (simple timestamp-based token)
    const token = `token_${storedUser.id}_${Date.now()}`

    // Store current user session
    localStorage.setItem(
      this.CURRENT_USER_KEY,
      JSON.stringify({
        user: storedUser,
        token,
        loginTime: Date.now(),
      })
    )

    const publicUser: User = {
      id: storedUser.id,
      email: storedUser.email || '',
      name: storedUser.name || storedUser.username,
      username: storedUser.username,
    }

    return { user: publicUser, token }
  }

  /**
   * Check if user is currently logged in
   */
  getCurrentUser(): { user: User; token: string } | null {
    try {
      const currentSession = localStorage.getItem(this.CURRENT_USER_KEY)
      if (!currentSession) return null

      const session = JSON.parse(currentSession)
      const loginTime = session.loginTime || 0
      const now = Date.now()
      const sessionAge = now - loginTime

      // Session expires after 7 days
      if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
        this.logout()
        return null
      }

      const publicUser: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || session.user.username,
        username: session.user.username,
      }

      return { user: publicUser, token: session.token }
    } catch {
      return null
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }

  /**
   * Check if token is valid
   */
  isTokenValid(token: string): boolean {
    const session = this.getCurrentUser()
    return session?.token === token
  }

  /**
   * Get all usernames (for checking availability)
   */
  getAllUsernames(): string[] {
    return this.getStoredUsers().map((user) => user.username)
  }
}

export const localAuthService = new LocalAuthService()
