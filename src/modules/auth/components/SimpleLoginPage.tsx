import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  FileText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { localAuthService } from '../services/localAuth'
import { isLocalOnlyMode } from '@/lib/supabase-client'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const featureTiles = [
  {
    icon: Activity,
    label: 'Health',
    text: 'Track weight, meals, workouts, and daily momentum.',
  },
  {
    icon: FileText,
    label: 'Focus',
    text: 'Manage tasks, notes, and journal check-ins offline.',
  },
  {
    icon: Smartphone,
    label: 'Phone ready',
    text: 'Install it as a PWA and keep your data on this device.',
  },
]

export default function SimpleLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, isLoading, error, clearError, isAuthenticated } =
    useAuthStore()
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const bootstrapAdmin = useMemo(
    () => localAuthService.getBootstrapAdminCredentials(),
    []
  )

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

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTarget, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTarget])

  useEffect(() => {
    clearError()
    setRegistrationSuccess(false)
  }, [clearError, isRegisterMode])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    clearError()
    setRegistrationSuccess(false)

    if (!formData.username.trim() || !formData.password.trim()) {
      return
    }

    if (isRegisterMode) {
      await register({
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim() || undefined,
        name: formData.name.trim() || undefined,
      })

      if (!useAuthStore.getState().error) {
        setRegistrationSuccess(true)
        setFormData({ username: '', password: '', email: '', name: '' })
        window.setTimeout(() => {
          setIsRegisterMode(false)
          setRegistrationSuccess(false)
        }, 1200)
      }
      return
    }

    await login({
      username: formData.username.trim(),
      password: formData.password,
    })
  }

  const toggleMode = () => {
    setIsRegisterMode((current) => !current)
    setFormData({ username: '', password: '', email: '', name: '' })
    setRegistrationSuccess(false)
    clearError()
  }

  const fillBootstrapAdmin = () => {
    setIsRegisterMode(false)
    setFormData({
      username: bootstrapAdmin.username,
      password: bootstrapAdmin.password,
      email: '',
      name: '',
    })
  }

  return (
    <main className="min-h-[100dvh] bg-[linear-gradient(180deg,#07111f_0%,#0f172a_48%,#111827_100%)] text-white">
      <div className="mx-auto grid min-h-[100dvh] w-full max-w-6xl gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:py-10">
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-300 text-slate-950 shadow-[0_16px_40px_rgba(52,211,153,0.24)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
                Perfect Zenkai
              </p>
              <p className="text-sm text-slate-400">Local-first personal command center</p>
            </div>
          </div>

          <div className="max-w-3xl space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-white sm:text-6xl">
              Your daily system, ready on your phone.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Track health, tasks, notes, and reflection without setting up a
              database. Your account and app data are stored locally in this
              browser so the PWA works on mobile.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {featureTiles.map((tile) => (
              <div
                key={tile.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.9)]"
              >
                <tile.icon className="h-5 w-5 text-emerald-200" />
                <h2 className="mt-4 text-base font-semibold tracking-normal text-white">
                  {tile.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{tile.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2">
              <ShieldCheck className="h-4 w-4 text-emerald-200" />
              {isLocalOnlyMode ? 'Local-only mode' : 'Cloud sync enabled'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <LockKeyhole className="h-4 w-4 text-slate-300" />
              No backend required
            </span>
          </div>
        </section>

        <Card className="border-white/10 bg-slate-950/82 shadow-[0_26px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                {isRegisterMode ? (
                  <UserPlus className="h-5 w-5 text-emerald-200" />
                ) : (
                  <LockKeyhole className="h-5 w-5 text-emerald-200" />
                )}
              </div>
              <h2 className="text-2xl font-semibold tracking-normal text-white">
                {isRegisterMode ? 'Create local account' : 'Open your workspace'}
              </h2>
              <p className="text-sm leading-6 text-slate-400">
                {isRegisterMode
                  ? 'This account is saved on this device.'
                  : 'Sign in with a local account stored in this browser.'}
              </p>
            </div>

            {registrationSuccess ? (
              <Alert className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Account created. Sign in to continue.</AlertDescription>
              </Alert>
            ) : null}

            {error && !registrationSuccess ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode ? (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Optional display name"
                    disabled={isLoading || registrationSuccess}
                    className="h-12 rounded-xl border-white/10 bg-slate-900/80 text-base text-white placeholder:text-slate-500"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-200">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="username"
                  required
                  disabled={isLoading || registrationSuccess}
                  className="h-12 rounded-xl border-white/10 bg-slate-900/80 text-base text-white placeholder:text-slate-500"
                />
              </div>

              {isRegisterMode ? (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    disabled={isLoading || registrationSuccess}
                    className="h-12 rounded-xl border-white/10 bg-slate-900/80 text-base text-white placeholder:text-slate-500"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={isRegisterMode ? 'At least 6 characters' : 'password'}
                    required
                    minLength={isRegisterMode ? 6 : undefined}
                    disabled={isLoading || registrationSuccess}
                    className="h-12 rounded-xl border-white/10 bg-slate-900/80 pr-12 text-base text-white placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 px-3 text-slate-400 hover:bg-transparent hover:text-white"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={isLoading || registrationSuccess}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  isLoading ||
                  registrationSuccess ||
                  !formData.username.trim() ||
                  !formData.password.trim()
                }
                className="h-12 w-full rounded-xl bg-emerald-300 text-base font-semibold text-slate-950 hover:bg-emerald-200"
              >
                {isRegisterMode ? 'Create account' : 'Sign in'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="grid gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={toggleMode}
                disabled={isLoading || registrationSuccess}
                className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
              >
                {isRegisterMode ? 'Use existing account' : 'Create a local account'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={fillBootstrapAdmin}
                disabled={isLoading}
                className="h-11 rounded-xl text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                Use admin preview
              </Button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-400">
              Admin preview: <span className="font-medium text-slate-200">{bootstrapAdmin.username}</span>
              {' / '}
              <span className="font-medium text-slate-200">{bootstrapAdmin.password}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
