import { useEffect, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'
import { useJournalStore, useJournalFormState, useJournalLoading, useJournalError } from '../store'
import { getCurrentDateString, formatJournalDate } from '../utils/journalHelpers'
import { MorningEntry, EveningEntry } from '../types'
import MorningStandup from '../components/MorningStandup'
import EveningReflection from '../components/EveningReflection'

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

  const formState = useJournalFormState()
  const isLoading = useJournalLoading()
  const error = useJournalError()

  const [isInitialized, setIsInitialized] = useState(false)

  // Load entries on mount
  useEffect(() => {
    const initializeJournal = async () => {
      await loadEntries()
      setIsInitialized(true)
    }
    initializeJournal()
  }, [loadEntries])

  // Get current entry for selected date
  const currentEntry = getEntryByDate(formState.selectedDate)

  // Date navigation
  const handlePreviousDay = () => {
    const prevDate = format(subDays(new Date(formState.selectedDate), 1), 'yyyy-MM-dd')
    setSelectedDate(prevDate)
  }

  const handleNextDay = () => {
    const nextDate = format(addDays(new Date(formState.selectedDate), 1), 'yyyy-MM-dd')
    setSelectedDate(nextDate)
  }

  const handleToday = () => {
    setSelectedDate(getCurrentDateString())
  }

  // Check if selected date is today
  const isToday = formState.selectedDate === getCurrentDateString()
  const isFuture = new Date(formState.selectedDate) > new Date()

  // Handle saving entries
  const handleSaveMorning = async (morningEntry: MorningEntry) => {
    await createOrUpdateMorningEntry(formState.selectedDate, morningEntry)
  }

  const handleSaveEvening = async (eveningEntry: EveningEntry) => {
    await createOrUpdateEveningEntry(formState.selectedDate, eveningEntry)
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading journal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Daily Journal</h1>
            <p className="text-sm text-gray-400">Reflect, plan, and grow every day</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-red-400">{error}</span>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Date Navigation */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousDay}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Calendar className="h-4 w-4 text-green-500" />
                  {formatJournalDate(formState.selectedDate)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {format(new Date(formState.selectedDate), 'EEEE')}
                </div>
              </div>

              {!isToday && (
                <button
                  onClick={handleToday}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                >
                  Today
                </button>
              )}
            </div>

            <button
              onClick={handleNextDay}
              disabled={isFuture}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Entry Status */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Entry Status for {formatJournalDate(formState.selectedDate)}
            </div>
            <div className="flex gap-2">
              <div className={`px-2 py-1 rounded-full text-xs ${
                currentEntry?.morningEntry 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-600/20 text-gray-500'
              }`}>
                Morning {currentEntry?.morningEntry ? '✓' : '○'}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                currentEntry?.eveningEntry 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-gray-600/20 text-gray-500'
              }`}>
                Evening {currentEntry?.eveningEntry ? '✓' : '○'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('morning')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              formState.activeTab === 'morning'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🌅 Morning Standup
          </button>
          <button
            onClick={() => setActiveTab('evening')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              formState.activeTab === 'evening'
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🌙 Evening Reflection
          </button>
        </div>

        {/* Future Date Warning */}
        {isFuture && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm">
              📅 You're viewing a future date. Journal entries are typically made for today or past dates.
            </p>
          </div>
        )}

        {/* Journal Content */}
        <div className="bg-gray-800 rounded-lg p-6">
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

        {/* Quick Stats */}
        {currentEntry && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Entry Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {currentEntry.morningEntry && (
                <>
                  <div>
                    <div className="text-lg font-bold text-yellow-400">
                      {currentEntry.morningEntry.mood}/5
                    </div>
                    <div className="text-xs text-gray-400">Morning Mood</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-400">
                      {currentEntry.morningEntry.energy}/5
                    </div>
                    <div className="text-xs text-gray-400">Energy Level</div>
                  </div>
                </>
              )}
              {currentEntry.eveningEntry && (
                <>
                  <div>
                    <div className="text-lg font-bold text-green-400">
                      {currentEntry.eveningEntry.productivity}/5
                    </div>
                    <div className="text-xs text-gray-400">Productivity</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-400">
                      {currentEntry.eveningEntry.satisfaction}/5
                    </div>
                    <div className="text-xs text-gray-400">Satisfaction</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 