import React from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Dumbbell, Clock, Zap, Trash2, Edit, Trophy } from 'lucide-react'
import { useWorkoutStore } from '../store'
import { ExerciseType, IntensityLevel } from '../types'
import { useResponsiveBreakpoint } from '@/shared/hooks/useMobileInteractions'

export function WorkoutList() {
  const { workouts, deleteWorkout, isLoading } = useWorkoutStore()
  const { isMobile } = useResponsiveBreakpoint()

  const getExerciseTypeIcon = (type: ExerciseType) => {
    switch (type) {
      case 'cardio': return '❤️'
      case 'strength': return '💪'
      case 'flexibility': return '🧘'
      case 'sports': return '⚽'
      case 'other': return '🏃'
    }
  }

  const getExerciseTypeColor = (type: ExerciseType) => {
    switch (type) {
      case 'cardio': return 'text-red-400 border-red-400/20'
      case 'strength': return 'text-blue-400 border-blue-400/20'
      case 'flexibility': return 'text-green-400 border-green-400/20'
      case 'sports': return 'text-orange-400 border-orange-400/20'
      case 'other': return 'text-purple-400 border-purple-400/20'
    }
  }

  const getIntensityColor = (intensity: IntensityLevel) => {
    switch (intensity) {
      case 'light': return 'text-yellow-400'
      case 'moderate': return 'text-orange-400'
      case 'intense': return 'text-red-400'
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
    if (confirm('Are you sure you want to delete this workout entry?')) {
      await deleteWorkout(id)
    }
  }

  if (workouts.length === 0) {
    return (
      <Card className={`cyber-card mobile-card mobile-responsive ${isMobile ? 'galaxy-s24-ultra-optimized' : ''}`}>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-gray-700 bg-gray-900">
                <Dumbbell className="text-ki-green cyber-icon h-8 w-8 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="cyber-subtitle text-gray-300 mobile-heading">No Workouts Logged Yet</h3>
              <p className="font-mono text-sm text-gray-500 mobile-body">
                Start tracking your fitness by logging your first workout above.
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
          <Dumbbell className="h-5 w-5" />
          Workout History ({workouts.length})
        </h3>
      </div>
      
      <div className="space-y-3 mobile-list">
        {workouts.map((workout, index) => (
          <Card 
            key={workout.id} 
            className={`
              cyber-card mobile-card mobile-list-item border-gray-700 hover:border-gray-600 transition-colors
              ${isMobile ? 'galaxy-s24-ultra-optimized' : ''}
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                {/* Workout Content */}
                <div className="flex-1 space-y-3">
                  {/* Header with exercise name and time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${getExerciseTypeColor(workout.exerciseType)} font-mono text-xs`}>
                        <span className="mr-1">{getExerciseTypeIcon(workout.exerciseType)}</span>
                        {workout.exerciseType}
                      </Badge>
                      <Badge variant="outline" className={`${getIntensityColor(workout.intensity)} font-mono text-xs`}>
                        <Zap className="mr-1 h-3 w-3" />
                        {workout.intensity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(workout.createdAt)}
                    </div>
                  </div>

                  {/* Exercise Name */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-200">{workout.exerciseName}</h4>
                  </div>

                  {/* Primary Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span className="font-semibold">{workout.duration}min</span>
                      </div>
                      {workout.calories && (
                        <div className="flex items-center gap-1">
                          <span className="text-orange-400">🔥</span>
                          <span className="font-semibold">{workout.calories} cal</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strength Training Details */}
                  {workout.exerciseType === 'strength' && (workout.sets || workout.reps || workout.weight) && (
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {workout.sets && (
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-400">Sets:</span>
                          <span>{workout.sets}</span>
                        </div>
                      )}
                      {workout.reps && (
                        <div className="flex items-center gap-1">
                          <span className="text-green-400">Reps:</span>
                          <span>{workout.reps}</span>
                        </div>
                      )}
                      {workout.weight && (
                        <div className="flex items-center gap-1">
                          <span className="text-purple-400">Weight:</span>
                          <span>{workout.weight}kg</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cardio Details */}
                  {workout.exerciseType === 'cardio' && workout.distance && (
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="text-blue-400">Distance:</span>
                        <span>{workout.distance}km</span>
                      </div>
                      {workout.distance && workout.duration && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">Pace:</span>
                          <span>{(workout.duration / workout.distance).toFixed(1)} min/km</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {workout.notes && (
                    <div className="text-sm text-gray-400 italic">
                      "{workout.notes}"
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
                      console.log('Edit workout:', workout.id)
                    }}
                    disabled={isLoading}
                    aria-label="Edit workout"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                    onClick={() => handleDelete(workout.id)}
                    disabled={isLoading}
                    aria-label="Delete workout"
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
      {workouts.length > 5 && isMobile && (
        <div className="text-center py-2">
          <div className="font-mono text-xs text-gray-500 animate-pulse">
            Scroll for more entries
          </div>
        </div>
      )}

      {/* Achievement Badge for Milestones */}
      {workouts.length > 0 && workouts.length % 10 === 0 && (
        <div className="text-center py-4">
          <Badge variant="outline" className="px-4 py-2 text-yellow-400 border-yellow-400/20">
            <Trophy className="mr-2 h-4 w-4" />
            🎉 {workouts.length} Workouts Milestone!
          </Badge>
        </div>
      )}
    </div>
  )
} 