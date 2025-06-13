import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function SimpleLoginPage() {
  const { login, register, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: ''
  })

  // Redirect if already authenticated - handled by React Router
  useEffect(() => {
    if (isAuthenticated) {
      // Navigation will be handled by the parent routing logic
    }
  }, [isAuthenticated])

  // Clear error when component mounts or mode changes
  useEffect(() => {
    clearError()
  }, [clearError, isRegisterMode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    // Validation
    if (!formData.username.trim() || !formData.password.trim()) {
      return
    }

    if (isRegisterMode) {
      // Register - validate email is required
      if (!formData.email.trim()) {
        return
      }
      
      if (formData.password.length < 6) {
        // This will be handled by the store's error state
        return
      }
      
      register({
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim(),
        name: formData.name.trim() || undefined
      })
    } else {
      // Login
      login({
        username: formData.username.trim(),
        password: formData.password
      })
    }
  }

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    setFormData({ username: '', password: '', email: '', name: '' })
    clearError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* App Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Perfect Zenkai
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal fitness and productivity companion
          </p>
        </div>

        {/* Login/Register Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isRegisterMode ? 'Create Account' : 'Welcome back'}
            </CardTitle>
            <CardDescription className="text-center">
              {isRegisterMode 
                ? 'Sign up to start your journey' 
                : 'Sign in to access your dashboard'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    minLength={isRegisterMode ? 6 : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isRegisterMode && (
                  <p className="text-sm text-gray-500">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {/* Registration Fields */}
              {isRegisterMode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name (optional)</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  isLoading || 
                  !formData.username.trim() || 
                  !formData.password.trim() ||
                  (isRegisterMode && !formData.email.trim())
                }
                className="w-full h-12 text-base font-medium"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {isRegisterMode 
                  ? (isLoading ? 'Creating Account...' : 'Create Account')
                  : (isLoading ? 'Signing in...' : 'Sign In')
                }
              </Button>
            </form>

            {/* Mode Toggle */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={toggleMode}
                disabled={isLoading}
                className="text-sm"
              >
                {isRegisterMode 
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>

            {/* Demo Account Info */}
            {!isRegisterMode && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                  <strong>Demo:</strong> Create an account or use any username/password to test
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 