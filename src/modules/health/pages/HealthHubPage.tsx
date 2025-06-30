import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Scale, UtensilsCrossed, TrendingUp, Target, Dumbbell } from 'lucide-react'
import { useWeightStore } from '@/modules/weight/store'
import { useMealStore } from '@/modules/meals/store'
import { WeightEntryForm } from '@/modules/weight/components/WeightEntryForm'
import { WeightAnalytics } from '@/modules/weight/components/WeightAnalytics'
import { WeightGoalForm } from '@/modules/weight/components/WeightGoalForm'
import { WeightRow } from '@/modules/weight/components/WeightRow'
import { MealEntryForm } from '@/modules/meals/components/MealEntryForm'
import { MealAnalytics } from '@/modules/meals/components/MealAnalytics'
import { MealList } from '@/modules/meals/components/MealList'
import { MealSuggestionsCard } from '@/modules/meals/components/MealSuggestionsCard'
import { WorkoutEntryForm } from '@/modules/workout/components/WorkoutEntryForm'
import { WorkoutAnalytics } from '@/modules/workout/components/WorkoutAnalytics'
import { WorkoutList } from '@/modules/workout/components/WorkoutList'
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

  // Load data on mount - Fixed to prevent infinite loops
  useEffect(() => {
    console.log('🔍 HealthHub useEffect - Current state:', {
      weightsCount: weights.length,
      activeGoal: !!activeGoal,
      isWeightLoading,
      mealsCount: meals.length,
      workoutsCount: workouts.length
    })

    // Prevent loading if already in progress
    if (isWeightLoading || isMealLoading || isWorkoutLoading) {
      console.log('⏳ Loading already in progress, skipping...')
      return
    }

    if (weights.length === 0) {
      console.log('🔄 Loading weights...')
      loadWeights()
    }
    if (!activeGoal) {
      console.log('🔄 Loading active goal...')
      loadActiveGoal()
    }
    if (meals.length === 0 && !isMealLoading) {
      loadMeals()
    }
    if (workouts.length === 0 && !isWorkoutLoading) {
      loadWorkouts()
    }
    if (exercises.length === 0 && !isWorkoutLoading) {
      loadExercises()
      initializeExerciseLibrary()
    }
  }, [weights.length, activeGoal, meals.length, workouts.length, exercises.length, isWeightLoading, isMealLoading, isWorkoutLoading, loadWeights, loadActiveGoal, loadMeals, loadWorkouts, loadExercises, initializeExerciseLibrary])

  // Separate effect for analytics to avoid infinite loops
  useEffect(() => {
    if (meals.length > 0 && !isMealLoading) {
      loadAnalytics()
    }
    if (workouts.length > 0 && !isWorkoutLoading) {
      loadWorkoutAnalytics()
    }
  }, [meals.length, workouts.length, isMealLoading, isWorkoutLoading, loadAnalytics, loadWorkoutAnalytics])

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
              className="flex items-center gap-2 touch-target mobile-button"
              aria-label={activeGoal ? 'Edit weight goal' : 'Set weight goal'}
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">{activeGoal ? 'Edit Goal' : 'Set Goal'}</span>
              <span className="sm:hidden">{activeGoal ? 'Edit' : 'Goal'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Mobile optimized */}
      <Card className="cyber-card mb-6 mobile-card">
        <CardContent className="p-0">
          <div className="flex" role="tablist" aria-label="Health tracking categories">
            <Button
              variant={activeTab === 'weight' ? 'cyber-ki' : 'ghost'}
              className={`
                flex-1 rounded-none border-0 h-12 touch-target-comfortable mobile-tab
                ${activeTab === 'weight' 
                  ? 'bg-gradient-to-r from-ki-green/20 to-ki-green/10 text-ki-green border-b-2 border-ki-green' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }
              `}
              onClick={() => handleTabChange('weight')}
              role="tab"
              aria-selected={activeTab === 'weight'}
              aria-controls="weight-panel"
              aria-label="Weight tracking tab"
            >
              <Scale className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Weight</span>
            </Button>
            <Button
              variant={activeTab === 'meals' ? 'cyber-ki' : 'ghost'}
              className={`
                flex-1 rounded-none border-0 h-12 touch-target-comfortable mobile-tab
                ${activeTab === 'meals' 
                  ? 'bg-gradient-to-r from-plasma-cyan/20 to-plasma-cyan/10 text-plasma-cyan border-b-2 border-plasma-cyan' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }
              `}
              onClick={() => handleTabChange('meals')}
              role="tab"
              aria-selected={activeTab === 'meals'}
              aria-controls="meals-panel"
              aria-label="Meals tracking tab"
            >
              <UtensilsCrossed className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Meals</span>
            </Button>
            <Button
              variant={activeTab === 'workout' ? 'cyber-ki' : 'ghost'}
              className={`
                flex-1 rounded-none border-0 h-12 touch-target-comfortable mobile-tab
                ${activeTab === 'workout' 
                  ? 'bg-gradient-to-r from-ki-green/20 to-ki-green/10 text-ki-green border-b-2 border-ki-green' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }
              `}
              onClick={() => handleTabChange('workout')}
              role="tab"
              aria-selected={activeTab === 'workout'}
              aria-controls="workout-panel"
              aria-label="Workout tracking tab"
            >
              <Dumbbell className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Workout</span>
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
        <div 
          className="space-y-6 mobile-responsive" 
          role="tabpanel" 
          id="weight-panel" 
          aria-labelledby="weight-tab"
        >
          {/* Weight Entry Form */}
          <WeightEntryForm />

          {/* Weight Analytics */}
          {weights.length > 0 && !isWeightLoading && (
            <WeightAnalytics />
          )}

                    {/* Weight entries list */}
          {!isWeightLoading && weights.length > 0 && (
            <div className="space-y-4 mobile-responsive">
              {/* Summary stats - Mobile optimized */}
              <div className="cyber-card mb-6 p-4 mobile-card">
                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                  <div className="touch-target-comfortable">
                    <div className="gradient-text-ki metric-display text-base md:text-lg font-bold">
                      {weights.length}
                    </div>
                    <div className="font-mono text-xs text-gray-400 mobile-small">Entries</div>
                  </div>
                  <div className="touch-target-comfortable">
                    <div className="gradient-text-cyan metric-display text-base md:text-lg font-bold">
                      {weights[0] ? kgToLbs(weights[0].kg).toFixed(1) : 0}lbs
                    </div>
                    <div className="font-mono text-xs text-gray-400 mobile-small">Latest</div>
                  </div>
                  <div className="touch-target-comfortable">
                    <div className="gradient-text-magenta metric-display text-base md:text-lg font-bold">
                      {weights.length > 1 
                        ? ((Math.max(...weights.map((w) => w.kg)) - Math.min(...weights.map((w) => w.kg))) * 2.20462).toFixed(1) 
                        : 0}lbs
                    </div>
                    <div className="font-mono text-xs text-gray-400 mobile-small">Range</div>
                  </div>
                </div>
              </div>

              {/* Weight entries - Mobile optimized with sticky header */}
              <div className="space-y-3">
                <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm p-2 -mx-2 md:mx-0 md:p-0 md:bg-transparent md:backdrop-blur-none">
                  <h3 className="cyber-subtitle text-gray-300 mobile-heading">Weight History</h3>
                </div>
                <div className="space-y-2 mobile-list">
                  {weights.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className="mobile-list-item"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <WeightRow entry={entry} />
                    </div>
                  ))}
                </div>
                
                {/* Scroll indicator for mobile */}
                {weights.length > 5 && (
                  <div className="text-center py-2 md:hidden">
                    <div className="font-mono text-xs text-gray-500 animate-pulse">
                      Scroll for more entries
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'meals' && (
        <div 
          className="space-y-6 mobile-responsive" 
          role="tabpanel" 
          id="meals-panel" 
          aria-labelledby="meals-tab"
        >
          {/* Meal Entry Form */}
          <MealEntryForm />

          {/* Smart Meal Suggestions */}
          <MealSuggestionsCard />

          {/* Meal Analytics */}
          {meals.length > 0 && !isMealLoading && (
            <MealAnalytics />
          )}

          {/* Meal History List */}
          <MealList />
        </div>
      )}

      {activeTab === 'workout' && (
        <div 
          className="space-y-6 mobile-responsive" 
          role="tabpanel" 
          id="workout-panel" 
          aria-labelledby="workout-tab"
        >
          {/* Daily Strike Counter */}
          <DailyCounter />

          {/* Workout Entry Form */}
          <WorkoutEntryForm />

          {/* Workout Analytics */}
          {workouts.length > 0 && !isWorkoutLoading && (
            <WorkoutAnalytics />
          )}

          {/* Workout History List */}
          <WorkoutList />
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

      {/* Empty state for both tabs - Mobile optimized */}
      {!isLoading && weights.length === 0 && meals.length === 0 && (
        <div className="py-8 md:py-16 text-center mobile-responsive">
          <div className="cyber-card mx-auto max-w-md mobile-card">
            <div className="flex flex-col items-center space-y-4 md:space-y-6 p-4 md:p-6">
              <div className="relative">
                <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-xl border border-gray-700 bg-gray-900">
                  {activeTab === 'weight' ? (
                    <Scale className="text-ki-green cyber-icon h-8 w-8 md:h-10 md:w-10 animate-pulse" />
                  ) : activeTab === 'meals' ? (
                    <UtensilsCrossed className="text-plasma-cyan cyber-icon h-8 w-8 md:h-10 md:w-10 animate-pulse" />
                  ) : (
                    <Dumbbell className="text-ki-green cyber-icon h-8 w-8 md:h-10 md:w-10 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <h3 className="cyber-subtitle text-gray-300 mobile-heading">
                  {activeTab === 'weight' 
                    ? 'Begin Weight Journey' 
                    : activeTab === 'meals'
                    ? 'Start Meal Tracking'
                    : 'Start Fitness Journey'
                  }
                </h3>
                <p className="font-mono text-sm leading-relaxed text-gray-500 mobile-body px-2 md:px-0">
                  {activeTab === 'weight' 
                    ? 'Track your progress with precision. Every entry brings you closer to your goal.'
                    : activeTab === 'meals'
                    ? 'Log your meals and nutrition. Build healthy eating habits with detailed tracking.'
                    : 'Track workouts and build consistency. Every session counts towards your fitness goals.'
                  }
                </p>
              </div>

              <Button
                variant="cyber-ki"
                onClick={() => {
                  const input = document.getElementById(
                    activeTab === 'weight' ? 'weight-quick' : 
                    activeTab === 'meals' ? 'meal-quick' : 'workout-quick'
                  )
                  if (input) {
                    input.focus()
                  }
                }}
                className="w-full touch-target-comfortable mobile-button"
                aria-label={`Log first ${activeTab === 'weight' ? 'weight' : activeTab === 'meals' ? 'meal' : 'workout'} entry`}
              >
                {activeTab === 'weight' ? (
                  <>
                    <Scale className="mr-2 h-4 w-4" />
                    <span className="mobile-body">LOG FIRST WEIGHT</span>
                  </>
                ) : activeTab === 'meals' ? (
                  <>
                    <UtensilsCrossed className="mr-2 h-4 w-4" />
                    <span className="mobile-body">LOG FIRST MEAL</span>
                  </>
                ) : (
                  <>
                    <Dumbbell className="mr-2 h-4 w-4" />
                    <span className="mobile-body">LOG FIRST WORKOUT</span>
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