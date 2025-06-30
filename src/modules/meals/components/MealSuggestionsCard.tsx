import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Brain, Clock, Target, TrendingUp, Calendar, Bell, ChevronRight } from 'lucide-react'
import { mealPlanningService, SmartSuggestion, MealPlan, MealPlanningPreferences } from '../services/MealPlanningService'
import { useMealStore } from '../store'

export function MealSuggestionsCard() {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [dailyPlan, setDailyPlan] = useState<MealPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPlanning, setShowPlanning] = useState(false)
  
  const { meals } = useMealStore()

  // Default preferences - in a real app, these would come from user settings
  const defaultPreferences: MealPlanningPreferences = {
    dietaryRestrictions: [],
    preferredCalories: 2000,
    macroRatios: { protein: 25, carbs: 45, fat: 30 },
    mealTimes: {
      breakfast: '08:00',
      lunch: '12:30',
      dinner: '18:30',
      snack: '15:00'
    },
    cookingTime: 'moderate',
    budgetRange: 'medium'
  }

  useEffect(() => {
    const loadSuggestions = async () => {
      setIsLoading(true)
      try {
        const smartSuggestions = await mealPlanningService.generateSmartSuggestions(meals)
        setSuggestions(smartSuggestions.slice(0, 3)) // Show top 3 suggestions
      } catch (error) {
        console.error('Failed to load meal suggestions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (meals.length > 0) {
      loadSuggestions()
    }
  }, [meals])

  const generateTodaysPlan = async () => {
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const plan = await mealPlanningService.generateMealPlan(today, defaultPreferences, meals)
      setDailyPlan(plan)
      setShowPlanning(true)
    } catch (error) {
      console.error('Failed to generate meal plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSuggestionIcon = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'meal_timing': return <Clock className="h-4 w-4" />
      case 'macro_balance': return <Target className="h-4 w-4" />
      case 'calorie_adjustment': return <TrendingUp className="h-4 w-4" />
      case 'food_substitution': return <Brain className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getSuggestionColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-ki-green border-ki-green/30 bg-ki-green/10'
    if (confidence >= 0.6) return 'text-plasma-cyan border-plasma-cyan/30 bg-plasma-cyan/10'
    return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
  }

  if (showPlanning && dailyPlan) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="cyber-subtitle flex items-center gap-2 text-plasma-cyan">
              <Calendar className="cyber-icon h-5 w-5" />
              Today's Meal Plan
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlanning(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              Back to Suggestions
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Overview */}
          <div className="grid grid-cols-3 gap-4 text-center p-4 rounded-lg bg-gray-900/50">
            <div>
              <div className="text-lg font-bold text-ki-green">{dailyPlan.totalCalories}</div>
              <div className="text-xs text-gray-400">Total Calories</div>
            </div>
            <div>
              <div className="text-lg font-bold text-plasma-cyan">{dailyPlan.meals.length}</div>
              <div className="text-xs text-gray-400">Planned Meals</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">{dailyPlan.macroTargets.protein}g</div>
              <div className="text-xs text-gray-400">Protein Target</div>
            </div>
          </div>

          {/* Planned Meals */}
          <div className="space-y-3">
            {dailyPlan.meals.map((meal, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-3 bg-gray-900/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {meal.type}
                    </Badge>
                    <span className="text-sm text-gray-400">{meal.plannedTime}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {meal.calories} cal
                  </Badge>
                </div>
                <div className="space-y-1">
                  {meal.foods.map((food, foodIndex) => (
                    <div key={foodIndex} className="text-sm text-gray-300">
                      • {food.name} ({food.quantity} {food.unit})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <Button
            variant="cyber-ki"
            onClick={() => {
              // TODO: Implement meal plan saving/following
              setShowPlanning(false)
            }}
            className="w-full"
          >
            <Bell className="mr-2 h-4 w-4" />
            Set Meal Reminders
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="cyber-subtitle flex items-center gap-2 text-plasma-cyan">
          <Brain className="cyber-icon h-5 w-5" />
          Smart Meal Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ki-green mx-auto"></div>
            <p className="text-sm text-gray-400 mt-2">Analyzing your meal patterns...</p>
          </div>
        ) : suggestions.length > 0 ? (
          <>
            {/* Smart Suggestions */}
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`border rounded-lg p-3 ${getSuggestionColor(suggestion.confidence)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">{suggestion.description}</p>
                      <p className="text-xs font-medium">{suggestion.recommendation}</p>
                      
                      {suggestion.reasoning.length > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          <div className="font-medium mb-1">Why this matters:</div>
                          <ul className="space-y-0.5 list-disc list-inside">
                            {suggestion.reasoning.slice(0, 2).map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="cyber-ki"
                onClick={generateTodaysPlan}
                disabled={isLoading}
                className="flex-1"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Generate Today's Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Implement more suggestions view
                  console.log('Show more suggestions')
                }}
                className="flex-1"
              >
                More Insights
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : meals.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-gray-600 mx-auto mb-3 animate-pulse" />
            <h4 className="font-medium text-gray-300 mb-2">No Data Yet</h4>
            <p className="text-sm text-gray-500 mb-4">
              Log a few meals to unlock personalized nutrition insights and smart recommendations.
            </p>
            <Button
              variant="outline"
              onClick={generateTodaysPlan}
              disabled={isLoading}
              className="w-full"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Generate Starter Plan
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <h4 className="font-medium text-gray-300 mb-2">Analyzing Patterns</h4>
            <p className="text-sm text-gray-500">
              Keep logging meals to get personalized insights and recommendations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 