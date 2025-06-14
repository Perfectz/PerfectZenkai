import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { TrendingUp, TrendingDown, Target, Minus, BarChart3 } from 'lucide-react'
import { useWeightStore } from '../store'
import { kgToLbs } from '../types'

interface WeightAnalyticsProps {
  goalWeight?: number
  goalType?: 'lose' | 'gain' | 'maintain'
}

export function WeightAnalytics({ goalWeight, goalType = 'lose' }: WeightAnalyticsProps) {
  const { weights, activeGoal } = useWeightStore()
  
  // Use stored goal if available, otherwise fall back to props
  const effectiveGoalWeight = activeGoal?.targetWeight || goalWeight
  const effectiveGoalType = activeGoal?.goalType || goalType

  // Calculate analytics
  const getAnalytics = () => {
    if (weights.length === 0) return null

    const sortedWeights = [...weights].sort((a, b) => 
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    )

    const currentWeight = sortedWeights[sortedWeights.length - 1]?.kg || 0
    const startWeight = sortedWeights[0]?.kg || 0
    const totalChange = currentWeight - startWeight

    // Get last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentWeights = weights.filter(w => 
      new Date(w.dateISO) >= thirtyDaysAgo
    ).sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())

    const monthlyChange = recentWeights.length >= 2 
      ? recentWeights[recentWeights.length - 1].kg - recentWeights[0].kg 
      : 0

    // Get last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const weeklyWeights = weights.filter(w => 
      new Date(w.dateISO) >= sevenDaysAgo
    ).sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())

    const weeklyChange = weeklyWeights.length >= 2 
      ? weeklyWeights[weeklyWeights.length - 1].kg - weeklyWeights[0].kg 
      : 0

    // Goal progress
    const goalProgress = effectiveGoalWeight ? {
      remaining: Math.abs(currentWeight - effectiveGoalWeight),
      percentage: effectiveGoalType === 'lose' 
        ? Math.max(0, Math.min(100, ((startWeight - currentWeight) / (startWeight - effectiveGoalWeight)) * 100))
        : effectiveGoalType === 'gain'
        ? Math.max(0, Math.min(100, ((currentWeight - startWeight) / (effectiveGoalWeight - startWeight)) * 100))
        : Math.max(0, 100 - Math.abs(currentWeight - effectiveGoalWeight) * 10), // maintain within 1kg = 90%+
      achieved: effectiveGoalType === 'lose' ? currentWeight <= effectiveGoalWeight : 
                effectiveGoalType === 'gain' ? currentWeight >= effectiveGoalWeight :
                Math.abs(currentWeight - effectiveGoalWeight) <= 1
    } : null

    // Streak calculation
    const today = new Date()
    let streak = 0
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const hasEntry = weights.some(w => w.dateISO === dateStr)
      if (hasEntry) {
        streak++
      } else {
        break
      }
    }

    return {
      currentWeight,
      startWeight,
      totalChange,
      monthlyChange,
      weeklyChange,
      goalProgress,
      streak,
      totalEntries: weights.length,
      averageWeight: weights.reduce((sum, w) => sum + w.kg, 0) / weights.length
    }
  }

  const analytics = getAnalytics()

  if (!analytics) {
    return (
      <Card className="cyber-card">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <BarChart3 className="cyber-icon mb-4 h-12 w-12 text-gray-600" />
          <p className="text-gray-400">Add weight entries to see analytics</p>
        </CardContent>
      </Card>
    )
  }

  const getTrendIcon = (change: number) => {
    if (Math.abs(change) < 0.1) return <Minus className="h-4 w-4 text-plasma-cyan" />
    return change > 0 
      ? <TrendingUp className="h-4 w-4 text-red-400" />
      : <TrendingDown className="h-4 w-4 text-ki-green" />
  }

  const getTrendColor = (change: number) => {
    if (Math.abs(change) < 0.1) return 'text-plasma-cyan'
    return change > 0 ? 'text-red-400' : 'text-ki-green'
  }

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <Card className="cyber-card">
        <CardHeader className="pb-3">
          <CardTitle className="cyber-subtitle flex items-center gap-2 text-ki-green">
            <BarChart3 className="cyber-icon h-5 w-5" />
            Weight Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="gradient-text-ki metric-display text-2xl font-bold">
                {kgToLbs(analytics.currentWeight).toFixed(1)}
              </div>
              <div className="font-mono text-xs text-gray-400">Current (lbs)</div>
            </div>
            <div className="text-center">
              <div className={`metric-display text-2xl font-bold ${getTrendColor(analytics.totalChange)}`}>
                {analytics.totalChange >= 0 ? '+' : ''}{kgToLbs(analytics.totalChange).toFixed(1)}
              </div>
              <div className="font-mono text-xs text-gray-400">Total Change</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-magenta metric-display text-2xl font-bold">
                {analytics.streak}
              </div>
              <div className="font-mono text-xs text-gray-400">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="gradient-text-cyan metric-display text-2xl font-bold">
                {analytics.totalEntries}
              </div>
              <div className="font-mono text-xs text-gray-400">Total Entries</div>
            </div>
          </div>

          {/* Trend indicators */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="cyber-card rounded-lg bg-gray-900/50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTrendIcon(analytics.weeklyChange)}
                  <span className="font-mono text-sm text-gray-300">7 Days</span>
                </div>
                <div className={`font-mono text-sm font-semibold ${getTrendColor(analytics.weeklyChange)}`}>
                  {analytics.weeklyChange >= 0 ? '+' : ''}{kgToLbs(analytics.weeklyChange).toFixed(1)}lbs
                </div>
              </div>
            </div>
            <div className="cyber-card rounded-lg bg-gray-900/50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTrendIcon(analytics.monthlyChange)}
                  <span className="font-mono text-sm text-gray-300">30 Days</span>
                </div>
                <div className={`font-mono text-sm font-semibold ${getTrendColor(analytics.monthlyChange)}`}>
                  {analytics.monthlyChange >= 0 ? '+' : ''}{kgToLbs(analytics.monthlyChange).toFixed(1)}lbs
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Progress */}
      {goalWeight && analytics.goalProgress && (
        <Card className="cyber-card">
          <CardHeader className="pb-3">
            <CardTitle className="cyber-subtitle flex items-center gap-2 text-hyper-magenta">
              <Target className="cyber-icon h-5 w-5" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm text-gray-300">
                    Target: {effectiveGoalWeight ? kgToLbs(effectiveGoalWeight).toFixed(1) : 0}lbs ({effectiveGoalType})
                  </div>
                  <div className="font-mono text-xs text-gray-500">
                    {kgToLbs(analytics.goalProgress.remaining).toFixed(1)}lbs remaining
                  </div>
                </div>
                <div className="text-right">
                  <div className="gradient-text-magenta metric-display text-lg font-bold">
                    {analytics.goalProgress.percentage.toFixed(0)}%
                  </div>
                  {analytics.goalProgress.achieved && (
                    <Badge variant="outline" className="text-ki-green border-ki-green">
                      🎯 Achieved!
                    </Badge>
                  )}
                </div>
              </div>
              <Progress 
                value={analytics.goalProgress.percentage} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 