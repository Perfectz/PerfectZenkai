import { AuthConfig, GoogleAuthResponse, DecodedToken } from '../types/auth'

export class GoogleAuthService {
  private config: AuthConfig

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/auth/callback`,
      scope: 'openid email profile'
    }

    if (!this.config.clientId) {
      console.warn('Google Client ID not found. Please set VITE_GOOGLE_CLIENT_ID environment variable.')
    }
  }

  /**
   * Initiate Google OAuth login flow
   */
  login(): void {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope,
      access_type: 'offline',
      prompt: 'consent'
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    window.location.href = authUrl
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(code: string): Promise<GoogleAuthResponse> {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: '', // For public clients, this is empty
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.statusText}`)
      }

      const tokens: GoogleAuthResponse = await tokenResponse.json()
      return tokens
    } catch (error) {
      console.error('OAuth callback error:', error)
      throw new Error('Failed to exchange authorization code for tokens')
    }
  }

  /**
   * Decode JWT token to extract user information
   */
  decodeToken(idToken: string): DecodedToken {
    try {
      // Simple JWT decode (for production, use a proper JWT library)
      const base64Url = idToken.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      return JSON.parse(jsonPayload) as DecodedToken
    } catch (error) {
      console.error('Token decode error:', error)
      throw new Error('Failed to decode ID token')
    }
  }

  /**
   * Verify token is still valid
   */
  isTokenValid(token: string): boolean {
    try {
      const decoded = this.decodeToken(token)
      const now = Math.floor(Date.now() / 1000)
      return decoded.exp > now
    } catch {
      return false
    }
  }

  /**
   * Get user info from Google API using access token
   */
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get user info error:', error)
      throw new Error('Failed to fetch user information')
    }
  }

  /**
   * Revoke Google OAuth tokens
   */
  async revokeToken(token: string): Promise<void> {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    } catch (error) {
      console.error('Token revocation error:', error)
      // Don't throw here as local logout should still work
    }
  }
}

export const googleAuthService = new GoogleAuthService() 