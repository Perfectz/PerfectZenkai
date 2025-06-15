import { useState, useEffect } from 'react'
import { Sun, Coffee, Brain, Zap, Moon, Save, AlertCircle } from 'lucide-react'
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
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    
    // Clear errors when user starts typing
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
    } catch (error) {
      setErrors(['Failed to save morning entry. Please try again.'])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Sun className="h-6 w-6 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Morning Standup</h2>
          <p className="text-sm text-gray-400">Plan your day and check in with yourself</p>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Please fix the following issues:</span>
          </div>
          <ul className="text-sm text-red-300 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Yesterday's Accomplishments */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Coffee className="h-4 w-4 text-green-500" />
          <label className="text-sm font-medium text-white">What did I accomplish yesterday?</label>
        </div>
        <textarea
          value={formData.yesterdayAccomplishments.join('\n')}
          onChange={(e) => handleArrayFieldChange('yesterdayAccomplishments', e.target.value.split('\n').filter(Boolean))}
          placeholder="List your accomplishments from yesterday (one per line)"
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
        />
      </div>

      {/* Today's Plans */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-blue-500" />
          <label className="text-sm font-medium text-white">What do I plan to do today?</label>
        </div>
        <textarea
          value={formData.todayPlans.join('\n')}
          onChange={(e) => handleArrayFieldChange('todayPlans', e.target.value.split('\n').filter(Boolean))}
          placeholder="List your plans for today (one per line)"
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
        />
      </div>

      {/* Blockers */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <label className="text-sm font-medium text-white">Any blockers or challenges?</label>
        </div>
        <textarea
          value={formData.blockers.join('\n')}
          onChange={(e) => handleArrayFieldChange('blockers', e.target.value.split('\n').filter(Boolean))}
          placeholder="List any obstacles or challenges you're facing (one per line)"
          rows={2}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
        />
      </div>

      {/* Wellness Check */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          description="How energetic do you feel?"
          required
        />
        
        <MoodEnergySelector
          label="Sleep Quality"
          value={formData.sleepQuality}
          onChange={(value) => handleFieldChange('sleepQuality', value)}
          icon={<Moon className="h-4 w-4" />}
          description="How well did you sleep?"
          required
        />
      </div>

      {/* Top Priorities */}
      <PriorityList
        priorities={formData.topPriorities}
        onChange={(priorities) => handleFieldChange('topPriorities', priorities)}
        maxItems={3}
        required
      />

      {/* Time Blocks */}
      <TimeBlockPlanner
        timeBlocks={formData.timeBlocks}
        onChange={(timeBlocks) => handleFieldChange('timeBlocks', timeBlocks)}
      />

      {/* Notes */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white">Additional Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Any additional thoughts, ideas, or notes for the day..."
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          {hasUnsavedChanges && '• Unsaved changes'}
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Morning Entry'}
        </button>
      </div>

      {/* Morning Tips */}
      <div className="text-xs text-gray-500 bg-gray-800/50 p-4 rounded-lg space-y-2">
        <p><strong>🌅 Morning Success Tips:</strong></p>
        <p>• Review yesterday's wins to build momentum</p>
        <p>• Set 1-3 clear priorities to stay focused</p>
        <p>• Plan time blocks to structure your day</p>
        <p>• Identify blockers early to find solutions</p>
      </div>
    </div>
  )
} 