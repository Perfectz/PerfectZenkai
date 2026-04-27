import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  Check,
  KeyRound,
  Loader2,
  MessageCircle,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { exportAllData, getDataSummary } from '@/shared/utils/dataExport'
import {
  clearOpenAIAssistantSettings,
  getOpenAIAssistantSettings,
  runPersonalAssistantAnalysis,
  saveOpenAIAssistantSettings,
  type AssistantMessage,
} from '../services/OpenAIAssistantService'

const starterPrompts = [
  'Analyze my entire system and give me the top 3 quests for today.',
  'Find the biggest bottleneck across my tasks, health, notes, and journal.',
  'Build a weekly plan from my current data and unfinished work.',
]

export function ChatPage() {
  const navigate = useNavigate()
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-5.5')
  const [question, setQuestion] = useState(starterPrompts[0])
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastSummary, setLastSummary] = useState<ReturnType<typeof getDataSummary> | null>(null)

  const hasKey = apiKey.trim().length > 0
  const maskedKey = useMemo(() => {
    if (!hasKey) {
      return 'No key saved'
    }

    return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`
  }, [apiKey, hasKey])

  useEffect(() => {
    const settings = getOpenAIAssistantSettings()
    setApiKey(settings.apiKey)
    setModel(settings.model)
  }, [])

  const handleSaveSettings = () => {
    setIsSaving(true)
    setError(null)
    saveOpenAIAssistantSettings({ apiKey: apiKey.trim(), model: model.trim() || 'gpt-5.5' })
    setStatus('Assistant key saved on this device.')
    setTimeout(() => setIsSaving(false), 250)
  }

  const handleClearSettings = () => {
    clearOpenAIAssistantSettings()
    setApiKey('')
    setStatus('Assistant key cleared from this browser.')
  }

  const handleRunAnalysis = async (prompt = question) => {
    if (!prompt.trim()) {
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setStatus('Building local data snapshot...')

    const userMessage: AssistantMessage = {
      role: 'user',
      content: prompt.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages((current) => [...current, userMessage])

    try {
      const data = await exportAllData()
      setLastSummary(getDataSummary(data))
      setStatus('Sending snapshot to OpenAI for analysis...')

      const response = await runPersonalAssistantAnalysis({
        settings: { apiKey, model },
        data,
        question: prompt.trim(),
        history: messages,
      })

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        },
      ])
      setStatus('Analysis complete.')
    } catch (analysisError) {
      const message =
        analysisError instanceof Error ? analysisError.message : 'Assistant analysis failed.'
      setError(message)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `Analysis failed: ${message}`,
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#020617,#07111f_48%,#020617)] text-white">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-slate-300" />
            </button>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold">AI Command Companion</h1>
                <p className="truncate text-xs text-slate-400">
                  Local data snapshot + OpenAI analysis
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200 sm:flex">
            <KeyRound className="h-4 w-4" />
            {maskedKey}
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
        <section className="space-y-5">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/75 p-5 shadow-[0_24px_70px_rgba(2,8,23,0.4)]">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Private key mode</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Your key is stored in this browser only. When you run analysis, your
                  local app snapshot and prompt are sent directly to OpenAI.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  OpenAI API/PAT key
                </span>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="sk-..."
                  className="border-white/10 bg-slate-950/70 text-white"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Model
                </span>
                <Input
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="gpt-5.5"
                  className="border-white/10 bg-slate-950/70 text-white"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="gap-2 bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                >
                  {isSaving ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  Save
                </Button>
                <Button
                  type="button"
                  onClick={handleClearSettings}
                  variant="outline"
                  className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-cyan-300/20 bg-cyan-300/[0.07] p-5">
            <div className="flex items-center gap-2 text-cyan-200">
              <BrainCircuit className="h-5 w-5" />
              <h2 className="font-semibold">Analysis scope</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                ['Records', lastSummary?.totalRecords ?? 'Ready'],
                ['Tasks', lastSummary?.totalTasks ?? '-'],
                ['Notes', lastSummary?.totalNotes ?? '-'],
                ['Journal', lastSummary?.totalJournalEntries ?? '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100dvh-7rem)] flex-col rounded-[1.75rem] border border-white/10 bg-slate-900/75 shadow-[0_24px_70px_rgba(2,8,23,0.4)]">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  Companion terminal
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Ask it to read the whole save file</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  The assistant receives a compacted snapshot of your local data, then returns
                  practical quests, risks, patterns, and next actions.
                </p>
              </div>
              <Sparkles className="hidden h-6 w-6 text-amber-200 sm:block" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setQuestion(prompt)
                    void handleRunAnalysis(prompt)
                  }}
                  disabled={isAnalyzing || !hasKey}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 ? (
              <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/45 p-6 text-center">
                <MessageCircle className="mb-4 h-10 w-10 text-cyan-200" />
                <h3 className="text-lg font-semibold">No run yet</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Save your key, choose a starter prompt, or write your own mission.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.timestamp}-${index}`}
                  className={`rounded-[1.25rem] border p-4 ${
                    message.role === 'user'
                      ? 'border-cyan-300/20 bg-cyan-300/10'
                      : 'border-emerald-300/20 bg-emerald-300/[0.08]'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {message.role === 'user' ? 'Mission' : 'Assistant analysis'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-6 text-slate-100">
                    {message.content}
                  </div>
                </div>
              ))
            )}

            {isAnalyzing ? (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
                <Loader2 className="h-4 w-4 animate-spin" />
                {status || 'Running analysis...'}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
                {error}
              </div>
            ) : status ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
                {status}
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="grid gap-3">
              <Textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask for analysis, a plan, or the next quest..."
                className="min-h-[6rem] resize-none border-white/10 bg-slate-950/70 text-white"
              />
              <Button
                type="button"
                onClick={() => void handleRunAnalysis()}
                disabled={isAnalyzing || !hasKey || !question.trim()}
                className="gap-2 bg-emerald-300 text-slate-950 hover:bg-emerald-200"
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Run full analysis
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
