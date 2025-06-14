import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { Badge } from '@/shared/ui/badge'
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar,
  Zap
} from 'lucide-react'
import { useWorkoutStore } from '../store'
import { getExerciseTypeColor } from '../types'

export function WorkoutAnalytics() {
  const { analytics } = useWorkoutStore()

  if (!analytics) {
    return (
      <Card className="cyber-card">
        <CardContent className="p-6 text-center text-gray-400">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No workout data yet</p>
          <p className="text-sm">Start logging workouts to see analytics</p>
        </CardContent>
      </Card>
    )
  }

  const weeklyProgressPercent = (analytics.weeklyProgress / analytics.weeklyGoal) * 100

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text-ki">
            <Activity className="h-5 w-5" />
            Workout Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="gradient-text-ki metric-display text-2xl font-bold">
                {analytics.totalWorkouts}
              </div>
              <div className="font-mono text-xs text-gray-400">Total Workouts</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-cyan metric-display text-2xl font-bold">
                {Math.round(analytics.totalDuration / 60)}h
              </div>
              <div className="font-mono text-xs text-gray-400">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-magenta metric-display text-2xl font-bold">
                {analytics.totalCalories}
              </div>
              <div className="font-mono text-xs text-gray-400">Calories Burned</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-yellow metric-display text-2xl font-bold">
                {analytics.currentStreak}
              </div>
              <div className="font-mono text-xs text-gray-400">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal Progress */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text-cyan">
            <Target className="h-5 w-5" />
            Weekly Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm">
                {analytics.weeklyProgress} / {analytics.weeklyGoal} minutes
              </span>
              <Badge variant={weeklyProgressPercent >= 100 ? "default" : "outline"}>
                {Math.round(weeklyProgressPercent)}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(weeklyProgressPercent, 100)} 
              className="h-3"
            />
            <div className="text-xs text-gray-400 font-mono">
              {weeklyProgressPercent >= 100 
                ? "🎉 Weekly goal achieved!" 
                : `${analytics.weeklyGoal - analytics.weeklyProgress} minutes to go`
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Type Breakdown */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text-magenta">
            <TrendingUp className="h-5 w-5" />
            Exercise Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.exerciseTypeBreakdown).map(([type, data]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`${getExerciseTypeColor(type as any)} text-lg`}>●</span>
                  <span className="capitalize font-mono text-sm">{type}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">{data.count} workouts</span>
                  <span className="text-gray-400">{Math.round(data.duration / 60)}h</span>
                  <span className="text-gray-400">{data.calories} cal</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text-yellow">
            <Calendar className="h-5 w-5" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="gradient-text-ki metric-display text-xl font-bold">
                {analytics.monthlyStats.workouts}
              </div>
              <div className="font-mono text-xs text-gray-400">Workouts</div>
            </div>
            <div>
              <div className="gradient-text-cyan metric-display text-xl font-bold">
                {Math.round(analytics.monthlyStats.duration / 60)}h
              </div>
              <div className="font-mono text-xs text-gray-400">Hours</div>
            </div>
            <div>
              <div className="gradient-text-magenta metric-display text-xl font-bold">
                {analytics.monthlyStats.calories}
              </div>
              <div className="font-mono text-xs text-gray-400">Calories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text-plasma">
            <Zap className="h-5 w-5" />
            Performance Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="gradient-text-ki metric-display text-lg font-bold">
                {analytics.longestStreak}
              </div>
              <div className="font-mono text-xs text-gray-400">Longest Streak</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-cyan metric-display text-lg font-bold">
                {analytics.averageIntensity.toFixed(1)}
              </div>
              <div className="font-mono text-xs text-gray-400">Avg Intensity</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-400">Favorite Exercise Type:</span>
              <Badge className={`${getExerciseTypeColor(analytics.favoriteExerciseType)} border-current`}>
                {analytics.favoriteExerciseType}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 