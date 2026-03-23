
import { MessageCircle, ArrowLeft, AlertTriangle, BookOpen, BarChart3, CheckSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export function ChatPage() {
  const navigate = useNavigate()
  const [showSecurityNotice] = useState(true)
  
  // Use the showSecurityNotice variable to avoid unused variable error
  console.debug('Security notice state:', String(showSecurityNotice))

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/90 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 transition-colors hover:bg-white/5"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-cyan-400" />
            <h1 className="text-lg font-semibold text-white">
              Assistant Preview
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.45)] backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <AlertTriangle className="h-8 w-8 text-amber-300" />
            </div>

            <h2 className="mb-3 text-xl font-semibold text-white">
              Assistant workflow is not production-ready yet
            </h2>

            <p className="mb-6 text-slate-300">
              This legacy AI workflow depends on unfinished service code and client-side secrets. It has been
              isolated so the rest of the app can stay stable and trustworthy.
            </p>

            <div className="mb-6 grid gap-3 text-left sm:grid-cols-3">
              <button
                onClick={() => navigate('/health')}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition-colors hover:bg-white/5"
              >
                <BarChart3 className="mb-3 h-5 w-5 text-cyan-300" />
                <div className="font-medium text-white">Health Hub</div>
                <div className="mt-1 text-sm text-slate-400">Log weight, meals, and workouts.</div>
              </button>
              <button
                onClick={() => navigate('/todo')}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition-colors hover:bg-white/5"
              >
                <CheckSquare className="mb-3 h-5 w-5 text-ki-green" />
                <div className="font-medium text-white">Task Queue</div>
                <div className="mt-1 text-sm text-slate-400">Capture priorities and recurring tasks.</div>
              </button>
              <button
                onClick={() => navigate('/journal')}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition-colors hover:bg-white/5"
              >
                <BookOpen className="mb-3 h-5 w-5 text-amber-300" />
                <div className="font-medium text-white">Journal</div>
                <div className="mt-1 text-sm text-slate-400">Use the real morning and evening check-ins.</div>
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Keep using the core app surfaces. Re-enable assistant features only after the server-side AI flow is rebuilt.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 