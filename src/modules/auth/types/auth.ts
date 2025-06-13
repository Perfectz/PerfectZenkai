export interface User {
  id: string
  email: string
  name: string
  username?: string
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



export interface AuthError {
  code: string
  message: string
  details?: Record<string, unknown>
}



export type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' } 