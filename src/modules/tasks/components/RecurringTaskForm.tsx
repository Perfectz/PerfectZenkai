import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Checkbox } from '@/shared/ui/checkbox'
import { Badge } from '@/shared/ui/badge'
import { AlertCircle, Calendar, Repeat, Clock } from 'lucide-react'
import { Priority, Category, RecurrenceType, RecurrencePattern } from '../types'
import { PRIORITIES, CATEGORIES } from '../utils'
import { cn } from '@/shared/utils/cn'

interface RecurringTaskFormData {
  summary: string
  description?: string
  priority: Priority
  category: Category
  points: number
  recurrence: RecurrencePattern
}

interface RecurringTaskFormProps {
  onSubmit: (data: RecurringTaskFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

interface FormErrors {
  summary?: string
  interval?: string
  daysOfWeek?: string
  endDate?: string
  maxOccurrences?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
]

export function RecurringTaskForm({ onSubmit, onCancel, isLoading = false }: RecurringTaskFormProps) {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    priority: 'medium' as Priority,
    category: 'other' as Category,
    points: 5
  })

  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily')
  const [interval, setInterval] = useState(1)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [endDate, setEndDate] = useState('')
  const [maxOccurrences, setMaxOccurrences] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  // Reset days selection when changing recurrence type
  useEffect(() => {
    if (recurrenceType !== 'weekly') {
      setSelectedDays([])
    }
  }, [recurrenceType])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields
    if (!formData.summary.trim()) {
      newErrors.summary = 'Task summary is required'
    }

    // Interval validation
    if (interval < 1) {
      newErrors.interval = 'Interval must be at least 1'
    }

    // Weekly recurrence validation
    if (recurrenceType === 'weekly' && selectedDays.length === 0) {
      newErrors.daysOfWeek = 'Select at least one day for weekly recurrence'
    }

    // End date validation
    if (endDate) {
      const endDateTime = new Date(endDate).getTime()
      const today = new Date().getTime()
      if (endDateTime <= today) {
        newErrors.endDate = 'End date must be in the future'
      }
    }

    // Max occurrences validation
    if (maxOccurrences && parseInt(maxOccurrences) < 1) {
      newErrors.maxOccurrences = 'Max occurrences must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const recurrence: RecurrencePattern = {
      type: recurrenceType,
      interval,
      ...(recurrenceType === 'weekly' && selectedDays.length > 0 && { daysOfWeek: selectedDays }),
      ...(endDate && { endDate }),
      ...(maxOccurrences && { maxOccurrences: parseInt(maxOccurrences) })
    }

    const submitData: RecurringTaskFormData = {
      summary: formData.summary.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      category: formData.category,
      points: formData.points,
      recurrence
    }

    onSubmit(submitData)
  }

  const handleDayToggle = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue].sort()
    )
  }

  const getIntervalLabel = () => {
    switch (recurrenceType) {
      case 'daily': return interval === 1 ? 'day' : 'days'
      case 'weekly': return interval === 1 ? 'week' : 'weeks'
      case 'monthly': return interval === 1 ? 'month' : 'months'
      default: return 'intervals'
    }
  }

  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null
    return (
      <div className="flex items-center gap-1 text-sm text-red-600 mt-1" aria-live="polite">
        <AlertCircle className="h-4 w-4" />
        {message}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Create Recurring Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} role="form" className="space-y-6">
          {/* Basic Task Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="summary" className="text-sm font-medium">
                Task Summary *
              </Label>
              <Input
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Enter task summary..."
                className={cn(errors.summary && "border-red-300")}
                aria-required="true"
                aria-invalid={!!errors.summary}
              />
              <ErrorMessage message={errors.summary} />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about this task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.icon} {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="points" className="text-sm font-medium">
                  Points
                </Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 5 })}
                />
              </div>
            </div>
          </div>

          {/* Recurrence Configuration */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Recurrence Pattern</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recurrenceType" className="text-sm font-medium">
                  Recurrence Type
                </Label>
                <select
                  id="recurrenceType"
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">🗓️ Daily</option>
                  <option value="weekly">📅 Weekly</option>
                  <option value="monthly">🗓️ Monthly</option>
                </select>
              </div>

              <div>
                <Label htmlFor="interval" className="text-sm font-medium">
                  Every {interval} {getIntervalLabel()}
                </Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  max="365"
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                  className={cn(errors.interval && "border-red-300")}
                  aria-invalid={!!errors.interval}
                />
                <ErrorMessage message={errors.interval} />
              </div>
            </div>

            {/* Days of Week Selection for Weekly Recurrence */}
            {recurrenceType === 'weekly' && (
              <div>
                <fieldset role="group" aria-labelledby="days-legend">
                  <legend id="days-legend" className="text-sm font-medium mb-2">
                    Days of Week *
                  </legend>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.value} className="flex flex-col items-center">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={selectedDays.includes(day.value)}
                          onCheckedChange={() => handleDayToggle(day.value)}
                          aria-labelledby={`day-label-${day.value}`}
                        />
                        <Label 
                          id={`day-label-${day.value}`}
                          htmlFor={`day-${day.value}`}
                          className="text-xs mt-1 cursor-pointer"
                        >
                          {day.short}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <ErrorMessage message={errors.daysOfWeek} />
                </fieldset>
              </div>
            )}

            {/* Optional Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <Label htmlFor="endDate" className="text-sm font-medium">
                  End Date (Optional)
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={cn(errors.endDate && "border-red-300")}
                  aria-invalid={!!errors.endDate}
                />
                <ErrorMessage message={errors.endDate} />
              </div>

              <div>
                <Label htmlFor="maxOccurrences" className="text-sm font-medium">
                  Max Occurrences (Optional)
                </Label>
                <Input
                  id="maxOccurrences"
                  type="number"
                  min="1"
                  placeholder="e.g., 30"
                  value={maxOccurrences}
                  onChange={(e) => setMaxOccurrences(e.target.value)}
                  className={cn(errors.maxOccurrences && "border-red-300")}
                  aria-invalid={!!errors.maxOccurrences}
                />
                <ErrorMessage message={errors.maxOccurrences} />
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Badge variant="secondary">{recurrenceType}</Badge>
                <span>
                  "{formData.summary}" will repeat every {interval} {getIntervalLabel()}
                  {recurrenceType === 'weekly' && selectedDays.length > 0 && (
                    <span> on {selectedDays.map(d => DAYS_OF_WEEK[d].short).join(', ')}</span>
                  )}
                  {endDate && <span> until {endDate}</span>}
                  {maxOccurrences && <span> for {maxOccurrences} times</span>}
                </span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Recurring Task'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 