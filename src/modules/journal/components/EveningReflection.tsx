import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Moon,
  Save,
} from 'lucide-react'
import { EveningEntry } from '../types'
import { createDefaultEveningEntry, validateEveningEntry } from '../utils/journalHelpers'
import MoodEnergySelector from './MoodEnergySelector'
import GratitudeList from './GratitudeList'

interface EveningReflectionProps {
  entry?: EveningEntry
  onSave: (entry: EveningEntry) => Promise<void>
  isLoading?: boolean
}

const fieldClass =
  'min-h-[6rem] w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-300/40 focus:outline-none'

export default function EveningReflection({ entry, onSave, isLoading = false }: EveningReflectionProps) {
  const [formData, setFormData] = useState<EveningEntry>(entry || createDefaultEveningEntry())
  const [errors, setErrors] = useState<string[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (entry) {
      setFormData(entry)
      setHasUnsavedChanges(false)
    }
  }, [entry])

  const handleFieldChange = (field: keyof EveningEntry, value: EveningEntry[keyof EveningEntry]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)

    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleArrayFieldChange = (field: keyof EveningEntry, value: string[]) => {
    handleFieldChange(field, value)
  }

  const handleSave = async () => {
    const validationErrors = validateEveningEntry(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await onSave(formData)
      setHasUnsavedChanges(false)
      setErrors([])
    } catch {
      setErrors(['Failed to save evening entry. Please try again.'])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4">
        <div className="rounded-2xl bg-violet-300/15 p-3">
          <Moon className="h-6 w-6 text-violet-100" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Evening Reflection</h2>
          <p className="text-sm text-slate-300">Convert the day into lessons, gratitude, and tomorrow&apos;s route.</p>
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
          <CheckCircle className="h-4 w-4 text-emerald-300" />
          <label className="text-sm font-semibold text-white">What did I accomplish today?</label>
        </div>
        <textarea
          value={formData.accomplishments.join('\n')}
          onChange={(event) =>
            handleArrayFieldChange('accomplishments', event.target.value.split('\n').filter(Boolean))
          }
          placeholder="List your wins from today, one per line."
          rows={3}
          className={fieldClass}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-300" />
          <label className="text-sm font-semibold text-white">What challenges did I face?</label>
        </div>
        <textarea
          value={formData.challenges.join('\n')}
          onChange={(event) =>
            handleArrayFieldChange('challenges', event.target.value.split('\n').filter(Boolean))
          }
          placeholder="Capture friction, blockers, or decisions that cost energy."
          rows={3}
          className={fieldClass}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-300" />
          <label className="text-sm font-semibold text-white">What did I learn today?</label>
        </div>
        <textarea
          value={formData.learnings.join('\n')}
          onChange={(event) =>
            handleArrayFieldChange('learnings', event.target.value.split('\n').filter(Boolean))
          }
          placeholder="Write insights, pattern changes, or useful discoveries."
          rows={3}
          className={fieldClass}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-cyan-300" />
          <label className="text-sm font-semibold text-white">What should I focus on tomorrow?</label>
        </div>
        <textarea
          value={formData.tomorrowFocus.join('\n')}
          onChange={(event) =>
            handleArrayFieldChange('tomorrowFocus', event.target.value.split('\n').filter(Boolean))
          }
          placeholder="Set tomorrow&apos;s opening move, one line at a time."
          rows={3}
          className={fieldClass}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-300" />
          <label className="text-sm font-semibold text-white">Unfinished tasks to carry over</label>
        </div>
        <textarea
          value={formData.unfinishedTasks.join('\n')}
          onChange={(event) =>
            handleArrayFieldChange('unfinishedTasks', event.target.value.split('\n').filter(Boolean))
          }
          placeholder="Name the tasks that need another run tomorrow."
          rows={2}
          className={fieldClass}
        />
      </div>

      <GratitudeList
        gratitude={formData.gratitude}
        onChange={(gratitude) => handleFieldChange('gratitude', gratitude)}
        maxItems={3}
        required
      />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-violet-200" />
          <label className="text-sm font-semibold text-white">Areas for improvement</label>
        </div>
        <textarea
          value={formData.improvements.join('\n')}
          onChange={(event) =>
            handleArrayFieldChange('improvements', event.target.value.split('\n').filter(Boolean))
          }
          placeholder="What would make the next run cleaner?"
          rows={2}
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MoodEnergySelector
          label="Productivity"
          value={formData.productivity}
          onChange={(value) => handleFieldChange('productivity', value)}
          icon={<CheckCircle className="h-4 w-4" />}
          description="How much did the day move?"
          required
        />

        <MoodEnergySelector
          label="Stress Level"
          value={formData.stressLevel}
          onChange={(value) => handleFieldChange('stressLevel', value)}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="How heavy was the load?"
          required
        />

        <MoodEnergySelector
          label="Satisfaction"
          value={formData.satisfaction}
          onChange={(value) => handleFieldChange('satisfaction', value)}
          icon={<Moon className="h-4 w-4" />}
          description="How good does the run feel?"
          required
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-white">Additional notes</label>
        <textarea
          value={formData.notes}
          onChange={(event) => handleFieldChange('notes', event.target.value)}
          placeholder="Any extra reflections, loose ends, or signals..."
          rows={3}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-medium text-violet-100">
          {hasUnsavedChanges ? 'Unsaved changes' : ''}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Evening Entry'}
        </button>
      </div>

      <div className="rounded-2xl border border-violet-300/15 bg-violet-300/10 p-4 text-xs text-slate-300">
        <div className="mb-2 flex items-center gap-2 font-semibold text-violet-100">
          <Lightbulb className="h-4 w-4" />
          Evening run tips
        </div>
        <div className="space-y-1">
          <p>- Celebrate wins before judging gaps.</p>
          <p>- Convert challenges into a small lesson.</p>
          <p>- Carry over tasks deliberately, not by accident.</p>
          <p>- Pick tomorrow&apos;s first move before logging off.</p>
        </div>
      </div>
    </div>
  )
}
