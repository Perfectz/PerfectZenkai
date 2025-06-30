import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  Scale,
  CheckSquare,
  TrendingUp,
  Brain,
  Calendar,
  Camera,
  Github,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Users,
  Code2,
  Sparkles,
  FileText,
  Briefcase,
  ArrowRight,
} from 'lucide-react'

export default function SimpleLoginPage() {
  const navigate = useNavigate()
  const { login, register, isLoading, error, clearError, isAuthenticated } =
    useAuthStore()
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [activeInfoSection, setActiveInfoSection] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
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
    setFormData((prev) => ({ ...prev, [name]: value }))
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
          name: formData.name.trim() || undefined,
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
        password: formData.password,
      })
    }
  }

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    setFormData({ username: '', password: '', email: '', name: '' })
    setRegistrationSuccess(false)
    clearError()
  }

  const InfoSection = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string
    title: string
    icon: React.ElementType
    children: React.ReactNode 
  }) => {
    const isActive = activeInfoSection === id
    return (
      <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
        <CardHeader className="pb-3">
          <Button
            variant="ghost"
            onClick={() => setActiveInfoSection(isActive ? null : id)}
            className="flex items-center justify-between w-full p-0 h-auto text-left"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-ki-green" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            {isActive ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </Button>
        </CardHeader>
        {isActive && (
          <CardContent className="pt-0">
            {children}
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* App Information Section - Left Side */}
          <div className="w-full space-y-6 lg:w-2/3">
            {/* Hero Section */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="mb-6 flex items-center justify-center gap-4 lg:justify-start">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ki-green to-blue-500 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 dark:text-white lg:text-6xl" style={{
                    textShadow: '0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Perfect <span className="text-ki-green" style={{
                      textShadow: '0 0 20px rgba(34, 255, 183, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)',
                      background: 'linear-gradient(135deg, #22ffb7 0%, #1be7ff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>Zenkai</span>
                  </h1>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 mt-1 font-semibold" style={{
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    全快 - Complete Wellness & Productivity
                  </p>
                </div>
              </div>
              <p className="max-w-2xl text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                The ultimate AI-powered personal wellness and productivity platform. 
                Combining cutting-edge technology with intuitive design to help you 
                achieve your <span className="font-semibold text-ki-green">perfect state of being</span>.
              </p>
              
              {/* Achievement Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ki-green/10 to-blue-500/10 border border-ki-green/20 rounded-full">
                <TrendingUp className="h-4 w-4 text-ki-green" />
                <span className="text-sm font-semibold text-ki-green">96.6% Code Quality Achievement</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Enterprise-Grade</span>
              </div>
            </div>

            {/* Expandable Information Sections */}
            <div className="space-y-4">
              <InfoSection id="features" title="🚀 Key Features" icon={Sparkles}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-ki-green mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">AI-Powered Personal Assistant</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Natural language interface with voice input and contextual intelligence</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Scale className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Weight Management System</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Smart tracking with AI coaching and predictive analytics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Camera className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Food Analysis & Nutrition</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Photo-based food recognition with GPT-4 Vision</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckSquare className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Advanced Task Management</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">AI prioritization with productivity analytics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Mental Wellness & Journaling</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Emotional analysis with crisis support system</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Daily Standup & Reflection</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Voice-powered planning and AI insights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </InfoSection>

              <InfoSection id="architecture" title="🏗️ Technical Architecture" icon={Code2}>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend Stack</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• React 18 with TypeScript</li>
                        <li>• Vite for lightning-fast builds</li>
                        <li>• Tailwind CSS with custom design tokens</li>
                        <li>• Zustand for state management</li>
                        <li>• Dexie.js for offline-first storage</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Backend & AI</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Supabase for real-time database</li>
                        <li>• Azure Functions for serverless APIs</li>
                        <li>• OpenAI GPT-4 for AI capabilities</li>
                        <li>• Azure Key Vault for security</li>
                        <li>• Progressive Web App features</li>
                      </ul>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Vertical Slice Architecture</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Each feature is implemented as a complete vertical slice including UI, business logic, 
                      data layer, and comprehensive testing for maximum maintainability.
                    </p>
                  </div>
                </div>
              </InfoSection>

              <InfoSection id="achievements" title="🏆 Technical Achievements" icon={TrendingUp}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-ki-green rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">96.6% ESLint Error Reduction</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Enterprise-Grade TypeScript</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Comprehensive AI Integration</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Full Offline Support</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Lighthouse 90+ Scores</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Production-Ready Codebase</span>
                    </div>
                  </div>
                </div>
              </InfoSection>

              <InfoSection id="getting-started" title="🚀 Getting Started" icon={Lightbulb}>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">For Users</h4>
                    <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Create an account or use offline mode</li>
                      <li>Install as PWA for the best experience</li>
                      <li>Start with daily standup and weight tracking</li>
                      <li>Explore AI chat for personalized insights</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">For Developers</h4>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm">
                      <div className="text-gray-600 dark:text-gray-400">
                        git clone https://github.com/Perfectz/PerfectZenkai.git<br/>
                        npm install<br/>
                        npm run dev
                      </div>
                    </div>
                  </div>
                </div>
              </InfoSection>

              <InfoSection id="usecase-overview" title="📋 Use Case Overview" icon={Briefcase}>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Explore a comprehensive technical showcase demonstrating enterprise-grade 
                    development practices across modern software engineering domains.
                  </p>
                  
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Technical Domains</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Vibe Coding Fundamentals</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-azure-500 rounded-full"></div>
                          <span>Azure Cloud Integration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Modern App Development</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>SDLC Best Practices</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Machine Learning Integration</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Key Highlights</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-ki-green" />
                          <span>Vertical Slice Architecture</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-ki-green" />
                          <span>Enterprise Security Patterns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-ki-green" />
                          <span>AI-Powered Function Calling</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-ki-green" />
                          <span>Test-Driven Development</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-ki-green" />
                          <span>Progressive Web App</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-ki-green/10 to-blue-500/10 rounded-lg border border-ki-green/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Complete Technical Portfolio
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Comprehensive documentation with architecture diagrams, code examples, 
                          and implementation details
                        </p>
                      </div>
                      <Button 
                        onClick={() => navigate('/use-case-overview')}
                        className="bg-ki-green hover:bg-ki-green/90 text-white flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        View Portfolio
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">12+</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Modules</div>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600">90%+</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Test Coverage</div>
                    </div>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">5</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">AI Agents</div>
                    </div>
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">100%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">TypeScript</div>
                    </div>
                  </div>
                </div>
              </InfoSection>

              <InfoSection id="contributing" title="🤝 Contributing" icon={Users}>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We welcome contributions from developers of all skill levels! Perfect Zenkai follows 
                    enterprise-grade development standards with comprehensive testing and documentation.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Ways to Contribute</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Bug fixes and feature development</li>
                        <li>• Documentation improvements</li>
                        <li>• Performance optimizations</li>
                        <li>• Test coverage enhancements</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Development Standards</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• TypeScript strict mode required</li>
                        <li>• Comprehensive test coverage</li>
                        <li>• Vertical slice architecture</li>
                        <li>• Test-driven development</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open('https://github.com/Perfectz/PerfectZenkai', '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Github className="h-4 w-4" />
                      View on GitHub
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </InfoSection>
            </div>

            {/* Quick Stats */}
            <Card className="border-0 bg-gradient-to-r from-ki-green/5 to-blue-500/5 border border-ki-green/20">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white text-center">
                  Platform Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-ki-green">20+</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Major Features</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">96.6%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Code Quality</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">100%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Offline Ready</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">90+</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Lighthouse Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Login/Register Card - Right Side */}
          <div className="w-full lg:sticky lg:top-8 lg:w-1/3">
            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-center text-2xl">
                  {isRegisterMode ? 'Create Account' : 'Welcome back'}
                </CardTitle>
                <CardDescription className="text-center">
                  {isRegisterMode
                    ? 'Sign up to start your journey'
                    : 'Sign in to access your dashboard'}
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
                    className="h-12 w-full text-base font-medium"
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
                          ? isLoading
                            ? 'Creating Account...'
                            : 'Create Account'
                          : isLoading
                            ? 'Signing in...'
                            : 'Sign In'}
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
                      : "Don't have an account? Sign up"}
                  </Button>
                </div>

                {/* Demo Account Info */}
                {!isRegisterMode && (
                  <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-center text-sm text-blue-700 dark:text-blue-300">
                      <strong>Cross-Device Sync:</strong> Your account works on
                      any device with cloud backup via Supabase
                    </p>
                  </div>
                )}

                {/* App Stats */}
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        Cloud
                      </div>
                      <div className="text-xs text-gray-500">Sync</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ∞
                      </div>
                      <div className="text-xs text-gray-500">Devices</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        Secure
                      </div>
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
