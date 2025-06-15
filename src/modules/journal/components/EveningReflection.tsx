import { useState, useEffect } from 'react'
import { Moon, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, Save, AlertCircle } from 'lucide-react'
import { EveningEntry } from '../types'
import { createDefaultEveningEntry, validateEveningEntry } from '../utils/journalHelpers'
import MoodEnergySelector from './MoodEnergySelector'
import GratitudeList from './GratitudeList'

interface EveningReflectionProps {
  entry?: EveningEntry
  onSave: (entry: EveningEntry) => Promise<void>
  isLoading?: boolean
}

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
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    
    // Clear errors when user starts typing
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
    } catch (error) {
      setErrors(['Failed to save evening entry. Please try again.'])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Moon className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Evening Reflection</h2>
          <p className="text-sm text-gray-400">Review your day and prepare for tomorrow</p>
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

      {/* Today's Accomplishments */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <label className="text-sm font-medium text-white">What did I accomplish today?</label>
        </div>
        <textarea
          value={formData.accomplishments.join('\n')}
          onChange={(e) => handleArrayFieldChange('accomplishments', e.target.value.split('\n').filter(Boolean))}
          placeholder="List your accomplishments from today (one per line)"
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
        />
      </div>

      {/* Challenges */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <label className="text-sm font-medium text-white">What challenges did I face and how did I handle them?</label>
        </div>
        <textarea
          value={formData.challenges.join('\n')}
          onChange={(e) => handleArrayFieldChange('challenges', e.target.value.split('\n').filter(Boolean))}
          placeholder="Describe challenges you faced and how you dealt with them (one per line)"
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
        />
      </div>

      {/* Learnings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <label className="text-sm font-medium text-white">What did I learn today?</label>
        </div>
        <textarea
          value={formData.learnings.join('\n')}
          onChange={(e) => handleArrayFieldChange('learnings', e.target.value.split('\n').filter(Boolean))}
          placeholder="What insights, skills, or knowledge did you gain? (one per line)"
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
        />
      </div>

      {/* Tomorrow's Focus */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-blue-500" />
          <label className="text-sm font-medium text-white">What should I focus on tomorrow?</label>
        </div>
        <textarea
          value={formData.tomorrowFocus.join('\n')}
          onChange={(e) => handleArrayFieldChange('tomorrowFocus', e.target.value.split('\n').filter(Boolean))}
          placeholder="What are your key focus areas for tomorrow? (one per line)"
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
        />
      </div>

      {/* Unfinished Tasks */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <label className="text-sm font-medium text-white">Unfinished tasks to carry over</label>
        </div>
        <textarea
          value={formData.unfinishedTasks.join('\n')}
          onChange={(e) => handleArrayFieldChange('unfinishedTasks', e.target.value.split('\n').filter(Boolean))}
          placeholder="Tasks that didn't get completed today (one per line)"
          rows={2}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
        />
      </div>

      {/* Gratitude */}
      <GratitudeList
        gratitude={formData.gratitude}
        onChange={(gratitude) => handleFieldChange('gratitude', gratitude)}
        maxItems={3}
        required
      />

      {/* Improvements */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-purple-500" />
          <label className="text-sm font-medium text-white">Areas for improvement</label>
        </div>
        <textarea
          value={formData.improvements.join('\n')}
          onChange={(e) => handleArrayFieldChange('improvements', e.target.value.split('\n').filter(Boolean))}
          placeholder="What could you do better or differently? (one per line)"
          rows={2}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
        />
      </div>

      {/* Wellness Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MoodEnergySelector
          label="Productivity"
          value={formData.productivity}
          onChange={(value) => handleFieldChange('productivity', value)}
          icon={<CheckCircle className="h-4 w-4" />}
          description="How productive were you today?"
          required
        />
        
        <MoodEnergySelector
          label="Stress Level"
          value={formData.stressLevel}
          onChange={(value) => handleFieldChange('stressLevel', value)}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="How stressed did you feel?"
          required
        />
        
        <MoodEnergySelector
          label="Satisfaction"
          value={formData.satisfaction}
          onChange={(value) => handleFieldChange('satisfaction', value)}
          icon={<Moon className="h-4 w-4" />}
          description="How satisfied are you with today?"
          required
        />
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white">Additional Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Any additional thoughts, reflections, or notes about your day..."
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
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Evening Entry'}
        </button>
      </div>

      {/* Evening Tips */}
      <div className="text-xs text-gray-500 bg-gray-800/50 p-4 rounded-lg space-y-2">
        <p><strong>🌙 Evening Reflection Tips:</strong></p>
        <p>• Celebrate your wins, no matter how small</p>
        <p>• Learn from challenges without self-judgment</p>
        <p>• Practice gratitude to end the day positively</p>
        <p>• Set clear intentions for tomorrow</p>
      </div>
    </div>
  )
} 