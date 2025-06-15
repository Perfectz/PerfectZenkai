import { useEffect, useState } from 'react'
import { useWeightStore } from '../store'
import { WeightRow } from '../components/WeightRow'
import { WeightEntryForm } from '../components/WeightEntryForm'
import { WeightAnalytics } from '../components/WeightAnalytics'
import { WeightGoalForm } from '../components/WeightGoalForm'
import { WeightConversionTool } from '../components/WeightConversionTool'
import { useNotifications } from '@/shared/hooks/useNotifications'
import { ListSkeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { Scale, Target, TrendingUp, Plus } from 'lucide-react'
import { kgToLbs } from '../types'

const NOTIFICATION_REQUEST_KEY = 'perfect-zenkai-notification-requested'

export default function WeightPage() {
  const { weights, activeGoal, loadWeights, loadActiveGoal, isLoading } = useWeightStore()
  const { permission, isSupported, requestPermission, scheduleDailyReminder } =
    useNotifications()
  const [showGoalForm, setShowGoalForm] = useState(false)

  useEffect(() => {
    if (weights.length === 0) {
      loadWeights()
    }
    if (!activeGoal) {
      loadActiveGoal()
    }
  }, [weights.length, loadWeights, activeGoal, loadActiveGoal])

  useEffect(() => {
    // Request notification permission on first visit to weight page
    const hasRequestedBefore = localStorage.getItem(NOTIFICATION_REQUEST_KEY)

    if (isSupported && permission === 'default' && !hasRequestedBefore) {
      // Small delay to let the page load first
      const timer = setTimeout(async () => {
        const result = await requestPermission()
        localStorage.setItem(NOTIFICATION_REQUEST_KEY, 'true')

        if (result === 'granted') {
          scheduleDailyReminder()
        }
      }, 2000)

      return () => clearTimeout(timer)
    } else if (permission === 'granted') {
      // Ensure daily reminder is scheduled if permission already granted
      scheduleDailyReminder()
    }
  }, [isSupported, permission, requestPermission, scheduleDailyReminder])



  return (
    <div className="container mx-auto px-4 pb-24 pt-4">
      {/* Cyber-styled header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="cyber-title gradient-text-ki mb-2">WEIGHT TRACKING</h1>
            <p className="font-mono text-sm text-gray-400">
              Progress monitoring system • {weights.length} entries logged
            </p>
          </div>
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

      {/* Weight Entry Form - Always visible */}
      <WeightEntryForm />

      {/* Weight Goal Form - Show when requested */}
      {showGoalForm && (
        <div className="mb-6">
          <WeightGoalForm onClose={() => setShowGoalForm(false)} />
        </div>
      )}

      {/* Weight Conversion Tool - Show when there are entries */}
      {weights.length > 0 && !isLoading && (
        <div className="mb-6">
          <WeightConversionTool />
        </div>
      )}

      {/* Weight Analytics - Show when there are entries */}
      {weights.length > 0 && !isLoading && (
        <WeightAnalytics />
      )}

      {/* Loading state with skeleton */}
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
          <ListSkeleton count={5} />
        </div>
      )}

      {/* Enhanced empty state */}
      {!isLoading && weights.length === 0 && (
        <div className="py-16 text-center">
          <div className="cyber-card mx-auto max-w-md">
            <div className="flex flex-col items-center space-y-6">
              {/* Animated icon */}
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-gray-700 bg-gray-900">
                  <Scale className="text-ki-green cyber-icon h-10 w-10 animate-pulse" />
                </div>
                <div className="bg-hyper-magenta absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Title and description */}
              <div className="space-y-3">
                <h3 className="cyber-subtitle text-gray-300">
                  Begin Weight Journey
                </h3>
                <p className="font-mono text-sm leading-relaxed text-gray-500">
                  Track your progress with precision.
                  <br />
                  Every entry brings you closer to your goal.
                </p>
              </div>

              {/* Action button */}
              <Button
                variant="cyber-ki"
                onClick={() => {
                  const input = document.getElementById('weight-quick')
                  if (input) {
                    input.focus()
                  }
                }}
                className="w-full"
              >
                <Scale className="mr-2 h-4 w-4" />
                LOG FIRST WEIGHT
              </Button>

              {/* Features preview */}
              <div className="mt-6 grid w-full grid-cols-2 gap-4 border-t border-gray-700 pt-6">
                <div className="text-center">
                  <TrendingUp className="text-plasma-cyan cyber-icon mx-auto mb-2 h-6 w-6" />
                  <div className="font-mono text-xs text-gray-400">
                    Trend Analysis
                  </div>
                </div>
                <div className="text-center">
                  <Target className="text-hyper-magenta cyber-icon mx-auto mb-2 h-6 w-6" />
                  <div className="font-mono text-xs text-gray-400">
                    Goal Tracking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Weight entries list */}
      {!isLoading && weights.length > 0 && (
        <div className="space-y-3">
          {/* Summary stats */}
          <div className="cyber-card mb-6 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="gradient-text-ki metric-display text-lg font-bold">
                  {weights.length}
                </div>
                <div className="font-mono text-xs text-gray-400">Entries</div>
              </div>
              <div>
                <div className="gradient-text-cyan metric-display text-lg font-bold">
                  {weights[0] ? kgToLbs(weights[0].kg).toFixed(1) : 0}lbs
                </div>
                <div className="font-mono text-xs text-gray-400">Latest</div>
              </div>
              <div>
                <div className="gradient-text-magenta metric-display text-lg font-bold">
                  {Math.max(...weights.map((w) => w.kg)) -
                    Math.min(...weights.map((w) => w.kg)) >=
                  0.1
                    ? `${kgToLbs(Math.max(...weights.map((w) => w.kg)) - Math.min(...weights.map((w) => w.kg))).toFixed(1)}lbs`
                    : '0lbs'}
                </div>
                <div className="font-mono text-xs text-gray-400">Range</div>
              </div>
            </div>
          </div>

          {/* Weight entries */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Weight Entries ({weights.length})</h3>
            {weights.map((w) => (
              <WeightRow key={w.id} entry={w} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
