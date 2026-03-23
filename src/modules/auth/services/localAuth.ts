import type { AuthRole, User } from '../types/auth'

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
  role: AuthRole
  passwordHash: string
  createdAt: string
}

export class LocalAuthService {
  private readonly USERS_KEY = 'zenkai_users'
  private readonly CURRENT_USER_KEY = 'zenkai_current_user'
  private readonly BOOTSTRAP_ADMIN_USERNAME = 'admin'
  private readonly BOOTSTRAP_ADMIN_PASSWORD = 'revive-admin-123'

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
      const parsedUsers = users ? (JSON.parse(users) as StoredUser[]) : []
      const normalizedUsers = parsedUsers.map((user) => ({
        ...user,
        role: user.role ?? 'user',
      }))

      const hasAdmin = normalizedUsers.some((user) => user.role === 'admin')
      if (!hasAdmin) {
        normalizedUsers.unshift({
          id: 'local_admin_bootstrap',
          username: this.BOOTSTRAP_ADMIN_USERNAME,
          email: 'admin@perfectzenkai.local',
          name: 'Revival Admin',
          role: 'admin',
          passwordHash: this.hashPassword(this.BOOTSTRAP_ADMIN_PASSWORD),
          createdAt: new Date().toISOString(),
        })
        this.saveUsers(normalizedUsers)
      } else if (normalizedUsers.length !== parsedUsers.length || normalizedUsers.some((user, index) => user.role !== parsedUsers[index]?.role)) {
        this.saveUsers(normalizedUsers)
      }

      return normalizedUsers
    } catch {
      const bootstrapAdmin: StoredUser = {
        id: 'local_admin_bootstrap',
        username: this.BOOTSTRAP_ADMIN_USERNAME,
        email: 'admin@perfectzenkai.local',
        name: 'Revival Admin',
        role: 'admin',
        passwordHash: this.hashPassword(this.BOOTSTRAP_ADMIN_PASSWORD),
        createdAt: new Date().toISOString(),
      }
      this.saveUsers([bootstrapAdmin])
      return [bootstrapAdmin]
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
      role: 'user',
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
      role: newUser.role,
      authProvider: 'local',
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
      role: storedUser.role,
      authProvider: 'local',
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
      const storedUsers = this.getStoredUsers()
      const storedUser = storedUsers.find((user) => user.id === session.user.id)
      const loginTime = session.loginTime || 0
      const now = Date.now()
      const sessionAge = now - loginTime

      // Session expires after 7 days
      if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
        this.logout()
        return null
      }

      const publicUser: User = {
        id: storedUser?.id || session.user.id,
        email: storedUser?.email || session.user.email || '',
        name: storedUser?.name || session.user.name || session.user.username,
        username: storedUser?.username || session.user.username,
        role: storedUser?.role || session.user.role || 'user',
        authProvider: 'local',
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

  getBootstrapAdminCredentials(): { username: string; password: string; role: AuthRole } {
    this.getStoredUsers()
    return {
      username: this.BOOTSTRAP_ADMIN_USERNAME,
      password: this.BOOTSTRAP_ADMIN_PASSWORD,
      role: 'admin',
    }
  }

  listUsers(): Array<Omit<StoredUser, 'passwordHash'>> {
    return this.getStoredUsers().map(({ passwordHash: _passwordHash, ...user }) => user)
  }

  async updateUserRole(userId: string, role: AuthRole): Promise<User> {
    const users = this.getStoredUsers()
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, role } : user
    )
    const updatedUser = updatedUsers.find((user) => user.id === userId)

    if (!updatedUser) {
      throw new Error('User not found')
    }

    this.saveUsers(updatedUsers)

    return {
      id: updatedUser.id,
      email: updatedUser.email || '',
      name: updatedUser.name || updatedUser.username,
      username: updatedUser.username,
      role: updatedUser.role,
      authProvider: 'local',
    }
  }

  async resetPassword(userId: string, password: string): Promise<void> {
    const users = this.getStoredUsers()
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? { ...user, passwordHash: this.hashPassword(password) }
        : user
    )

    const foundUser = updatedUsers.some((user) => user.id === userId)
    if (!foundUser) {
      throw new Error('User not found')
    }

    this.saveUsers(updatedUsers)
  }
}

export const localAuthService = new LocalAuthService()
