// src/modules/auth/index.ts

// Components
export { default as SimpleLoginPage } from './components/SimpleLoginPage'
export { default as ProtectedRoute } from './components/ProtectedRoute'

// Store
export { useAuthStore } from './store/authStore'

// Services
export { localAuthService } from './services/localAuth'

// Routes
export { authRoutes } from './routes'

// Types
export type { User, AuthState } from './types/auth' 