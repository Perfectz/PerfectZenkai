// src/modules/auth/index.ts

// Components
export { default as LoginPage } from './components/LoginPage'
export { default as AuthCallback } from './components/AuthCallback'
export { default as ProtectedRoute } from './components/ProtectedRoute'

// Store
export { useAuthStore } from './store/authStore'

// Services
export { googleAuthService } from './services/googleAuth'

// Routes
export { authRoutes } from './routes'

// Types
export type { User, AuthState, AuthConfig } from './types/auth' 