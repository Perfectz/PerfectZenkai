import { useWeightStore } from '@/modules/weight'
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function TodayWeightCard() {
  const { weights, isLoading } = useWeightStore()

  // Get today's weight entry
  const today = new Date().toISOString().split('T')[0]
  const todayWeight = weights.find((w) => w.dateISO === today)

  // Get yesterday's weight for comparison
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayISO = yesterday.toISOString().split('T')[0]
  const yesterdayWeight = weights.find((w) => w.dateISO === yesterdayISO)

  // Calculate trend
  const getTrend = () => {
    if (!todayWeight || !yesterdayWeight) return null
    const diff = todayWeight.kg - yesterdayWeight.kg
    if (Math.abs(diff) < 0.1) return { type: 'stable', diff: 0 }
    return {
      type: diff > 0 ? 'up' : 'down',
      diff: Math.abs(diff),
    }
  }

  const trend = getTrend()

  if (isLoading) {
    return (
      <div className="cyber-card cursor-pointer">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-700">
            <Scale className="text-ki-green cyber-icon h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Today's Weight</h3>
            <p className="font-mono text-xs text-gray-400">Loading...</p>
          </div>
        </div>
        <div className="flex h-16 items-center justify-center">
          <div className="shimmer h-8 w-full rounded bg-gray-700"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="cyber-card transition-cyber flex h-full cursor-pointer flex-col">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-700">
          <Scale className="text-ki-green cyber-icon glow-ki h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Today's Weight</h3>
          <p className="font-mono text-xs text-gray-400">Current status</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {todayWeight ? (
          <div className="flex flex-1 flex-col justify-center space-y-4">
            {/* Large weight display */}
            <div className="text-center">
              <div className="metric-large gradient-text-ki metric-display">
                {todayWeight.kg}
                <span className="font-inter ml-1 text-lg text-gray-400">
                  kg
                </span>
              </div>
            </div>

            {/* Trend comparison */}
            {trend && (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 p-3">
                {trend.type === 'up' && (
                  <>
                    <TrendingUp className="cyber-icon h-4 w-4 text-red-400" />
                    <span className="font-mono text-sm text-red-400">
                      +{trend.diff.toFixed(1)}kg from yesterday
                    </span>
                  </>
                )}
                {trend.type === 'down' && (
                  <>
                    <TrendingDown className="text-ki-green cyber-icon glow-ki h-4 w-4" />
                    <span className="text-ki-green font-mono text-sm">
                      -{trend.diff.toFixed(1)}kg from yesterday
                    </span>
                  </>
                )}
                {trend.type === 'stable' && (
                  <>
                    <Minus className="text-plasma-cyan cyber-icon glow-cyan h-4 w-4" />
                    <span className="text-plasma-cyan font-mono text-sm">
                      No change from yesterday
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="mt-auto text-center font-mono text-xs text-gray-400">
              Recorded on {new Date(todayWeight.dateISO).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-gray-700 bg-gray-900">
              <Scale className="cyber-icon h-8 w-8 text-gray-600" />
            </div>
            <div>
              <div className="font-inter mb-2 text-gray-400">
                No weight logged today
              </div>
              <div className="text-ki-green cursor-pointer font-mono text-sm">
                → Tap to log your weight
              </div>
            </div>

            {yesterdayWeight && (
              <div className="mt-auto rounded-lg border border-gray-700 bg-gray-900 p-3">
                <div className="font-mono text-xs text-gray-500">
                  Yesterday:{' '}
                  <span className="text-gray-300">{yesterdayWeight.kg}kg</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
