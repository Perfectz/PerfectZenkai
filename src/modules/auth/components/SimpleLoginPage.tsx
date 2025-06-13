import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Loader2, Eye, EyeOff, CheckCircle, Scale, CheckSquare, Zap, Shield, Smartphone, TrendingUp, Moon } from 'lucide-react'

export default function SimpleLoginPage() {
  const navigate = useNavigate()
  const { login, register, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: ''
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🚀 User is authenticated, redirecting to dashboard...')
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Clear error when component mounts or mode changes
  useEffect(() => {
    clearError()
    setRegistrationSuccess(false)
  }, [clearError, isRegisterMode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setRegistrationSuccess(false)

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
      
      try {
        await register({
          username: formData.username.trim(),
          password: formData.password,
          email: formData.email.trim(),
          name: formData.name.trim() || undefined
        })
        
        // If registration is successful, show success message and switch to login
        setRegistrationSuccess(true)
        setFormData({ username: '', password: '', email: '', name: '' })
        setTimeout(() => {
          setIsRegisterMode(false)
          setRegistrationSuccess(false)
        }, 2000)
        
      } catch (error) {
        // Error handling is already managed by the store
        console.error('Registration failed:', error)
      }
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
    setRegistrationSuccess(false)
    clearError()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* App Information Section - Left Side */}
          <div className="w-full lg:w-2/3 space-y-8">
            {/* Hero Section */}
            <div className="text-center lg:text-left space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                  Perfect Zenkai
                </h1>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                Your ultimate fitness and productivity companion. Track your progress, 
                manage tasks, and achieve your goals with our modern, offline-first PWA.
              </p>
            </div>

            {/* Key Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Scale className="w-8 h-8 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Weight Tracking</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Log daily weights and visualize your progress with beautiful sparkline charts
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckSquare className="w-8 h-8 text-green-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Task Management</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Organize your day with comprehensive todo system and productivity tracking
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Smartphone className="w-8 h-8 text-purple-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">PWA Ready</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Install on any device and enjoy full offline functionality
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-8 h-8 text-orange-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Secure & Private</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your data stays on your device with user-isolated secure storage
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-8 h-8 text-red-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Progress Analytics</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Comprehensive dashboard with streaks, trends, and insights
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Moon className="w-8 h-8 text-indigo-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Dark Theme</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Modern dark interface that's easy on the eyes, day or night
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Why Choose Perfect Zenkai?
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Offline First</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Full functionality without internet connection
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Data Export</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Export your data anytime for backup or analysis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">No Ads</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Clean, distraction-free interface focused on your goals
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">Fast & Responsive</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Optimized for speed with smooth 60fps animations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Login/Register Card - Right Side */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-8">
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
                {/* Success Alert */}
                {registrationSuccess && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      Account created successfully! Redirecting to login...
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Alert */}
                {error && !registrationSuccess && (
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
                      disabled={isLoading || registrationSuccess}
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
                        disabled={isLoading || registrationSuccess}
                        minLength={isRegisterMode ? 6 : undefined}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || registrationSuccess}
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
                          disabled={isLoading || registrationSuccess}
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
                          disabled={isLoading || registrationSuccess}
                        />
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={
                      isLoading || 
                      registrationSuccess ||
                      !formData.username.trim() || 
                      !formData.password.trim() ||
                      (isRegisterMode && !formData.email.trim())
                    }
                    className="w-full h-12 text-base font-medium"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : null}
                    {registrationSuccess ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Account Created!
                      </>
                    ) : (
                      <>
                        {isRegisterMode 
                          ? (isLoading ? 'Creating Account...' : 'Create Account')
                          : (isLoading ? 'Signing in...' : 'Sign In')
                        }
                      </>
                    )}
                  </Button>
                </form>

                {/* Mode Toggle */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={toggleMode}
                    disabled={isLoading || registrationSuccess}
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
                      <strong>Cross-Device Sync:</strong> Your account works on any device with cloud backup via Supabase
                    </p>
                  </div>
                )}

                {/* App Stats */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">Cloud</div>
                      <div className="text-xs text-gray-500">Sync</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">∞</div>
                      <div className="text-xs text-gray-500">Devices</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">Secure</div>
                      <div className="text-xs text-gray-500">Backup</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 