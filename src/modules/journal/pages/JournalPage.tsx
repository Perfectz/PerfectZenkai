import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Moon,
  Sparkles,
  Sun,
  Target,
} from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'
import {
  useJournalEntries,
  useJournalError,
  useJournalFormState,
  useJournalLoading,
  useJournalStore,
} from '../store'
import {
  calculateStreak,
  formatJournalDate,
  getCurrentDateString,
} from '../utils/journalHelpers'
import { MorningEntry, EveningEntry } from '../types'
import MorningStandup from '../components/MorningStandup'
import EveningReflection from '../components/EveningReflection'

const formatWeekday = (date: string) => format(new Date(date), 'EEEE')

export default function JournalPage() {
  const {
    loadEntries,
    getEntryByDate,
    createOrUpdateMorningEntry,
    createOrUpdateEveningEntry,
    setSelectedDate,
    setActiveTab,
    clearError,
  } = useJournalStore()
  const entries = useJournalEntries()
  const formState = useJournalFormState()
  const isLoading = useJournalLoading()
  const error = useJournalError()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeJournal = async () => {
      await loadEntries()
      setIsInitialized(true)
    }

    void initializeJournal()
  }, [loadEntries])

  const currentEntry = getEntryByDate(formState.selectedDate)
  const today = getCurrentDateString()
  const isToday = formState.selectedDate === today
  const isFuture = formState.selectedDate > today
  const canGoNext = formState.selectedDate < today
  const morningComplete = Boolean(currentEntry?.morningEntry)
  const eveningComplete = Boolean(currentEntry?.eveningEntry)
  const dayCompletion = morningComplete && eveningComplete ? 100 : morningComplete || eveningComplete ? 50 : 0
  const streak = useMemo(() => calculateStreak(entries).current, [entries])
  const recentEntries = useMemo(() => entries.slice(0, 7), [entries])
  const completedRecentEntries = recentEntries.filter(
    (entry) => entry.morningEntry || entry.eveningEntry
  ).length

  const handlePreviousDay = () => {
    setSelectedDate(format(subDays(new Date(formState.selectedDate), 1), 'yyyy-MM-dd'))
  }

  const handleNextDay = () => {
    if (!canGoNext) {
      return
    }

    setSelectedDate(format(addDays(new Date(formState.selectedDate), 1), 'yyyy-MM-dd'))
  }

  const handleToday = () => {
    setSelectedDate(today)
  }

  const handleSaveMorning = async (morningEntry: MorningEntry) => {
    await createOrUpdateMorningEntry(formState.selectedDate, morningEntry)
  }

  const handleSaveEvening = async (eveningEntry: EveningEntry) => {
    await createOrUpdateEveningEntry(formState.selectedDate, eveningEntry)
  }

  if (!isInitialized) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading journal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-32 pt-2">
      <section className="overflow-hidden rounded-3xl border border-violet-300/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(76,29,149,0.52)),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-5 shadow-[0_30px_90px_-46px_rgba(167,139,250,0.65)] sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.75fr)] lg:items-end">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                <BookOpen className="h-3.5 w-3.5" />
                Journal quest log
              </span>
              <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-100">
                {isToday ? 'Today' : formatJournalDate(formState.selectedDate)}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                Plan the run. Close the loop.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Morning sets the mission. Evening converts the day into XP,
                lessons, and tomorrow&apos;s next move.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Day loop', value: `${dayCompletion}%`, icon: Target },
                { label: 'Streak', value: `${streak}d`, icon: Sparkles },
                { label: 'Last 7', value: `${completedRecentEntries}/7`, icon: CheckCircle2 },
                { label: 'Entries', value: `${entries.length}`, icon: BookOpen },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-slate-950/55 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      {stat.label}
                    </p>
                    <stat.icon className="h-4 w-4 text-cyan-200" />
                  </div>
                  <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-4">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePreviousDay}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Previous day"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-base font-semibold text-white">
                  <Calendar className="h-4 w-4 text-cyan-200" />
                  {formatJournalDate(formState.selectedDate)}
                </div>
                <p className="mt-1 text-sm text-slate-400">{formatWeekday(formState.selectedDate)}</p>
              </div>

              <button
                type="button"
                onClick={handleNextDay}
                disabled={!canGoNext}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next day"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {!isToday ? (
              <button
                type="button"
                onClick={handleToday}
                className="w-full rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/15"
              >
                Return to today
              </button>
            ) : (
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-center text-sm font-semibold text-emerald-100">
                Current day selected
              </div>
            )}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-rose-100">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-sm font-semibold text-rose-100 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {isFuture ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          You are viewing a future date. Journal entries are designed for today or previous days.
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              Loop status
            </p>
            <div className="mt-4 space-y-3">
              {[
                {
                  id: 'morning',
                  label: 'Morning',
                  complete: morningComplete,
                  icon: Sun,
                  tone: 'text-amber-100',
                },
                {
                  id: 'evening',
                  label: 'Evening',
                  complete: eveningComplete,
                  icon: Moon,
                  tone: 'text-violet-100',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as 'morning' | 'evening')}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    formState.activeTab === item.id
                      ? 'border-cyan-300/30 bg-cyan-300/10'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 ${item.tone}`} />
                    <span className="text-sm font-semibold text-white">{item.label}</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] ${
                      item.complete
                        ? 'bg-emerald-300/15 text-emerald-100'
                        : 'bg-slate-700/70 text-slate-400'
                    }`}
                  >
                    {item.complete ? 'Done' : 'Open'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Current mission
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {formState.activeTab === 'morning'
                ? 'Choose a few outcomes and blockers before opening the task queue.'
                : 'Capture wins and lessons before they disappear from memory.'}
            </p>
          </div>
        </aside>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-4 shadow-[0_24px_70px_rgba(2,8,23,0.4)] sm:p-6">
          {formState.activeTab === 'morning' ? (
            <MorningStandup
              entry={currentEntry?.morningEntry}
              onSave={handleSaveMorning}
              isLoading={isLoading}
            />
          ) : (
            <EveningReflection
              entry={currentEntry?.eveningEntry}
              onSave={handleSaveEvening}
              isLoading={isLoading}
            />
          )}
        </div>
      </section>
    </div>
  )
}
