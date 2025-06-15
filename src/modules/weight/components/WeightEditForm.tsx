import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Scale, Save, X, Calendar } from 'lucide-react'
import { useWeightActions } from '../hooks/useWeightActions'
import { useWeightStore } from '../store'
import { Badge } from '@/shared/ui/badge'
import { WeightEntry, kgToLbs, lbsToKg } from '../types'

interface WeightEditFormProps {
  entry: WeightEntry
  onCancel: () => void
  onSave?: () => void
}

export function WeightEditForm({ entry, onCancel, onSave }: WeightEditFormProps) {
  const [date, setDate] = useState(entry.dateISO)
  const [weight, setWeight] = useState(kgToLbs(entry.kg).toFixed(1))
  const [errors, setErrors] = useState<{ date?: string; weight?: string }>({})

  const { isLoading } = useWeightStore()
  const { updateWeight } = useWeightActions()

  const validateForm = () => {
    const newErrors: { date?: string; weight?: string } = {}

    if (!date) {
      newErrors.date = 'Date is required'
    }

    const weightNum = parseFloat(weight)
    if (!weight) {
      newErrors.weight = 'Weight is required'
    } else if (isNaN(weightNum) || weightNum <= 0) {
      newErrors.weight = 'Weight must be a positive number'
    } else if (weightNum >= 2200) {
      newErrors.weight = 'Weight must be less than 2200 lbs'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const updates: Partial<Omit<WeightEntry, 'id'>> = {}
      
      // Only update fields that have changed
      if (date !== entry.dateISO) {
        updates.dateISO = date
      }
      
      const newKg = lbsToKg(parseFloat(weight))
      if (Math.abs(newKg - entry.kg) > 0.01) { // Account for floating point precision
        updates.kg = newKg
      }

      // Only update if there are actual changes
      if (Object.keys(updates).length > 0) {
        await updateWeight(entry.id, updates)
      }

      onSave?.()
    } catch (error) {
      console.error('Failed to update weight:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as React.FormEvent)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const hasChanges = () => {
    const newKg = lbsToKg(parseFloat(weight || '0'))
    return date !== entry.dateISO || Math.abs(newKg - entry.kg) > 0.01
  }

  return (
    <Card className="cyber-card border-ki-green/50">
      <CardHeader className="pb-3">
        <CardTitle className="cyber-subtitle flex items-center gap-2 text-ki-green text-sm">
          <Scale className="cyber-icon h-4 w-4" />
          Edit Weight Entry
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date input */}
          <div className="space-y-2">
            <Label htmlFor="edit-date" className="cyber-label text-gray-300 text-xs">
              Entry Date
            </Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDate(e.target.value)
              }
              onKeyPress={handleKeyPress}
              className={`
                focus:border-ki-green focus:ring-ki-green/20 border-gray-600
                bg-gray-900 text-white text-sm
                ${errors.date ? 'border-red-500' : ''}
              `}
              disabled={isLoading}
            />
            {errors.date && (
              <p className="font-mono text-xs text-red-400">{errors.date}</p>
            )}
          </div>

          {/* Weight input */}
          <div className="space-y-2">
            <Label htmlFor="edit-weight" className="cyber-label text-gray-300 text-xs">
              Weight (lbs)
            </Label>
            <Input
              id="edit-weight"
              type="number"
              step="0.1"
              min="0"
              max="2199.9"
              placeholder="Enter weight (lbs)"
              value={weight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setWeight(e.target.value)
              }
              onKeyPress={handleKeyPress}
              className={`
                font-mono focus:border-ki-green focus:ring-ki-green/20 border-gray-600 
                bg-gray-900 text-white text-sm
                ${errors.weight ? 'border-red-500' : ''}
              `}
              disabled={isLoading}
              autoFocus
            />
            {errors.weight && (
              <p className="font-mono text-xs text-red-400">{errors.weight}</p>
            )}
          </div>

          {/* Preview */}
          {weight && (
            <div className="cyber-card rounded-lg bg-gray-900/50 p-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-400">Preview:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {parseFloat(weight).toFixed(1)}lbs
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(date).toLocaleDateString()}
                  </Badge>
                  {hasChanges() && (
                    <Badge variant="outline" className="text-ki-green text-xs">
                      Modified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 text-sm h-8"
              disabled={isLoading}
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cyber-ki"
              className="flex-1 text-sm h-8"
              disabled={isLoading || !hasChanges()}
            >
              <Save className="mr-1 h-3 w-3" />
              {isLoading ? 'SAVING...' : 'SAVE'}
            </Button>
          </div>
        </form>

        {/* Help text */}
        <div className="text-xs text-gray-500 text-center">
          Press Enter to save • Escape to cancel
        </div>
      </CardContent>
    </Card>
  )
} 