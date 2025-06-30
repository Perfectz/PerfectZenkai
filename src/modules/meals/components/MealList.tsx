import React from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { UtensilsCrossed, Clock, Trash2, Edit, Camera } from 'lucide-react'
import { useMealStore } from '../store'
import { MealType } from '../types'
import { useResponsiveBreakpoint } from '@/shared/hooks/useMobileInteractions'

export function MealList() {
  const { meals, deleteMeal, isLoading } = useMealStore()
  const { isMobile } = useResponsiveBreakpoint()

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
      case 'breakfast': return 'text-yellow-400 border-yellow-400/20'
      case 'lunch': return 'text-orange-400 border-orange-400/20'
      case 'dinner': return 'text-purple-400 border-purple-400/20'
      case 'snack': return 'text-green-400 border-green-400/20'
    }
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this meal entry?')) {
      await deleteMeal(id)
    }
  }

  if (meals.length === 0) {
    return (
      <Card className={`cyber-card mobile-card mobile-responsive ${isMobile ? 'galaxy-s24-ultra-optimized' : ''}`}>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-gray-700 bg-gray-900">
                <UtensilsCrossed className="text-plasma-cyan cyber-icon h-8 w-8 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="cyber-subtitle text-gray-300 mobile-heading">No Meals Logged Yet</h3>
              <p className="font-mono text-sm text-gray-500 mobile-body">
                Start tracking your nutrition by logging your first meal above.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 mobile-responsive">
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm p-2 -mx-2 md:mx-0 md:p-0 md:bg-transparent md:backdrop-blur-none">
        <h3 className="cyber-subtitle text-gray-300 mobile-heading flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          Meal History ({meals.length})
        </h3>
      </div>
      
      <div className="space-y-3 mobile-list">
        {meals.map((meal, index) => (
          <Card 
            key={meal.id} 
            className={`
              cyber-card mobile-card mobile-list-item border-gray-700 hover:border-gray-600 transition-colors
              ${isMobile ? 'galaxy-s24-ultra-optimized' : ''}
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                {/* Meal Content */}
                <div className="flex-1 space-y-3">
                  {/* Header with meal type and time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${getMealTypeColor(meal.type)} font-mono text-xs`}>
                        <span className="mr-1">{getMealTypeIcon(meal.type)}</span>
                        {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                      </Badge>
                      {meal.photos && meal.photos.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Camera className="mr-1 h-3 w-3" />
                          Photo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(meal.timestamp)}
                    </div>
                  </div>

                  {/* Foods */}
                  <div className="space-y-2">
                    {meal.foods.map((food, foodIndex) => (
                      <div key={foodIndex} className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-sm text-gray-300 font-medium">{food.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {food.quantity} {food.unit}
                          </span>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {food.calories} cal
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Nutrition Summary */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">P:</span>
                        <span>{Math.round(meal.nutrition.protein)}g</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-orange-400">C:</span>
                        <span>{Math.round(meal.nutrition.carbs)}g</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400">F:</span>
                        <span>{Math.round(meal.nutrition.fat)}g</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono font-semibold text-plasma-cyan">
                      {meal.nutrition.calories} cal
                    </Badge>
                  </div>

                  {/* Notes */}
                  {meal.notes && (
                    <div className="text-sm text-gray-400 italic">
                      "{meal.notes}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      console.log('Edit meal:', meal.id)
                    }}
                    disabled={isLoading}
                    aria-label="Edit meal"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                    onClick={() => handleDelete(meal.id)}
                    disabled={isLoading}
                    aria-label="Delete meal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scroll indicator for mobile */}
      {meals.length > 5 && isMobile && (
        <div className="text-center py-2">
          <div className="font-mono text-xs text-gray-500 animate-pulse">
            Scroll for more entries
          </div>
        </div>
      )}
    </div>
  )
} 