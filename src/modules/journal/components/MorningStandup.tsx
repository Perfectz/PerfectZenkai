import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Brain,
  Coffee,
  Lightbulb,
  Moon,
  Save,
  Sun,
  Zap,
} from 'lucide-react'
import { MorningEntry } from '../types'
import { createDefaultMorningEntry, validateMorningEntry } from '../utils/journalHelpers'
import MoodEnergySelector from './MoodEnergySelector'
import PriorityList from './PriorityList'
import TimeBlockPlanner from './TimeBlockPlanner'

interface MorningStandupProps {
  entry?: MorningEntry
  onSave: (entry: MorningEntry) => Promise<void>
  isLoading?: boolean
}

const fieldClass =
  'min-h-[6rem] w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none'

export default function MorningStandup({ entry, onSave, isLoading = false }: MorningStandupProps) {
  const [formData, setFormData] = useState<MorningEntry>(entry || createDefaultMorningEntry())
  const [errors, setErrors] = useState<string[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (entry) {
      setFormData(entry)
      setHasUnsavedChanges(false)
    }
  }, [entry])

  const handleFieldChange = (field: keyof MorningEntry, value: MorningEntry[keyof MorningEntry]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)

    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleArrayFieldChange = (field: keyof MorningEntry, value: string[]) => {
    handleFieldChange(field, value)
  }

  const handleSave = async () => {
    const validationErrors = validateMorningEntry(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await onSave(formData)
      setHasUnsavedChanges(false)
      setErrors([])
    } catch {
      setErrors(['Failed to save morning entry. Please try again.'])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
        <div className="rounded-2xl bg-amber-300/15 p-3">
          <Sun className="h-6 w-6 text-amber-200" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Morning Standup</h2>
          <p className="text-sm text-slate-300">Pick the mission before the day starts pulling aggro.</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-200" />
            <span className="text-sm font-medium text-rose-100">Please fix the following issues:</span>
          </div>
          <ul className="space-y-1 text-sm text-rose-100">
            {errors.map((error, index) => (
              <li key={index}>- {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Coffee className="h-4 w-4 text-emerald-300" />
          <label className="text-sm font-semibold text-white">What did I accomplish yesterday?</label>
        </div>
        <textarea
          value={formData.yesterdayAccomplishments.join('\n')}
          onChange={(event) =>
            handleArrayFieldChange(
              'yesterdayAccomplishments',
              event.target.value.split('\n').filter(Boolean)
            )
          }
          placeholder="List your accomplishments from yesterday, one per line."
          rows={3}
          className={fieldClass}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-cyan-300" />
          <label className="text-sm font-semibold text-white">What do I plan to do today?</label>
        </div>
        <textarea
          value={formData.todayPlans.join('\n')}
          onChange={(event) =>
            handleArrayFieldChange('todayPlans', event.target.value.split('\n').filter(Boolean))
          }
          placeholder="List the actions you want to take today, one per line."
          rows={3}
          className={fieldClass}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-300" />
          <label className="text-sm font-semibold text-white">Any blockers or challenges?</label>
        </div>
        <textarea
          value={formData.blockers.join('\n')}
          onChange={(event) =>
            handleArrayFieldChange('blockers', event.target.value.split('\n').filter(Boolean))
          }
          placeholder="Name obstacles while they are still easy to route around."
          rows={2}
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MoodEnergySelector
          label="Mood"
          value={formData.mood}
          onChange={(value) => handleFieldChange('mood', value)}
          icon={<Sun className="h-4 w-4" />}
          description="How are you feeling right now?"
          required
        />

        <MoodEnergySelector
          label="Energy Level"
          value={formData.energy}
          onChange={(value) => handleFieldChange('energy', value)}
          icon={<Zap className="h-4 w-4" />}
          description="How much fuel is in the tank?"
          required
        />

        <MoodEnergySelector
          label="Sleep Quality"
          value={formData.sleepQuality}
          onChange={(value) => handleFieldChange('sleepQuality', value)}
          icon={<Moon className="h-4 w-4" />}
          description="How well did recovery land?"
          required
        />
      </div>

      <PriorityList
        priorities={formData.topPriorities}
        onChange={(priorities) => handleFieldChange('topPriorities', priorities)}
        maxItems={3}
        required
      />

      <TimeBlockPlanner
        timeBlocks={formData.timeBlocks}
        onChange={(timeBlocks) => handleFieldChange('timeBlocks', timeBlocks)}
      />

      <div className="space-y-3">
        <label className="text-sm font-semibold text-white">Additional notes</label>
        <textarea
          value={formData.notes}
          onChange={(event) => handleFieldChange('notes', event.target.value)}
          placeholder="Any thoughts, reminders, or context for the day..."
          rows={3}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-medium text-amber-200">
          {hasUnsavedChanges ? 'Unsaved changes' : ''}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Morning Entry'}
        </button>
      </div>

      <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-xs text-slate-300">
        <div className="mb-2 flex items-center gap-2 font-semibold text-cyan-100">
          <Lightbulb className="h-4 w-4" />
          Morning run tips
        </div>
        <div className="space-y-1">
          <p>- Review yesterday&apos;s wins to build momentum.</p>
          <p>- Set 1-3 clear priorities before opening the task queue.</p>
          <p>- Time block the important work, not every minute.</p>
          <p>- Name blockers early so they become solvable.</p>
        </div>
      </div>
    </div>
  )
}
