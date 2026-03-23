import { useEffect, useMemo, useState } from 'react'
import { Download, ShieldCheck, StickyNote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/modules/auth'
import { useJournalStore } from '@/modules/journal/store'
import { calculateStreak } from '@/modules/journal/utils/journalHelpers'
import { useNotesStore } from '@/modules/notes/store'
import { useWeightStore } from '@/modules/weight/store'
import { useSimpleTodoStore } from '@/modules/tasks/stores/SimpleTodoStore'
import { downloadDataAsFile, exportAllData } from '@/shared/utils/dataExport'
import { DashboardSkeleton } from '@/shared/ui/skeleton'
import {
  CommandCenterPanel,
  CommandCenterSection,
  CommandCenterTile,
} from '../components/CommandCenterPrimitives'
import {
  buildHeroQuickActions,
  type DashboardContext,
  getRecentCaptureNotes,
  getPrimaryDashboardCards,
  getRegisteredAgentCapabilities,
  getTacticalDashboardCards,
  getTopFocusTodos,
} from '../schema'

const getGreeting = () => {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

const formatLongDate = (value: Date) =>
  value.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { loadWeights, weights, isLoading: weightLoading } = useWeightStore()
  const { loadTodos, todos, isLoading: todoLoading } = useSimpleTodoStore()
  const { loadNotes, notes, isLoading: notesLoading } = useNotesStore()
  const { loadEntries, entries, isLoading: journalLoading } = useJournalStore()

  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState<string | null>(null)

  const today = useMemo(() => new Date(), [])
  const todayIso = today.toISOString().split('T')[0]

  const todayEntry = useMemo(
    () => entries.find((entry) => entry.entryDate === todayIso) ?? null,
    [entries, todayIso]
  )
  const todayWeight = useMemo(
    () => weights.find((entry) => entry.dateISO === todayIso) ?? null,
    [weights, todayIso]
  )

  const latestWeight = weights[0] ?? null
  const latestNote = notes[0] ?? null
  const openTodos = useMemo(() => todos.filter((todo) => !todo.done), [todos])
  const overdueTodos = useMemo(
    () => openTodos.filter((todo) => todo.dueDate && todo.dueDate < todayIso),
    [openTodos, todayIso]
  )
  const highPriorityTodos = useMemo(
    () => openTodos.filter((todo) => todo.priority === 'high'),
    [openTodos]
  )
  const completedToday = useMemo(
    () => todos.filter((todo) => todo.completedAt && todo.completedAt.startsWith(todayIso)),
    [todos, todayIso]
  )
  const recentEntries = entries.slice(0, 7)
  const morningComplete = Boolean(todayEntry?.morningEntry)
  const eveningComplete = Boolean(todayEntry?.eveningEntry)
  const latestJournalDate = entries[0]?.entryDate
  const journalStreak = useMemo(() => calculateStreak(entries).current, [entries])
  const topFocusTodos = useMemo(() => getTopFocusTodos(openTodos), [openTodos])
  const recentCaptureNotes = useMemo(() => getRecentCaptureNotes(notes), [notes])
  const heroQuickActions = useMemo(() => buildHeroQuickActions(), [])
  const registeredAgentCapabilities = useMemo(() => getRegisteredAgentCapabilities(), [])

  const dashboardContext = useMemo<DashboardContext>(
    () => ({
      todayWeight,
      latestWeight,
      weights,
      openTodos,
      overdueTodos,
      highPriorityTodos,
      completedToday,
      notes,
      latestNote,
      recentEntries,
      morningComplete,
      eveningComplete,
      latestJournalDate,
      journalStreak,
    }),
    [
      completedToday,
      eveningComplete,
      highPriorityTodos,
      journalStreak,
      latestJournalDate,
      latestNote,
      latestWeight,
      morningComplete,
      notes,
      openTodos,
      overdueTodos,
      recentEntries,
      todayWeight,
      weights,
    ]
  )

  const moduleCards = useMemo(() => getPrimaryDashboardCards(dashboardContext), [dashboardContext])

  const tacticalCards = useMemo(() => getTacticalDashboardCards(dashboardContext), [dashboardContext])

  const totalRecords = weights.length + todos.length + notes.length + entries.length

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setExportMessage(null)
      const exportData = await exportAllData()
      downloadDataAsFile(exportData)
      setExportMessage(`Exported ${exportData.exportMetadata.totalRecords} records.`)
    } catch (error) {
      setExportMessage(
        error instanceof Error ? error.message : 'Export failed. Try again.'
      )
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitialLoading(true)
        await Promise.all([loadTodos(), loadWeights(), loadNotes(), loadEntries()])
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    void loadData()
  }, [loadEntries, loadNotes, loadTodos, loadWeights])

  if (
    isInitialLoading ||
    weightLoading ||
    todoLoading ||
    notesLoading ||
    journalLoading
  ) {
    return (
      <div className="app-page pb-6 pt-2">
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="app-page space-y-8 pb-8 pt-2 sm:space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-5 shadow-[0_30px_80px_-44px_rgba(14,165,233,0.55)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)] lg:items-start">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                Daily command center
              </p>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  {getGreeting()}, {user?.name || user?.username || 'operator'}.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  One home page now owns the daily loop: check-in, execute, capture,
                  and review. New modules plug in through a shared registry so future
                  AI-added views can extend the shell without hand-editing the page.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {formatLongDate(today)}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {user?.authProvider === 'local'
                  ? 'Revival mode active'
                  : 'Supabase session active'}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {user?.role === 'admin' ? 'Admin role enabled' : 'Standard role'}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {heroQuickActions.map((action) => (
                <Link
                  key={action.id}
                  to={action.to}
                  className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    action.id === 'journal'
                      ? 'border border-cyan-300/30 bg-cyan-300/15 text-white hover:bg-cyan-300/20'
                      : 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10'
                  }`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              {
                label: 'Morning check-in',
                value: morningComplete ? 'Complete' : 'Open',
                tone: morningComplete ? 'text-emerald-300' : 'text-amber-300',
              },
              {
                label: 'Evening reflection',
                value: eveningComplete ? 'Complete' : 'Open',
                tone: eveningComplete ? 'text-emerald-300' : 'text-slate-200',
              },
              {
                label: 'Weight log',
                value: todayWeight ? 'Captured' : 'Missing',
                tone: todayWeight ? 'text-emerald-300' : 'text-amber-300',
              },
              {
                label: 'Journal streak',
                value: `${journalStreak} day${journalStreak === 1 ? '' : 's'}`,
                tone: journalStreak > 0 ? 'text-cyan-300' : 'text-slate-300',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </p>
                <p className={`mt-2 text-xl font-semibold ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CommandCenterSection
        eyebrow="Primary modules"
        title="Every working pillar follows one pattern"
        description="The command center reads module definitions from a registry, then renders cards from live state. That is the contract future AI-added modules should extend."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
          {moduleCards.map((card) => (
            <CommandCenterTile key={card.id} {...card} />
          ))}
        </div>
      </CommandCenterSection>

      <CommandCenterSection
        eyebrow="Tactical layer"
        title="Use the dashboard to decide, not to do everything"
        description="The registry also supports tactical prompts, so the home page can route attention without growing into another overloaded workspace."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-5">
          {tacticalCards.map((card) => (
            <CommandCenterTile key={card.id} {...card} />
          ))}
        </div>
      </CommandCenterSection>

      <CommandCenterSection
        eyebrow="Live queues"
        title="See the next few items without opening a full workspace"
        description="These panels stay intentionally short. They expose enough signal to decide where to go next, while keeping the real editing work inside each module."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
          <CommandCenterPanel
            eyebrow="Top focus"
            title="Current task shortlist"
            description="Priority, due pressure, and recent updates determine what floats to the top."
            action={
              <Link
                to="/todo"
                className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Open todo
              </Link>
            }
          >
            <div className="space-y-3">
              {topFocusTodos.length > 0 ? (
                topFocusTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {todo.summary}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {todo.category} · {todo.priority} priority
                          {todo.dueDate ? ` · due ${todo.dueDate}` : ''}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
                        {todo.points ? `${todo.points} pts` : 'Task'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 px-4 py-5 text-sm text-slate-400">
                  No open tasks. The queue is clear.
                </div>
              )}
            </div>
          </CommandCenterPanel>

          <CommandCenterPanel
            eyebrow="Capture stream"
            title="Recent notes and journal momentum"
            description="The home page should show whether capture is flowing and whether reflection is staying consistent."
            action={
              <Link
                to="/notes"
                className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Open notes
              </Link>
            }
          >
            <div className="mb-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">
                Journal momentum
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {journalStreak} day{journalStreak === 1 ? '' : 's'}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {latestJournalDate
                  ? `Latest entry on ${new Date(latestJournalDate).toLocaleDateString()}`
                  : 'No journal entries yet.'}
              </p>
            </div>

            <div className="space-y-3">
              {recentCaptureNotes.length > 0 ? (
                recentCaptureNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3"
                  >
                    <p className="truncate text-sm font-semibold text-white">
                      {note.title || 'Untitled note'}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                      {note.content || 'No body content yet.'}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                      Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 px-4 py-5 text-sm text-slate-400">
                  No recent notes yet. Use notes for fast capture before deciding whether something belongs in tasks or journal.
                </div>
              )}
            </div>
          </CommandCenterPanel>
        </div>
      </CommandCenterSection>

      <CommandCenterSection
        eyebrow="System"
        title="Keep the foundation recoverable"
        description="This project now treats recovery, backup, and role visibility as part of the product surface, not as hidden maintenance work."
        action={
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export data'}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] xl:gap-5">
          <CommandCenterTile
            icon={ShieldCheck}
            eyebrow="Workspace state"
            title="Local-first recovery stays visible"
            description="Auth mode, role state, and export readiness are surfaced here so the app remains understandable while Supabase wiring is still being revived."
            value={`${totalRecords} records`}
            meta={exportMessage || 'Export creates a complete local snapshot for recovery and AI analysis.'}
            statusLabel={user?.role === 'admin' ? 'Admin ready' : 'User session'}
            tone="slate"
            to="/system/modules"
            ctaLabel="Inspect modules"
            stats={[
              {
                label: 'Auth provider',
                value: user?.authProvider === 'local' ? 'Local' : 'Supabase',
              },
              {
                label: 'Role',
                value: user?.role === 'admin' ? 'Admin' : 'User',
              },
              {
                label: 'Agent skills',
                value: `${registeredAgentCapabilities.length}`,
              },
            ]}
            footer="System surfaces should explain state instead of hiding it."
          />

          <CommandCenterTile
            icon={StickyNote}
            eyebrow="Recent capture"
            title={latestNote?.title || 'No recent note yet'}
            description={
              latestNote?.content
                ? latestNote.content.slice(0, 140)
                : 'The notes module is ready for quick capture when ideas arrive faster than planning can keep up.'
            }
            value={latestNote ? `Updated ${new Date(latestNote.updatedAt).toLocaleDateString()}` : 'Capture queue empty'}
            meta={
              latestJournalDate
                ? `Journal last touched on ${new Date(latestJournalDate).toLocaleDateString()}`
                : 'Journal has not been used yet.'
            }
            statusLabel={latestNote ? 'Recent activity' : 'Ready'}
            tone="sky"
            to="/notes"
            stats={[
              { label: 'Notes', value: `${notes.length}` },
              { label: 'Journal entries', value: `${entries.length}` },
            ]}
            footer="Capture first, organize second."
          />
        </div>
      </CommandCenterSection>
    </div>
  )
}