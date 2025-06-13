import { useEffect } from 'react'
import { useWeightStore } from '../store'
import { WeightRow } from '../components/WeightRow'
import { useNotifications } from '@/shared/hooks/useNotifications'
import { ListSkeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { Scale, Target, TrendingUp, Plus } from 'lucide-react'

const NOTIFICATION_REQUEST_KEY = 'perfect-zenkai-notification-requested'

export default function WeightPage() {
  const { weights, loadWeights, isLoading } = useWeightStore()
  const { permission, isSupported, requestPermission, scheduleDailyReminder } = useNotifications()

  useEffect(() => {
    if (weights.length === 0) {
      loadWeights()
    }
  }, [weights.length, loadWeights])

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

  const handleFabClick = () => {
    const fabElement = document.querySelector('[data-testid="global-fab"]') as HTMLButtonElement
    if (fabElement) {
      fabElement.click()
    }
  }

  return (
    <div className="container mx-auto px-4 pb-24 pt-4">
      {/* Cyber-styled header */}
      <div className="mb-6">
        <h1 className="cyber-title gradient-text-ki mb-2">WEIGHT TRACKING</h1>
        <p className="text-gray-400 font-mono text-sm">
          Progress monitoring system • {weights.length} entries logged
        </p>
      </div>

      {/* Loading state with skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <div className="cyber-card p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-700 shimmer"></div>
              <div>
                <div className="w-24 h-4 bg-gray-700 rounded shimmer mb-2"></div>
                <div className="w-16 h-3 bg-gray-700 rounded shimmer"></div>
              </div>
            </div>
          </div>
          <ListSkeleton count={5} />
        </div>
      )}

      {/* Enhanced empty state */}
      {!isLoading && weights.length === 0 && (
        <div className="text-center py-16">
          <div className="cyber-card max-w-md mx-auto">
            <div className="flex flex-col items-center space-y-6">
              {/* Animated icon */}
              <div className="relative">
                <div className="w-20 h-20 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center">
                  <Scale className="h-10 w-10 text-ki-green cyber-icon animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-hyper-magenta rounded-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Title and description */}
              <div className="space-y-3">
                <h3 className="cyber-subtitle text-gray-300">Begin Weight Journey</h3>
                <p className="text-gray-500 font-mono text-sm leading-relaxed">
                  Track your progress with precision.<br />
                  Every entry brings you closer to your goal.
                </p>
              </div>

              {/* Action button */}
              <Button 
                variant="cyber-ki" 
                onClick={handleFabClick}
                className="w-full"
              >
                <Scale className="h-4 w-4 mr-2" />
                LOG FIRST WEIGHT
              </Button>

              {/* Features preview */}
              <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-6 border-t border-gray-700">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 text-plasma-cyan mx-auto mb-2 cyber-icon" />
                  <div className="text-xs text-gray-400 font-mono">Trend Analysis</div>
                </div>
                <div className="text-center">
                  <Target className="h-6 w-6 text-hyper-magenta mx-auto mb-2 cyber-icon" />
                  <div className="text-xs text-gray-400 font-mono">Goal Tracking</div>
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
          <div className="cyber-card p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold gradient-text-ki metric-display">
                  {weights.length}
                </div>
                <div className="text-xs text-gray-400 font-mono">Entries</div>
              </div>
              <div>
                <div className="text-lg font-bold gradient-text-cyan metric-display">
                  {weights[0]?.kg || 0}kg
                </div>
                <div className="text-xs text-gray-400 font-mono">Latest</div>
              </div>
              <div>
                <div className="text-lg font-bold gradient-text-magenta metric-display">
                  {Math.max(...weights.map(w => w.kg)) - Math.min(...weights.map(w => w.kg)) >= 0.1 
                    ? `${(Math.max(...weights.map(w => w.kg)) - Math.min(...weights.map(w => w.kg))).toFixed(1)}kg`
                    : '0kg'
                  }
                </div>
                <div className="text-xs text-gray-400 font-mono">Range</div>
              </div>
            </div>
          </div>

          {/* Weight entries */}
          {weights.map((w) => (
            <WeightRow key={w.id} entry={w} />
          ))}
        </div>
      )}
    </div>
  )
} 