import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { localAuthService } from '../services/localAuth'
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
  const location = useLocation()
  const { login, register, isLoading, error, clearError, isAuthenticated } =
    useAuthStore()
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [activeInfoSection, setActiveInfoSection] = useState<string | null>(null)
  const bootstrapAdmin = localAuthService.getBootstrapAdminCredentials()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
  })

  const redirectTarget =
    typeof location.state === 'object' && location.state && 'from' in location.state
      ? String((location.state as { from?: string }).from || '/')
      : '/'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log(`🚀 User is authenticated, redirecting to ${redirectTarget}...`)
      navigate(redirectTarget, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTarget])

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

  const fillBootstrapAdmin = () => {
    setFormData((prev) => ({
      ...prev,
      username: bootstrapAdmin.username,
      password: bootstrapAdmin.password,
    }))
    setIsRegisterMode(false)
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
      <Card className="overflow-hidden border border-white/10 bg-slate-900/60 shadow-[0_16px_40px_rgba(2,8,23,0.2)] backdrop-blur-sm">
        <CardHeader className="pb-3">
          <Button
            variant="ghost"
            onClick={() => setActiveInfoSection(isActive ? null : id)}
            className="flex h-auto w-full items-center justify-between p-0 text-left text-slate-100 hover:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-ki-green" />
              <h3 className="text-base font-semibold text-white sm:text-lg">
                {title}
              </h3>
            </div>
            {isActive ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
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
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(34,255,183,0.12),transparent_28%),linear-gradient(180deg,#0f172a,#111827)]">
      <div className="mx-auto max-w-[92rem] px-4 py-4 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,28rem)] lg:items-start lg:gap-8">
          {/* App Information Section - Left Side */}
          <div className="order-2 w-full space-y-5 lg:order-1">
            {/* Hero Section */}
            <div className="space-y-5 text-left">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ki-green to-blue-500 shadow-lg sm:h-16 sm:w-16">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl" style={{
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
                  <p className="mt-1 text-xs font-mono font-semibold text-slate-300 sm:text-sm" style={{
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    全快 - Complete Wellness & Productivity
                  </p>
                </div>
              </div>
              <p className="max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg lg:text-xl">
                The ultimate AI-powered personal wellness and productivity platform. 
                Combining cutting-edge technology with intuitive design to help you 
                achieve your <span className="font-semibold text-ki-green">perfect state of being</span>.
              </p>
              
              {/* Achievement Badge */}
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-ki-green/20 bg-gradient-to-r from-ki-green/10 to-blue-500/10 px-4 py-2">
                <TrendingUp className="h-4 w-4 text-ki-green" />
                <span className="text-sm font-semibold text-ki-green">96.6% Code Quality Achievement</span>
                <span className="text-xs text-slate-400">Enterprise-Grade</span>
              </div>

              <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-left shadow-sm backdrop-blur-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-amber-100">
                      Revival Mode Admin Preview
                    </h2>
                    <p className="mt-1 text-sm text-amber-200/90">
                      Local auth is available right now so you can revive and inspect the app before rebuilding Supabase.
                    </p>
                    <div className="mt-3 space-y-1 text-sm font-mono text-amber-100">
                      <div>username: {bootstrapAdmin.username}</div>
                      <div>password: {bootstrapAdmin.password}</div>
                      <div>role: {bootstrapAdmin.role}</div>
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={fillBootstrapAdmin} className="min-h-[44px] border-amber-300/30 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20">
                    Use Admin Login
                  </Button>
                </div>
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
                      <li>Start with health tracking, tasks, and journal check-ins</li>
                      <li>Use notes and reflections to build your routine before enabling AI features</li>
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
            <Card className="border border-ki-green/20 bg-gradient-to-r from-ki-green/5 to-blue-500/5 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-center text-lg font-semibold text-white sm:text-xl">
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
          <div className="order-1 w-full lg:sticky lg:top-6 lg:order-2">
            <Card className="cyber-card border-white/10 bg-slate-950/88 shadow-[0_24px_70px_rgba(2,8,23,0.45)] backdrop-blur-xl">
              <CardHeader className="space-y-1">
                <div className="mb-2 inline-flex w-fit self-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-200">
                  Secure sign-in
                </div>
                <CardTitle className="text-center text-2xl text-white">
                  {isRegisterMode ? 'Create Account' : 'Welcome back'}
                </CardTitle>
                <CardDescription className="text-center text-slate-400">
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
                    <Label htmlFor="username" className="text-slate-200">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter your username"
                      required
                      disabled={isLoading || registrationSuccess}
                      className="h-12 rounded-xl border-white/10 bg-slate-900/80 text-base text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200">Password</Label>
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
                        className="h-12 rounded-xl border-white/10 bg-slate-900/80 pr-12 text-base text-white placeholder:text-slate-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 px-3 py-2 text-slate-400 hover:bg-transparent hover:text-white"
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
                      <p className="text-sm text-slate-500">
                        Password must be at least 6 characters
                      </p>
                    )}
                  </div>

                  {/* Registration Fields */}
                  {isRegisterMode && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-200">Full Name (optional)</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          disabled={isLoading || registrationSuccess}
                          className="h-12 rounded-xl border-white/10 bg-slate-900/80 text-base text-white placeholder:text-slate-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                          disabled={isLoading || registrationSuccess}
                          className="h-12 rounded-xl border-white/10 bg-slate-900/80 text-base text-white placeholder:text-slate-500"
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
                    className="h-12 w-full rounded-xl text-base font-medium"
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
                  <div className="mt-4 rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-3">
                    <p className="text-center text-sm text-cyan-100">
                      <strong>Cross-Device Sync:</strong> Your account works on
                      any device with cloud backup via Supabase
                    </p>
                  </div>
                )}

                {/* App Stats */}
                <div className="border-t border-white/10 pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">
                        Cloud
                      </div>
                      <div className="text-xs text-slate-500">Sync</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">
                        ∞
                      </div>
                      <div className="text-xs text-slate-500">Devices</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">
                        Secure
                      </div>
                      <div className="text-xs text-slate-500">Backup</div>
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
