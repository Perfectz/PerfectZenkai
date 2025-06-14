import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Scale, Plus, Calendar, Target, TrendingUp } from 'lucide-react'
import { useWeightActions } from '../hooks/useWeightActions'
import { useWeightStore } from '../store'
import { Badge } from '@/shared/ui/badge'
import { lbsToKg } from '../types'

export function WeightEntryForm() {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [weight, setWeight] = useState('')
  const [errors, setErrors] = useState<{ date?: string; weight?: string }>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const { isLoading } = useWeightStore()
  const { addWeight } = useWeightActions()

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
      await addWeight({
        dateISO: date,
        kg: lbsToKg(parseFloat(weight)), // Convert lbs to kg for storage
      })

      // Reset form
      setDate(new Date().toISOString().split('T')[0])
      setWeight('')
      setErrors({})
      setIsExpanded(false)
    } catch (error) {
      console.error('Failed to add weight:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && weight.trim()) {
      handleSubmit(e as any)
    }
  }

  const todayISO = new Date().toISOString().split('T')[0]
  const isToday = date === todayISO

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="cyber-subtitle flex items-center gap-2 text-ki-green">
          <Scale className="cyber-icon h-5 w-5" />
          Log Weight Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick entry row - always visible */}
        <div className="flex gap-2">
          <Input
            id="weight-quick"
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
              flex-1 font-mono
              focus:border-ki-green focus:ring-ki-green/20 border-gray-600 bg-gray-900 text-white
              ${errors.weight ? 'border-red-500' : ''}
            `}
            disabled={isLoading}
          />
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="icon"
            className={`border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 ${isExpanded ? 'bg-gray-800' : ''}`}
            title="Date options"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSubmit}
            variant="cyber-ki"
            disabled={isLoading || !weight.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isLoading ? 'LOGGING...' : 'LOG'}
          </Button>
        </div>

        {/* Error display */}
        {errors.weight && (
          <p className="font-mono text-sm text-red-400">{errors.weight}</p>
        )}

        {/* Date selection - expandable */}
        {isExpanded && (
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="cyber-label text-gray-300">
                Entry Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDate(e.target.value)
                }
                className={`
                  focus:border-ki-green focus:ring-ki-green/20 border-gray-600
                  bg-gray-900 text-white
                  ${errors.date ? 'border-red-500' : ''}
                `}
              />
              {errors.date && (
                <p className="font-mono text-sm text-red-400">{errors.date}</p>
              )}
            </div>

            {/* Quick date buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDate(todayISO)}
                className={`border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 ${isToday ? 'bg-gray-800 text-ki-green' : ''}`}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const yesterday = new Date()
                  yesterday.setDate(yesterday.getDate() - 1)
                  setDate(yesterday.toISOString().split('T')[0])
                }}
                className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800"
              >
                Yesterday
              </Button>
            </div>
          </div>
        )}

        {/* Weight preview with context */}
        {weight.trim() && (
          <div className="cyber-card rounded-lg bg-gray-900/50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-300">Entry Preview:</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {parseFloat(weight).toFixed(1)}lbs
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(date).toLocaleDateString()}
                </Badge>
                {isToday && (
                  <Badge variant="outline" className="text-ki-green text-xs">
                    Today
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional tips */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3" />
            <span>Press Enter to log quickly</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            <span>Consistent tracking = better results</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 