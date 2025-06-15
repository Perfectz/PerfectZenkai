import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { UtensilsCrossed, Plus, Calendar, Clock } from 'lucide-react'
import { useMealStore } from '../store'
import { MealType, MealEntryInput } from '../types'
import { Badge } from '@/shared/ui/badge'
import { useTouchFeedback, useResponsiveBreakpoint } from '@/shared/hooks/useMobileInteractions'

export function MealEntryForm() {
  const [mealType, setMealType] = useState<MealType>(() => {
    // Smart default based on time of day
    const hour = new Date().getHours()
    if (hour < 10) return 'breakfast'
    if (hour < 15) return 'lunch'
    if (hour < 20) return 'dinner'
    return 'snack'
  })
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [errors, setErrors] = useState<{ foodName?: string; calories?: string }>({})

  const { isLoading, addMeal } = useMealStore()
  
  // Mobile interactions
  const { isMobile } = useResponsiveBreakpoint()
  const buttonFeedback = useTouchFeedback<HTMLButtonElement>({ 
    scale: 0.95, 
    haptic: true 
  })

  const validateForm = () => {
    const newErrors: { foodName?: string; calories?: string } = {}

    if (!foodName.trim()) {
      newErrors.foodName = 'Food name is required'
    }

    const caloriesNum = parseFloat(calories)
    if (!calories) {
      newErrors.calories = 'Calories are required'
    } else if (isNaN(caloriesNum) || caloriesNum <= 0) {
      newErrors.calories = 'Calories must be a positive number'
    } else if (caloriesNum >= 5000) {
      newErrors.calories = 'Calories must be less than 5000'
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
      const mealInput: MealEntryInput = {
        type: mealType,
        foods: [{
          name: foodName.trim(),
          quantity: 1,
          unit: 'serving',
          calories: parseFloat(calories),
          macros: {
            protein: 0, // TODO: Add macro inputs
            carbs: 0,
            fat: 0,
            fiber: 0,
          }
        }],
        notes: '',
      }

      await addMeal(mealInput)

      // Reset form
      setFoodName('')
      setCalories('')
      setErrors({})
      setIsExpanded(false)
    } catch (error) {
      console.error('Failed to add meal:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && foodName.trim() && calories.trim()) {
      handleSubmit(e as React.FormEvent)
    }
  }

  const getMealTypeIcon = (type: MealType) => {
    switch (type) {
      case 'breakfast': return '🌅'
      case 'lunch': return '☀️'
      case 'dinner': return '🌙'
      case 'snack': return '🍎'
    }
  }

  const getMealTypeColor = (type: MealType) => {
    switch (type) {
      case 'breakfast': return 'text-yellow-400'
      case 'lunch': return 'text-orange-400'
      case 'dinner': return 'text-purple-400'
      case 'snack': return 'text-green-400'
    }
  }

  return (
    <Card className={`cyber-card mobile-card mobile-responsive ${isMobile ? 'galaxy-s24-ultra-optimized' : ''}`}>
      <CardHeader className="mobile-layout">
        <CardTitle className="cyber-subtitle flex items-center gap-2 text-plasma-cyan mobile-heading">
          <UtensilsCrossed className="cyber-icon h-5 w-5" />
          Log Meal Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 mobile-form-spacing">
        {/* Quick entry row - always visible */}
        <div className="flex gap-2 mobile-button-group">
          <Input
            id="meal-quick"
            type="text"
            placeholder="Enter food (e.g., chicken salad)"
            value={foodName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFoodName(e.target.value)
            }
            onKeyPress={handleKeyPress}
            className={`
              flex-1 font-mono touch-target mobile-body
              focus:border-plasma-cyan focus:ring-plasma-cyan/20 border-gray-600 bg-gray-900 text-white
              ${errors.foodName ? 'border-red-500' : ''}
            `}
            disabled={isLoading}
            aria-label="Food name"
          />
          <Input
            type="number"
            placeholder="Cal"
            value={calories}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCalories(e.target.value)
            }
            onKeyPress={handleKeyPress}
            className={`
              w-20 font-mono touch-target mobile-body
              focus:border-plasma-cyan focus:ring-plasma-cyan/20 border-gray-600 bg-gray-900 text-white
              ${errors.calories ? 'border-red-500' : ''}
            `}
            disabled={isLoading}
            aria-label="Calories"
          />
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="icon"
            className={`border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 touch-target ${isExpanded ? 'bg-gray-800' : ''}`}
            title="Meal options"
            aria-label="Toggle meal options"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            ref={buttonFeedback.elementRef}
            onClick={handleSubmit}
            variant="cyber-ki"
            disabled={isLoading || !foodName.trim() || !calories.trim()}
            className="touch-target mobile-button"
            aria-label="Log meal entry"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isLoading ? 'LOGGING...' : 'LOG'}
          </Button>
        </div>

        {/* Error display */}
        {(errors.foodName || errors.calories) && (
          <div className="space-y-1">
            {errors.foodName && (
              <p className="font-mono text-sm text-red-400">{errors.foodName}</p>
            )}
            {errors.calories && (
              <p className="font-mono text-sm text-red-400">{errors.calories}</p>
            )}
          </div>
        )}

        {/* Meal type selection - expandable */}
        {isExpanded && (
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <div className="space-y-2">
              <Label className="cyber-label text-gray-300">
                Meal Type
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMealType(type)}
                    className={`
                      border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 
                      ${mealType === type ? `bg-gray-800 ${getMealTypeColor(type)}` : ''}
                    `}
                  >
                    <span className="mr-2">{getMealTypeIcon(type)}</span>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Meal preview with context */}
        {foodName.trim() && calories.trim() && (
          <div className="cyber-card rounded-lg bg-gray-900/50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-300">Meal Preview:</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${getMealTypeColor(mealType)}`}>
                  <span className="mr-1">{getMealTypeIcon(mealType)}</span>
                  {mealType}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  {parseFloat(calories).toFixed(0)} cal
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date().toLocaleDateString()}
                </Badge>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {foodName}
            </div>
          </div>
        )}

        {/* Additional tips */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-3 w-3" />
            <span>Press Enter to log quickly</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Smart meal type by time</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 