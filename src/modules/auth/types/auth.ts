export interface User {
  id: string
  email: string
  name: string
  picture?: string
  given_name?: string
  family_name?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  token: string | null
}

export interface GoogleAuthResponse {
  access_token: string
  id_token: string
  scope: string
  token_type: string
  expires_in: number
}

export interface DecodedToken {
  sub: string
  email: string
  name: string
  picture?: string
  given_name?: string
  family_name?: string
  iat: number
  exp: number
  aud: string
  iss: string
}

export interface AuthError {
  code: string
  message: string
  details?: any
}

export interface AuthConfig {
  clientId: string
  redirectUri: string
  scope: string
}

export type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' } 