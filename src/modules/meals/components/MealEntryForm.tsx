import React, { useState, lazy, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { UtensilsCrossed, Plus, Calendar, Clock, Camera } from 'lucide-react'
import { useMealStore } from '../store'
import { MealType, MealEntryInput, FoodAnalysisResult } from '../types'
import { Badge } from '@/shared/ui/badge'
import { useTouchFeedback, useResponsiveBreakpoint } from '@/shared/hooks/useMobileInteractions'
import { FoodAnalysisAgent } from '../services/FoodAnalysisAgent'
import { keyVaultService } from '@/services/keyVaultService'

const PhotoUpload = lazy(() => import('./PhotoUpload'))

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
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
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

  const handlePhotoAnalysis = async (imageData: string) => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    setAnalysisResult(null)
    
    try {
      // Get OpenAI API key from environment
      const apiKey = await keyVaultService.getSecret('OPENAI_API_KEY')
      if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please check your environment setup.')
      }

      const agent = new FoodAnalysisAgent({
        apiKey,
        model: 'gpt-4o-mini'
      })

      const result = await agent.analyzePhoto(imageData)
      setAnalysisResult(result)

      // Auto-populate form with first detected food
      if (result.foods.length > 0) {
        const primaryFood = result.foods[0]
        setFoodName(primaryFood.name)
        
        // Calculate calories more intelligently
        const estimatedCalories = result.totalCalories || 
          (result.foods.reduce((sum, food) => sum + (food.confidence * 200), 0)) // Fallback estimation
        setCalories(Math.round(estimatedCalories).toString())
      }

      // Keep photo upload section open for review
      // setShowPhotoUpload(false) - Let user review results first
    } catch (error) {
      console.error('Photo analysis failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setAnalysisError(`Analysis failed: ${errorMessage}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAcceptAnalysis = () => {
    setShowPhotoUpload(false)
    setAnalysisError(null)
  }

  const handleRetryAnalysis = () => {
    setAnalysisResult(null)
    setAnalysisError(null)
    // Keep photo upload open for retry
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
            onClick={() => setShowPhotoUpload(!showPhotoUpload)}
            variant="outline"
            size="icon"
            className={`border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 touch-target ${showPhotoUpload ? 'bg-gray-800' : ''}`}
            title="Analyze meal photo"
            aria-label="Take or upload meal photo"
            disabled={isAnalyzing}
          >
            <Camera className="h-4 w-4" />
          </Button>
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

        {/* Photo Upload Section */}
        {showPhotoUpload && (
          <div className="border-t border-gray-700 pt-4">
            <Label className="cyber-label text-gray-300 mb-2 block">
              📸 Analyze Meal Photo
            </Label>
            <Suspense fallback={<div>Loading photo upload...</div>}>
              <PhotoUpload 
                onPhotoCapture={handlePhotoAnalysis}
                disabled={isAnalyzing}
                maxSizeMB={1}
              />
            </Suspense>
            {isAnalyzing && (
              <div className="text-center mt-4">
                <p className="text-plasma-cyan animate-pulse">Analyzing your meal...</p>
              </div>
            )}
          </div>
        )}

        {/* Analysis Error */}
        {analysisError && (
          <div className="border border-red-500/20 rounded-lg p-4 bg-red-900/10">
            <h4 className="text-red-400 font-mono text-sm mb-2">
              ❌ Analysis Error
            </h4>
            <p className="text-red-300 text-sm mb-3">{analysisError}</p>
            <div className="flex gap-2">
              <Button
                onClick={handleRetryAnalysis}
                size="sm"
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-900/20"
              >
                Try Again
              </Button>
              <Button
                onClick={() => setShowPhotoUpload(false)}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="border border-plasma-cyan/20 rounded-lg p-4 bg-gray-900/50">
            <h4 className="text-plasma-cyan font-mono text-sm mb-2">
              🤖 AI Analysis Results (Confidence: {(analysisResult.confidence * 100).toFixed(0)}%)
            </h4>
            <div className="space-y-2">
              {analysisResult.foods.map((food, index) => (
                <div key={index} className="flex justify-between items-center text-sm" data-testid="detected-food-item">
                  <span className="text-gray-300">
                    {food.name} ({food.portion})
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {(food.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-2 mt-2">
                <p className="text-sm text-gray-400">
                  Total Calories: <span className="text-plasma-cyan">{analysisResult.totalCalories}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Analysis time: {(analysisResult.analysisTime / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-gray-700">
                <Button
                  onClick={handleAcceptAnalysis}
                  size="sm"
                  className="bg-plasma-cyan text-black hover:bg-plasma-cyan/80"
                >
                  ✅ Accept & Use
                </Button>
                <Button
                  onClick={handleRetryAnalysis}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-400"
                >
                  🔄 Analyze Again
                </Button>
                <Button
                  onClick={() => setShowPhotoUpload(false)}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </div>
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