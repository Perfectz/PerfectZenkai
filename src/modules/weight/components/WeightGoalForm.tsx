import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import { Badge } from '@/shared/ui/badge'
import { Target, Calendar, TrendingDown, TrendingUp, Minus, Edit3, X } from 'lucide-react'
import { useWeightStore } from '../store'
import { WeightGoalInput, kgToLbs, lbsToKg } from '../types'

interface WeightGoalFormProps {
  onClose?: () => void
}

export function WeightGoalForm({ onClose }: WeightGoalFormProps) {
  const { activeGoal, weights, setGoal, updateGoal, deactivateGoal, isGoalLoading } = useWeightStore()
  
  const [isEditing, setIsEditing] = useState(!activeGoal)
  const [formData, setFormData] = useState<WeightGoalInput>({
    targetWeight: activeGoal ? kgToLbs(activeGoal.targetWeight) : 154, // Default 154 lbs (70kg)
    goalType: activeGoal?.goalType || 'lose',
    targetDate: activeGoal?.targetDate || '',
    startingWeight: activeGoal?.startingWeight ? kgToLbs(activeGoal.startingWeight) : (weights[0] ? kgToLbs(weights[0].kg) : 154),
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (activeGoal) {
      setFormData({
        targetWeight: kgToLbs(activeGoal.targetWeight),
        goalType: activeGoal.goalType,
        targetDate: activeGoal.targetDate || '',
        startingWeight: activeGoal.startingWeight ? kgToLbs(activeGoal.startingWeight) : (weights[0] ? kgToLbs(weights[0].kg) : 154),
      })
    }
  }, [activeGoal, weights])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.targetWeight || formData.targetWeight <= 0) {
      newErrors.targetWeight = 'Target weight must be greater than 0'
    } else if (formData.targetWeight >= 2200) {
      newErrors.targetWeight = 'Target weight must be less than 2200 lbs'
    }

    if (formData.startingWeight && formData.startingWeight >= 2200) {
      newErrors.startingWeight = 'Starting weight must be less than 2200 lbs'
    }

    if (formData.targetDate) {
      const targetDate = new Date(formData.targetDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (targetDate <= today) {
        newErrors.targetDate = 'Target date must be in the future'
      }
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
      if (activeGoal && !isEditing) {
        // This shouldn't happen, but just in case
        return
      }

      // Convert lbs to kg for storage
      const goalData = {
        ...formData,
        targetWeight: lbsToKg(formData.targetWeight),
        startingWeight: formData.startingWeight ? lbsToKg(formData.startingWeight) : undefined,
      }

      if (activeGoal) {
        // Update existing goal
        await updateGoal(activeGoal.id, goalData)
      } else {
        // Create new goal
        await setGoal(goalData)
      }

      setIsEditing(false)
      onClose?.()
    } catch (error) {
      console.error('Failed to save goal:', error)
    }
  }

  const handleDeactivate = async () => {
    if (!activeGoal) return

    try {
      await deactivateGoal(activeGoal.id)
      setIsEditing(true)
    } catch (error) {
      console.error('Failed to deactivate goal:', error)
    }
  }

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'lose':
        return <TrendingDown className="h-4 w-4 text-ki-green" />
      case 'gain':
        return <TrendingUp className="h-4 w-4 text-plasma-cyan" />
      case 'maintain':
        return <Minus className="h-4 w-4 text-hyper-magenta" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'lose':
        return 'Lose Weight'
      case 'gain':
        return 'Gain Weight'
      case 'maintain':
        return 'Maintain Weight'
      default:
        return type
    }
  }

  const calculateProgress = () => {
    if (!activeGoal || !weights.length) return null

    const currentWeight = weights[0].kg
    const startWeight = activeGoal.startingWeight || currentWeight
    const targetWeight = activeGoal.targetWeight

    const totalChange = Math.abs(targetWeight - startWeight)
    const currentChange = Math.abs(currentWeight - startWeight)
    const progress = totalChange > 0 ? Math.min(100, (currentChange / totalChange) * 100) : 0

    return {
      progress,
      remaining: Math.abs(currentWeight - targetWeight),
      achieved: activeGoal.goalType === 'lose' 
        ? currentWeight <= targetWeight
        : activeGoal.goalType === 'gain'
        ? currentWeight >= targetWeight
        : Math.abs(currentWeight - targetWeight) <= 1
    }
  }

  const progress = calculateProgress()

  if (!isEditing && activeGoal) {
    // Display mode
    return (
      <Card className="cyber-card">
        <CardHeader className="pb-3">
          <CardTitle className="cyber-subtitle flex items-center justify-between">
            <div className="flex items-center gap-2 text-hyper-magenta">
              <Target className="cyber-icon h-5 w-5" />
              Current Goal
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeactivate}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getGoalIcon(activeGoal.goalType)}
              <span className="font-mono text-sm text-gray-300">
                {getGoalTypeLabel(activeGoal.goalType)}
              </span>
            </div>
            <Badge variant="outline" className="text-hyper-magenta border-hyper-magenta">
              {kgToLbs(activeGoal.targetWeight).toFixed(1)}lbs target
            </Badge>
          </div>

          {progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-400">Progress</span>
                <span className="font-mono text-xs text-gray-300">
                  {kgToLbs(progress.remaining).toFixed(1)}lbs remaining
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-hyper-magenta to-plasma-cyan transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              {progress.achieved && (
                <Badge variant="outline" className="text-ki-green border-ki-green">
                  🎯 Goal Achieved!
                </Badge>
              )}
            </div>
          )}

          {activeGoal.targetDate && (
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="h-4 w-4" />
              <span className="font-mono text-sm">
                Target: {new Date(activeGoal.targetDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Edit/Create mode
  return (
    <Card className="cyber-card">
      <CardHeader className="pb-3">
        <CardTitle className="cyber-subtitle flex items-center justify-between">
          <div className="flex items-center gap-2 text-hyper-magenta">
            <Target className="cyber-icon h-5 w-5" />
            {activeGoal ? 'Edit Goal' : 'Set Weight Goal'}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal-type" className="cyber-label">
                Goal Type
              </Label>
              <select
                value={formData.goalType}
                onChange={(e) =>
                  setFormData({ ...formData, goalType: e.target.value as 'lose' | 'gain' | 'maintain' })
                }
                className="cyber-input w-full"
              >
                <option value="lose">🔽 Lose Weight</option>
                <option value="gain">🔼 Gain Weight</option>
                <option value="maintain">➖ Maintain Weight</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-weight" className="cyber-label">
                Target Weight (lbs)
              </Label>
              <Input
                id="target-weight"
                type="number"
                step="0.1"
                min="1"
                max="2199"
                value={formData.targetWeight}
                onChange={(e) =>
                  setFormData({ ...formData, targetWeight: parseFloat(e.target.value) || 0 })
                }
                className="cyber-input"
                placeholder="165.0"
              />
              {errors.targetWeight && (
                <p className="text-red-400 text-xs font-mono">{errors.targetWeight}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starting-weight" className="cyber-label">
                Starting Weight (lbs)
              </Label>
              <Input
                id="starting-weight"
                type="number"
                step="0.1"
                min="1"
                max="2199"
                value={formData.startingWeight || ''}
                onChange={(e) =>
                  setFormData({ ...formData, startingWeight: parseFloat(e.target.value) || undefined })
                }
                className="cyber-input"
                placeholder="Current weight"
              />
              {errors.startingWeight && (
                <p className="text-red-400 text-xs font-mono">{errors.startingWeight}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-date" className="cyber-label">
                Target Date (optional)
              </Label>
              <Input
                id="target-date"
                type="date"
                value={formData.targetDate}
                onChange={(e) =>
                  setFormData({ ...formData, targetDate: e.target.value })
                }
                className="cyber-input"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.targetDate && (
                <p className="text-red-400 text-xs font-mono">{errors.targetDate}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="cyber-ki"
              disabled={isGoalLoading}
              className="flex-1"
            >
              {isGoalLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {activeGoal ? 'Update Goal' : 'Set Goal'}
                </div>
              )}
            </Button>
            
            {activeGoal && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="px-4"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 