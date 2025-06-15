import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
// Using native select for now
import { Dumbbell, Clock, Zap, Plus } from 'lucide-react'
import { useWorkoutStore } from '../store'
import { ExerciseType, IntensityLevel } from '../types'
import { useTouchFeedback, useResponsiveBreakpoint } from '@/shared/hooks/useMobileInteractions'

export function WorkoutEntryForm() {
  const { exercises, addWorkout, isLoading } = useWorkoutStore()
  const [selectedExercise, setSelectedExercise] = useState('')
  const [customExerciseName, setCustomExerciseName] = useState('')
  const [exerciseType, setExerciseType] = useState<ExerciseType>('cardio')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState<IntensityLevel>('moderate')
  const [notes, setNotes] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [distance, setDistance] = useState('')
  
  // Mobile interactions
  const { isMobile } = useResponsiveBreakpoint()
  const buttonFeedback = useTouchFeedback<HTMLButtonElement>({ 
    scale: 0.95, 
    haptic: true 
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!duration || (!selectedExercise && !customExerciseName)) return

    const selectedExerciseData = exercises.find(ex => ex.id === selectedExercise)
    const exerciseName = selectedExerciseData?.name || customExerciseName
    const finalExerciseType = selectedExerciseData?.type || exerciseType

    const workoutData = {
      exerciseId: selectedExercise || 'custom',
      exerciseName,
      exerciseType: finalExerciseType,
      duration: parseInt(duration),
      intensity,
      notes: notes || undefined,
      sets: sets ? parseInt(sets) : undefined,
      reps: reps ? parseInt(reps) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      distance: distance ? parseFloat(distance) : undefined,
    }

    await addWorkout(workoutData)

    // Reset form
    setSelectedExercise('')
    setCustomExerciseName('')
    setExerciseType('cardio')
    setDuration('')
    setIntensity('moderate')
    setNotes('')
    setSets('')
    setReps('')
    setWeight('')
    setDistance('')
  }

  const selectedExerciseData = exercises.find(ex => ex.id === selectedExercise)
  const currentExerciseType = selectedExerciseData?.type || exerciseType

  return (
    <Card className={`cyber-card mobile-card mobile-responsive ${isMobile ? 'galaxy-s24-ultra-optimized' : ''}`}>
      <CardHeader className="mobile-layout">
        <CardTitle className="flex items-center gap-2 gradient-text-ki mobile-heading">
          <Dumbbell className="h-5 w-5" />
          Log Workout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mobile-form-spacing">
          {/* Exercise Selection */}
          <div className="space-y-2">
            <Label>Exercise</Label>
            <select 
              value={selectedExercise} 
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="cyber-input w-full"
            >
              <option value="">Select an exercise</option>
              <option value="custom">Custom Exercise</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} ({exercise.category})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Exercise Name */}
          {selectedExercise === 'custom' && (
            <div className="space-y-2">
              <Label>Custom Exercise Name</Label>
              <Input
                value={customExerciseName}
                onChange={(e) => setCustomExerciseName(e.target.value)}
                placeholder="Enter exercise name"
                className="cyber-input"
                required
              />
            </div>
          )}

          {/* Exercise Type (for custom exercises) */}
          {selectedExercise === 'custom' && (
            <div className="space-y-2">
              <Label>Exercise Type</Label>
              <select 
                value={exerciseType} 
                onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
                className="cyber-input w-full"
              >
                <option value="cardio">Cardio</option>
                <option value="strength">Strength</option>
                <option value="flexibility">Flexibility</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* Duration and Intensity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Duration (minutes)
              </Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="cyber-input"
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Intensity
              </Label>
              <select 
                value={intensity} 
                onChange={(e) => setIntensity(e.target.value as IntensityLevel)}
                className="cyber-input w-full"
              >
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </select>
            </div>
          </div>

          {/* Additional Fields for Strength Training */}
          {currentExerciseType === 'strength' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Sets</Label>
                <Input
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="3"
                  className="cyber-input"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Reps</Label>
                <Input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="12"
                  className="cyber-input"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="50"
                  className="cyber-input"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Additional Field for Cardio */}
          {currentExerciseType === 'cardio' && (
            <div className="space-y-2">
              <Label>Distance (km)</Label>
              <Input
                type="number"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="5.0"
                className="cyber-input"
                min="0"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel? Any observations..."
              className="cyber-input min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !duration || (!selectedExercise && !customExerciseName)}
            className="w-full cyber-button-ki"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isLoading ? 'Logging...' : 'Log Workout'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 