import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  Download,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Target,
  Trophy,
  Upload,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/modules/auth'
import { useJournalStore } from '@/modules/journal/store'
import { calculateStreak } from '@/modules/journal/utils/journalHelpers'
import { useNotesStore } from '@/modules/notes/store'
import { useWeightStore } from '@/modules/weight/store'
import { useSimpleTodoStore } from '@/modules/tasks/stores/SimpleTodoStore'
import {
  downloadDataAsFile,
  exportAllData,
  restoreDataFromFile,
} from '@/shared/utils/dataExport'
import { buildProgressionSnapshot } from '@/modules/progression'
import { Progress } from '@/shared/ui/progress'
import { DashboardSkeleton } from '@/shared/ui/skeleton'
import { isLocalOnlyMode } from '@/lib/supabase-client'
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
  const [isImporting, setIsImporting] = useState(false)
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
  const progression = useMemo(
    () =>
      buildProgressionSnapshot({
        todayIso,
        weights,
        todos,
        notes,
        entries,
      }),
    [entries, notes, todayIso, todos, weights]
  )

  const reloadDashboardData = useCallback(async () => {
    await Promise.all([loadTodos(), loadWeights(), loadNotes(), loadEntries()])
  }, [loadEntries, loadNotes, loadTodos, loadWeights])

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

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    const shouldImport = window.confirm(
      'Import this Perfect Zenkai backup into local storage? This merges records into this browser and may update matching existing records.'
    )

    if (!shouldImport) {
      return
    }

    try {
      setIsImporting(true)
      setExportMessage(null)
      const result = await restoreDataFromFile(file)
      await reloadDashboardData()
      setExportMessage(
        `Imported ${result.imported.weights + result.imported.tasks + result.imported.notes + result.imported.journalEntries} records.`
      )
    } catch (error) {
      setExportMessage(
        error instanceof Error ? error.message : 'Import failed. Check the backup file.'
      )
    } finally {
      setIsImporting(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitialLoading(true)
        await reloadDashboardData()
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
      <section className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,47,73,0.68)),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.96))] p-5 shadow-[0_30px_90px_-42px_rgba(34,211,238,0.58)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)] lg:items-start">
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  RPG command deck
                </p>
                <p className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                  Level {progression.player.level}
                </p>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                  {getGreeting()}, {user?.name || user?.username || 'operator'}.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Turn the day into a run: accept quests, clear blockers, capture
                  intel, and spend your attention where the reward is highest.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {formatLongDate(today)}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {isLocalOnlyMode ? 'Stored on this device' : 'Cloud sync active'}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {user?.role === 'admin' ? 'Admin role enabled' : 'Standard role'}
              </div>
              <div className="rounded-full border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-rose-100">
                Boss pressure: {progression.boss.label}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/assistant"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-300/20"
              >
                <Bot className="h-4 w-4" />
                Ask AI coach
              </Link>
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

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Player status
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  Level {progression.player.level}
                </p>
                <p className="mt-1 text-sm text-amber-100">{progression.player.title}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-100">
                <Trophy className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Next level</span>
                <span className="font-semibold text-cyan-200">
                  {progression.player.levelProgress}/{progression.player.nextLevelXp} XP
                </span>
              </div>
              <Progress
                value={progression.player.levelProgress}
                max={progression.player.nextLevelXp}
                variant="cyber"
                size="lg"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Quests done
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {progression.completedQuestCount}/{progression.quests.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Streak
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {journalStreak} day{journalStreak === 1 ? '' : 's'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Cleared today
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {completedToday.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Threat
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {progression.boss.score}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Attributes
                </p>
                <p className="text-xs text-slate-400">{progression.boss.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5 lg:grid-cols-2">
                {Object.entries(progression.player.attributes).map(([attribute, xp]) => (
                  <div
                    key={attribute}
                    className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2"
                  >
                    <p className="font-semibold capitalize text-slate-200">{attribute}</p>
                    <p className="mt-1 text-cyan-200">{xp} XP</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CommandCenterSection
        eyebrow="Reward loop"
        title="Daily quests create momentum"
        description="The dashboard now turns real local data into XP, quests, streaks, and reward feedback."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:gap-5">
          <CommandCenterPanel
            eyebrow="Quest board"
            title="Today&apos;s run"
            description="Each quest is tied to a concrete action in the app."
          >
            <div className="space-y-3">
              {progression.quests.map((quest) => (
                <Link
                  key={quest.id}
                  to={quest.to}
                  className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                    quest.complete
                      ? 'border-emerald-300/20 bg-emerald-300/10'
                      : 'border-white/10 bg-slate-950/65 hover:bg-white/5'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {quest.complete ? (
                        <Sparkles className="h-4 w-4 text-emerald-200" />
                      ) : (
                        <Target className="h-4 w-4 text-cyan-200" />
                      )}
                      <p className="font-semibold text-white">{quest.label}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{quest.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-cyan-100">
                    {quest.complete ? 'Claimed' : `+${quest.reward.xp} XP`}
                  </span>
                </Link>
              ))}
            </div>
          </CommandCenterPanel>

          <CommandCenterPanel
            eyebrow="Rewards"
            title="Recent drops"
            description="Feedback from completed actions stays visible so the loop feels alive."
          >
            <div className="space-y-3">
              {progression.rewardFeed.length > 0 ? (
                progression.rewardFeed.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Zap className="h-4 w-4 shrink-0 text-amber-100" />
                      <p className="truncate text-sm font-medium text-white">{item.label}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-amber-100">
                      {item.reward}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-5 text-sm text-slate-400">
                  No rewards claimed yet. Complete a quest to start the feed.
                </div>
              )}
            </div>
          </CommandCenterPanel>
        </div>
      </CommandCenterSection>

      <CommandCenterSection
        eyebrow="Primary modules"
        title="Every working pillar follows one pattern"
        description="Each card reads live local state so you can see the day without opening every workspace."
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
        description="Use these cards to choose the next action. Keep detailed editing inside each module."
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
                          {todo.category} - {todo.priority} priority
                          {todo.dueDate ? ` - due ${todo.dueDate}` : ''}
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
        title="Keep your local data recoverable"
        description="This phone-friendly mode stores data locally. Export regularly if you want a backup outside this browser."
        action={
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
            />
            <button
              type="button"
              onClick={handleImportClick}
              disabled={isImporting}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] xl:gap-5">
          <CommandCenterTile
            icon={ShieldCheck}
            eyebrow="Workspace state"
            title="Local storage is the source of truth"
            description="No database is required. Your account and records stay in this browser until you clear site data."
            value={`${totalRecords} records`}
            meta={exportMessage || 'Export creates a local snapshot. Import merges a backup into this browser.'}
            statusLabel={user?.role === 'admin' ? 'Admin ready' : 'User session'}
            tone="slate"
            to="/system/modules"
            ctaLabel="Inspect modules"
            stats={[
              {
                label: 'Auth provider',
                value: isLocalOnlyMode ? 'Local' : user?.authProvider === 'local' ? 'Local' : 'Supabase',
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
            footer="Local data can be backed up any time."
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
