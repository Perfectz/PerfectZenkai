import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { UtensilsCrossed, TrendingUp, Target, BarChart3, Flame } from 'lucide-react'
import { useMealStore } from '../store'
import { MealType } from '../types'

export function MealAnalytics() {
  const { meals, analytics, isAnalyticsLoading } = useMealStore()

  if (isAnalyticsLoading) {
    return (
      <Card className="cyber-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="shimmer h-8 w-32 rounded bg-gray-700"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics || meals.length === 0) {
    return null
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

  // Calculate daily calorie goal (simplified - could be based on user profile)
  const dailyCalorieGoal = 2000
  const todayCalories = meals
    .filter(meal => {
      const mealDate = new Date(meal.timestamp).toDateString()
      const today = new Date().toDateString()
      return mealDate === today
    })
    .reduce((sum, meal) => sum + meal.nutrition.calories, 0)

  const calorieProgress = Math.min(100, (todayCalories / dailyCalorieGoal) * 100)

  return (
    <div className="space-y-6">
      {/* Main Analytics Card */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="cyber-subtitle flex items-center gap-2 text-plasma-cyan">
            <BarChart3 className="cyber-icon h-5 w-5" />
            Nutrition Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="text-center">
              <div className="gradient-text-cyan metric-display text-2xl font-bold">
                {analytics.totalMeals}
              </div>
              <div className="font-mono text-xs text-gray-400">Total Meals</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-ki metric-display text-2xl font-bold">
                {Math.round(analytics.averageCalories)}
              </div>
              <div className="font-mono text-xs text-gray-400">Avg Calories</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-magenta metric-display text-2xl font-bold">
                {analytics.streak}
              </div>
              <div className="font-mono text-xs text-gray-400">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-plasma metric-display text-2xl font-bold">
                {Math.round(todayCalories)}
              </div>
              <div className="font-mono text-xs text-gray-400">Today</div>
            </div>
          </div>

          {/* Daily Calorie Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="font-mono text-sm text-gray-300">Daily Calories</span>
              </div>
              <span className="font-mono text-sm text-gray-400">
                {Math.round(todayCalories)} / {dailyCalorieGoal} cal
              </span>
            </div>
            <Progress 
              value={calorieProgress} 
              className="h-2 bg-gray-800"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span className={calorieProgress >= 100 ? 'text-ki-green' : 'text-gray-400'}>
                {calorieProgress >= 100 ? 'Goal Reached!' : `${Math.round(dailyCalorieGoal - todayCalories)} cal remaining`}
              </span>
              <span>{dailyCalorieGoal}</span>
            </div>
          </div>

          {/* Macro Balance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-hyper-magenta" />
              <span className="font-mono text-sm text-gray-300">Macro Balance</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-orange-400 font-mono text-lg font-semibold">
                  {Math.round(analytics.macroBalance.protein)}%
                </div>
                <div className="font-mono text-xs text-gray-400">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-mono text-lg font-semibold">
                  {Math.round(analytics.macroBalance.carbs)}%
                </div>
                <div className="font-mono text-xs text-gray-400">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-mono text-lg font-semibold">
                  {Math.round(analytics.macroBalance.fat)}%
                </div>
                <div className="font-mono text-xs text-gray-400">Fat</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Frequency Analysis */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="cyber-subtitle flex items-center gap-2 text-plasma-cyan">
            <UtensilsCrossed className="cyber-icon h-5 w-5" />
            Meal Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(analytics.mealFrequency).map(([mealType, count]) => (
              <div key={mealType} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMealTypeIcon(mealType as MealType)}</span>
                  <div>
                    <div className={`font-mono text-sm font-semibold ${getMealTypeColor(mealType as MealType)}`}>
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                      {count} logged
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono">
                  {count}
                </Badge>
              </div>
            ))}
          </div>

          {/* Weekly Trends */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-ki-green" />
              <span className="font-mono text-sm text-gray-300">Weekly Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-900/50">
                <div className="font-mono text-lg font-semibold text-ki-green">
                  {Math.round(analytics.weeklyCalories)}
                </div>
                <div className="font-mono text-xs text-gray-400">Weekly Calories</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-900/50">
                <div className="font-mono text-lg font-semibold text-plasma-cyan">
                  {Math.round(analytics.weeklyCalories / 7)}
                </div>
                <div className="font-mono text-xs text-gray-400">Daily Average</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 