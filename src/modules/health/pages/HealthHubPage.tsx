import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Scale, UtensilsCrossed, TrendingUp, Target, Dumbbell } from 'lucide-react'
import { useWeightStore } from '@/modules/weight/store'
import { useMealStore } from '@/modules/meals/store'
import { WeightEntryForm } from '@/modules/weight/components/WeightEntryForm'
import { WeightAnalytics } from '@/modules/weight/components/WeightAnalytics'
import { WeightGoalForm } from '@/modules/weight/components/WeightGoalForm'
import { MealEntryForm } from '@/modules/meals/components/MealEntryForm'
import { MealAnalytics } from '@/modules/meals/components/MealAnalytics'
import { WorkoutEntryForm } from '@/modules/workout/components/WorkoutEntryForm'
import { WorkoutAnalytics } from '@/modules/workout/components/WorkoutAnalytics'
import { DailyCounter } from '@/modules/workout/components/DailyCounter'
import { useWorkoutStore } from '@/modules/workout/store'
import { HealthTab } from '@/modules/workout/types'
import { kgToLbs } from '@/modules/weight/types'

const HEALTH_TAB_KEY = 'perfect-zenkai-health-tab'

export default function HealthHubPage() {
  const [activeTab, setActiveTab] = useState<HealthTab>(() => {
    const saved = localStorage.getItem(HEALTH_TAB_KEY)
    return (saved as HealthTab) || 'weight'
  })
  const [showGoalForm, setShowGoalForm] = useState(false)

  // Weight store
  const { 
    weights, 
    activeGoal, 
    loadWeights, 
    loadActiveGoal, 
    isLoading: isWeightLoading 
  } = useWeightStore()

  // Meal store
  const { 
    meals, 
    loadMeals, 
    loadAnalytics, 
    isLoading: isMealLoading 
  } = useMealStore()

  // Workout store
  const { 
    workouts, 
    exercises,
    loadWorkouts, 
    loadExercises,
    loadAnalytics: loadWorkoutAnalytics,
    initializeExerciseLibrary,
    isLoading: isWorkoutLoading 
  } = useWorkoutStore()

  // Load data on mount
  useEffect(() => {
    if (weights.length === 0) {
      loadWeights()
    }
    if (!activeGoal) {
      loadActiveGoal()
    }
    if (meals.length === 0) {
      loadMeals()
    }
    if (workouts.length === 0) {
      loadWorkouts()
    }
    if (exercises.length === 0) {
      loadExercises()
      initializeExerciseLibrary()
    }
    loadAnalytics()
    loadWorkoutAnalytics()
  }, [weights.length, loadWeights, activeGoal, loadActiveGoal, meals.length, loadMeals, loadAnalytics, workouts.length, loadWorkouts, exercises.length, loadExercises, initializeExerciseLibrary, loadWorkoutAnalytics])

  // Persist tab selection
  const handleTabChange = (tab: HealthTab) => {
    setActiveTab(tab)
    localStorage.setItem(HEALTH_TAB_KEY, tab)
  }

  const isLoading = isWeightLoading || isMealLoading || isWorkoutLoading

  return (
    <div className="container mx-auto px-4 pb-24 pt-4">
      {/* Unified Diet Hub Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="cyber-title gradient-text-ki mb-2">HEALTH HUB</h1>
            <p className="font-mono text-sm text-gray-400">
              Unified health tracking • {weights.length} weight entries • {meals.length} meals • {workouts.length} workouts
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              {activeGoal ? 'Edit Goal' : 'Set Goal'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="cyber-card mb-6">
        <CardContent className="p-0">
          <div className="flex">
            <Button
              variant={activeTab === 'weight' ? 'cyber-ki' : 'ghost'}
              className={`
                flex-1 rounded-none border-0 h-12
                ${activeTab === 'weight' 
                  ? 'bg-gradient-to-r from-ki-green/20 to-ki-green/10 text-ki-green border-b-2 border-ki-green' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }
              `}
              onClick={() => handleTabChange('weight')}
            >
              <Scale className="mr-2 h-4 w-4" />
              Weight
            </Button>
            <Button
              variant={activeTab === 'meals' ? 'cyber-ki' : 'ghost'}
              className={`
                flex-1 rounded-none border-0 h-12
                ${activeTab === 'meals' 
                  ? 'bg-gradient-to-r from-plasma-cyan/20 to-plasma-cyan/10 text-plasma-cyan border-b-2 border-plasma-cyan' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }
              `}
              onClick={() => handleTabChange('meals')}
            >
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              Meals
            </Button>
            <Button
              variant={activeTab === 'workout' ? 'cyber-ki' : 'ghost'}
              className={`
                flex-1 rounded-none border-0 h-12
                ${activeTab === 'workout' 
                  ? 'bg-gradient-to-r from-ki-green/20 to-ki-green/10 text-ki-green border-b-2 border-ki-green' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }
              `}
              onClick={() => handleTabChange('workout')}
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              Workout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Unified Analytics Header - Visible on both tabs */}
      <div className="mb-6">
        <Card className="cyber-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="gradient-text-ki metric-display text-lg font-bold">
                  {weights.length + meals.length + workouts.length}
                </div>
                <div className="font-mono text-xs text-gray-400">Total Entries</div>
              </div>
              <div>
                <div className="gradient-text-cyan metric-display text-lg font-bold">
                  {activeTab === 'weight' 
                    ? `${weights[0] ? kgToLbs(weights[0].kg).toFixed(1) : 0}lbs`
                    : activeTab === 'meals'
                    ? `${meals.reduce((sum, meal) => sum + meal.nutrition.calories, 0)}cal`
                    : `${workouts.reduce((sum, workout) => sum + workout.duration, 0)}min`
                  }
                </div>
                <div className="font-mono text-xs text-gray-400">
                  {activeTab === 'weight' ? 'Latest Weight' : activeTab === 'meals' ? 'Total Calories' : 'Total Duration'}
                </div>
              </div>
              <div>
                <div className="gradient-text-magenta metric-display text-lg font-bold">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  {activeTab === 'weight' ? 'Progress' : activeTab === 'meals' ? 'Nutrition' : 'Fitness'}
                </div>
                <div className="font-mono text-xs text-gray-400">
                  {activeTab === 'weight' ? 'Tracking' : activeTab === 'meals' ? 'Balance' : 'Training'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weight Goal Form - Show when requested */}
      {showGoalForm && (
        <div className="mb-6">
          <WeightGoalForm onClose={() => setShowGoalForm(false)} />
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'weight' && (
        <div className="space-y-6">
          {/* Weight Entry Form */}
          <WeightEntryForm />

          {/* Weight Analytics */}
          {weights.length > 0 && !isWeightLoading && (
            <WeightAnalytics />
          )}

          {/* Weight entries list would go here */}
          {/* TODO: Add WeightList component */}
        </div>
      )}

      {activeTab === 'meals' && (
        <div className="space-y-6">
          {/* Meal Entry Form */}
          <MealEntryForm />

          {/* Meal Analytics */}
          {meals.length > 0 && !isMealLoading && (
            <MealAnalytics />
          )}

          {/* Meal entries list would go here */}
          {/* TODO: Add MealList component */}
        </div>
      )}

      {activeTab === 'workout' && (
        <div className="space-y-6">
          {/* Daily Strike Counter */}
          <DailyCounter />

          {/* Workout Entry Form */}
          <WorkoutEntryForm />

          {/* Workout Analytics */}
          {workouts.length > 0 && !isWorkoutLoading && (
            <WorkoutAnalytics />
          )}

          {/* Workout entries list would go here */}
          {/* TODO: Add WorkoutList component */}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <div className="cyber-card p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="shimmer h-8 w-8 rounded-full bg-gray-700"></div>
              <div>
                <div className="shimmer mb-2 h-4 w-24 rounded bg-gray-700"></div>
                <div className="shimmer h-3 w-16 rounded bg-gray-700"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state for both tabs */}
      {!isLoading && weights.length === 0 && meals.length === 0 && (
        <div className="py-16 text-center">
          <div className="cyber-card mx-auto max-w-md">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-gray-700 bg-gray-900">
                  {activeTab === 'weight' ? (
                    <Scale className="text-ki-green cyber-icon h-10 w-10 animate-pulse" />
                  ) : (
                    <UtensilsCrossed className="text-plasma-cyan cyber-icon h-10 w-10 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="cyber-subtitle text-gray-300">
                  {activeTab === 'weight' ? 'Begin Weight Journey' : 'Start Meal Tracking'}
                </h3>
                <p className="font-mono text-sm leading-relaxed text-gray-500">
                  {activeTab === 'weight' 
                    ? 'Track your progress with precision. Every entry brings you closer to your goal.'
                    : 'Log your meals and nutrition. Build healthy eating habits with detailed tracking.'
                  }
                </p>
              </div>

              <Button
                variant="cyber-ki"
                onClick={() => {
                  const input = document.getElementById(
                    activeTab === 'weight' ? 'weight-quick' : 'meal-quick'
                  )
                  if (input) {
                    input.focus()
                  }
                }}
                className="w-full"
              >
                {activeTab === 'weight' ? (
                  <>
                    <Scale className="mr-2 h-4 w-4" />
                    LOG FIRST WEIGHT
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="mr-2 h-4 w-4" />
                    LOG FIRST MEAL
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 