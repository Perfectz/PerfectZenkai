import React, { useState, useEffect } from 'react'
import { Plus, X, GripVertical, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { StandupFormProps, StandupFormData, MOOD_OPTIONS, CATEGORY_OPTIONS } from '../types/standup.types'
import { useDailyJournalStore } from '../stores/dailyJournalStore'

interface PriorityFormData {
  description: string
  category: 'work' | 'personal' | 'health' | 'learning' | 'other'
  importance: number
  urgency: number
  estimatedTime?: number
  linkedGoalId?: string
  linkedTaskIds?: string[]
}

interface ValidationErrors {
  energyLevel?: string
  mood?: string
  availableHours?: string
  priorities?: { [key: number]: { description?: string; importance?: string; urgency?: string } }
}

export const StandupForm: React.FC<StandupFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  aiInsights,
  availableGoals,
  availableTasks
}) => {
  const { createStandup, isLoading, error, clearError } = useDailyJournalStore()
  
  const [formData, setFormData] = useState<StandupFormData>({
    yesterdayAccomplishments: initialData?.yesterdayAccomplishments || '',
    yesterdayBlockers: initialData?.yesterdayBlockers || '',
    yesterdayLessons: initialData?.yesterdayLessons || '',
    todayPriorities: initialData?.todayPriorities || [],
    todayEnergyLevel: initialData?.todayEnergyLevel || 5,
    todayMood: initialData?.todayMood || '',
    todayAvailableHours: initialData?.todayAvailableHours || 8,
    motivationLevel: initialData?.motivationLevel || 5
  })

  const [priorities, setPriorities] = useState<PriorityFormData[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.todayEnergyLevel || formData.todayEnergyLevel < 1 || formData.todayEnergyLevel > 10) {
      errors.energyLevel = 'Energy level is required'
    }

    if (!formData.todayMood) {
      errors.mood = 'Mood is required'
    }

    if (!formData.todayAvailableHours || formData.todayAvailableHours <= 0) {
      errors.availableHours = 'Available hours is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const accomplishments = formData.yesterdayAccomplishments
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)

      const standupData = {
        userId: 'default-user',
        date: new Date().toISOString().split('T')[0],
        yesterdayAccomplishments: accomplishments,
        yesterdayBlockers: formData.yesterdayBlockers
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0),
        yesterdayLessons: formData.yesterdayLessons,
        todayPriorities: priorities.map((priority, index) => ({
          id: `priority-${Date.now()}-${index}`,
          description: priority.description,
          category: priority.category,
          estimatedTime: priority.estimatedTime || 60,
          importance: priority.importance,
          urgency: priority.urgency,
          linkedTaskIds: []
        })),
        todayEnergyLevel: formData.todayEnergyLevel,
        todayMood: formData.todayMood,
        todayAvailableHours: formData.todayAvailableHours,
        motivationLevel: formData.motivationLevel,
        todayFocusAreas: [],
        currentChallenges: [],
        neededResources: []
      }

      await createStandup(standupData)
      onSubmit(formData)
    } catch (error) {
      console.error('Failed to create standup:', error)
    }
  }

  const addPriority = () => {
    setPriorities(prev => [...prev, {
      description: '',
      category: 'work',
      importance: 3,
      urgency: 3,
      estimatedTime: 60
    }])
  }

  const removePriority = (index: number) => {
    setPriorities(prev => prev.filter((_, i) => i !== index))
  }

  const updatePriority = (index: number, field: keyof PriorityFormData, value: string | number | string[]) => {
    setPriorities(prev => prev.map((priority, i) => 
      i === index ? { ...priority, [field]: value } : priority
    ))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newPriorities = [...priorities]
    const draggedItem = newPriorities[draggedIndex]
    
    newPriorities.splice(draggedIndex, 1)
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newPriorities.splice(insertIndex, 0, draggedItem)
    
    setPriorities(newPriorities)
    setDraggedIndex(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-xl border border-gray-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-ki-green mb-2">Daily Standup</h2>
        <p className="text-gray-400 text-sm">Plan your day and reflect on yesterday</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 text-sm">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-2 text-red-400 hover:text-red-300"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8" role="form" aria-live="polite">
        {/* Yesterday's Review */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4" role="heading" aria-level={2}>Yesterday's Review</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accomplishments" className="text-gray-300">
                What did you accomplish yesterday?
              </Label>
              <Textarea
                id="accomplishments"
                value={formData.yesterdayAccomplishments}
                onChange={(e) => setFormData(prev => ({ ...prev, yesterdayAccomplishments: e.target.value }))}
                placeholder="Fixed critical bug, Completed code review..."
                className="mt-1 bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="blockers" className="text-gray-300">
                What blocked you yesterday?
              </Label>
              <Textarea
                id="blockers"
                value={formData.yesterdayBlockers}
                onChange={(e) => setFormData(prev => ({ ...prev, yesterdayBlockers: e.target.value }))}
                placeholder="API rate limiting, Unclear requirements..."
                className="mt-1 bg-gray-800 border-gray-600 text-white"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="lessons" className="text-gray-300">
                Key lesson learned yesterday
              </Label>
              <Textarea
                id="lessons"
                value={formData.yesterdayLessons}
                onChange={(e) => setFormData(prev => ({ ...prev, yesterdayLessons: e.target.value }))}
                placeholder="Need to implement retry logic for API calls..."
                className="mt-1 bg-gray-800 border-gray-600 text-white"
                rows={2}
              />
            </div>
          </div>
        </section>

        {/* Today's Planning */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4" role="heading" aria-level={2}>Today's Planning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="energy-level" className="text-gray-300">
                Energy Level (1-10)
              </Label>
              <Input
                id="energy-level"
                type="number"
                min="1"
                max="10"
                value={formData.todayEnergyLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, todayEnergyLevel: parseInt(e.target.value) || 5 }))}
                className="mt-1 bg-gray-800 border-gray-600 text-white"
                aria-describedby="energy-level-desc"
              />
              {validationErrors.energyLevel && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.energyLevel}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mood" className="text-gray-300">
                Current Mood
              </Label>
              <select
                id="mood"
                value={formData.todayMood}
                onChange={(e) => setFormData(prev => ({ ...prev, todayMood: e.target.value }))}
                className="mt-1 w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                aria-describedby="mood-desc"
              >
                <option value="">Select mood...</option>
                {MOOD_OPTIONS.map(mood => (
                  <option key={mood} value={mood}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </option>
                ))}
              </select>
              {validationErrors.mood && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.mood}</p>
              )}
            </div>

            <div>
              <Label htmlFor="available-hours" className="text-gray-300">
                Available Hours Today
              </Label>
              <Input
                id="available-hours"
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={formData.todayAvailableHours}
                onChange={(e) => setFormData(prev => ({ ...prev, todayAvailableHours: parseFloat(e.target.value) || 8 }))}
                className="mt-1 bg-gray-800 border-gray-600 text-white"
              />
              {validationErrors.availableHours && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.availableHours}</p>
              )}
            </div>

            <div>
              <Label htmlFor="motivation-level" className="text-gray-300">
                Motivation Level (1-10)
              </Label>
              <Input
                id="motivation-level"
                type="number"
                min="1"
                max="10"
                value={formData.motivationLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, motivationLevel: parseInt(e.target.value) || 5 }))}
                className="mt-1 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        </section>

        {/* Today's Priorities */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Today's Priorities</h3>
            <Button
              type="button"
              onClick={addPriority}
              variant="outline"
              size="sm"
              className="border-ki-green text-ki-green hover:bg-ki-green hover:text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Priority
            </Button>
          </div>

          <div className="space-y-4">
            {priorities.map((priority, index) => (
              <div
                key={index}
                data-testid="priority-item"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-4 bg-gray-800 rounded-lg border border-gray-600 ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-move" data-testid="drag-handle" />
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-gray-300 text-sm">Priority Description</Label>
                      <Input
                        placeholder="Describe your priority for today..."
                        value={priority.description}
                        onChange={(e) => updatePriority(index, 'description', e.target.value)}
                        className="mt-1 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-gray-300 text-sm">Category</Label>
                        <select
                          value={priority.category}
                          onChange={(e) => updatePriority(index, 'category', e.target.value)}
                          className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                        >
                          {CATEGORY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-gray-300 text-sm">Importance</Label>
                        <select
                          value={priority.importance}
                          onChange={(e) => updatePriority(index, 'importance', parseInt(e.target.value))}
                          className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-gray-300 text-sm">Urgency</Label>
                        <select
                          value={priority.urgency}
                          onChange={(e) => updatePriority(index, 'urgency', parseInt(e.target.value))}
                          className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-gray-300 text-sm">Estimated Time (min)</Label>
                        <Input
                          type="number"
                          min="5"
                          max="480"
                          step="5"
                          value={priority.estimatedTime || 60}
                          onChange={(e) => updatePriority(index, 'estimatedTime', parseInt(e.target.value) || 60)}
                          className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                          aria-label="Estimated time"
                        />
                      </div>
                    </div>

                    {/* Goal and Task Linking */}
                    {(availableGoals || availableTasks) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        {availableGoals && (
                          <div>
                            <Label className="text-gray-300 text-sm">Link to Goal</Label>
                            <select
                              value={priority.linkedGoalId || ''}
                              onChange={(e) => updatePriority(index, 'linkedGoalId', e.target.value)}
                              className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                              aria-label="Link to goal"
                            >
                              <option value="">No goal linked</option>
                              {availableGoals.map(goal => (
                                <option key={goal.id} value={goal.id}>
                                  {goal.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {availableTasks && (
                          <div>
                            <Label className="text-gray-300 text-sm">Link to Tasks</Label>
                            <select
                              multiple
                              value={priority.linkedTaskIds || []}
                              onChange={(e) => {
                                const selectedTasks = Array.from(e.target.selectedOptions, option => option.value)
                                updatePriority(index, 'linkedTaskIds', selectedTasks)
                              }}
                              className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                              size={3}
                            >
                              {availableTasks.map(task => (
                                <option key={task.id} value={task.id}>
                                  {task.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={() => removePriority(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove priority</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {priorities.length > 0 && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
              <p className="text-gray-300 text-sm">
                Total estimated time: {priorities.reduce((total, p) => total + (p.estimatedTime || 60), 0)} minutes
              </p>
            </div>
          )}
        </section>

        {/* AI Insights */}
        {aiInsights && aiInsights.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">AI Insights</h3>
            <div className="space-y-2">
              {aiInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                  <p className="text-blue-300 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-700">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-ki-green text-black hover:bg-ki-green/90 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" data-testid="loading-spinner" />
                Starting Day...
              </>
            ) : (
              'Start Day'
            )}
          </Button>
          
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StandupForm 