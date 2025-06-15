import { useWeightStore } from '@/modules/weight'
import { kgToLbs } from '@/modules/weight/types'
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTouchFeedback, useResponsiveBreakpoint } from '@/shared/hooks/useMobileInteractions'

export function WeightSparkCard() {
  const navigate = useNavigate()
  const { weights, isLoading } = useWeightStore()
  
  // Mobile interactions
  const { isMobile } = useResponsiveBreakpoint()
  const cardFeedback = useTouchFeedback<HTMLDivElement>({ 
    scale: 0.98, 
    haptic: true 
  })

  // Get last 30 days of weight data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentWeights = weights
    .filter((w) => {
      const weightDate = new Date(w.dateISO)
      return weightDate >= thirtyDaysAgo
    })
    .slice(0, 30) // Limit to 30 entries

  const handleClick = () => {
    navigate('/weight')
  }

  // Calculate trend for the period
  const getTrend = () => {
    if (recentWeights.length < 2) return null
    const oldest = recentWeights[recentWeights.length - 1]
    const newest = recentWeights[0]
    const diff = newest.kg - oldest.kg

    if (Math.abs(diff) < 0.1) return { type: 'stable', diff: 0 }
    return {
      type: diff > 0 ? 'up' : 'down',
      diff: Math.abs(diff),
      days: recentWeights.length,
    }
  }

  const trend = getTrend()

  if (isLoading) {
    return (
      <div className="cyber-card cursor-pointer mobile-card mobile-responsive">
        <div className="mb-4 flex items-center gap-3 mobile-layout">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-700 touch-target">
            <BarChart3 className="text-ki-green cyber-icon h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white mobile-heading">Weight Trend</h3>
            <p className="font-mono text-xs text-gray-400 mobile-caption">Loading...</p>
          </div>
        </div>
        <div className="flex h-16 items-center justify-center">
          <div className="shimmer h-8 w-full rounded bg-gray-700"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={cardFeedback.elementRef}
      className={`cyber-card flex h-full cursor-pointer flex-col transition-all duration-200 mobile-card mobile-responsive touch-friendly ${isMobile ? 'galaxy-s24-ultra-optimized' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Weight trend card - view full weight history"
    >
      <div className="mb-4 flex items-center gap-3 mobile-layout">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-700 touch-target">
          <BarChart3 className="text-ki-green cyber-icon glow-ki h-5 w-5 transition-all duration-200" />
        </div>
        <div>
          <h3 className="font-semibold text-white mobile-heading">Weight Trend</h3>
          <p className="font-mono text-xs text-gray-400 mobile-caption">30-day analysis</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {recentWeights.length > 0 ? (
          <div className="flex flex-1 flex-col space-y-4">
            {/* Mini sparkline visualization */}
            <div className="relative h-12 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
              <div className="absolute inset-0 p-2">
                <svg viewBox="0 0 100 20" className="h-full w-full">
                  <defs>
                    <linearGradient
                      id="sparklineGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="var(--ki-green)" />
                      <stop offset="100%" stopColor="var(--plasma-cyan)" />
                    </linearGradient>
                  </defs>

                  {recentWeights.length > 1 && (
                    <polyline
                      points={recentWeights
                        .slice(0, 10) // Show last 10 points for simplicity
                        .map((w, i) => {
                          const x =
                            (i / (Math.min(recentWeights.length, 10) - 1)) * 100
                          const minWeight = Math.min(
                            ...recentWeights.slice(0, 10).map((w) => w.kg)
                          )
                          const maxWeight = Math.max(
                            ...recentWeights.slice(0, 10).map((w) => w.kg)
                          )
                          const range = maxWeight - minWeight || 1
                          const y = 20 - ((w.kg - minWeight) / range) * 16
                          return `${x},${y}`
                        })
                        .join(' ')}
                      fill="none"
                      stroke="url(#sparklineGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="cyber-glow"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Trend summary */}
            <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 p-3">
              <div className="flex items-center gap-2">
                {trend && trend.type === 'up' && (
                  <TrendingUp className="cyber-icon h-4 w-4 text-red-400" />
                )}
                {trend && trend.type === 'down' && (
                  <TrendingDown className="text-ki-green cyber-icon glow-ki h-4 w-4" />
                )}
                {trend && trend.type === 'stable' && (
                  <Minus className="text-plasma-cyan cyber-icon glow-cyan h-4 w-4" />
                )}

                <div>
                  <div className="font-mono text-sm text-white mobile-small">
                    {trend
                      ? trend.type === 'stable'
                        ? 'Stable'
                        : `${trend.type === 'up' ? '+' : '-'}${kgToLbs(trend.diff).toFixed(1)}lbs`
                      : 'No trend data'}
                  </div>
                  <div className="text-xs text-gray-400 mobile-caption">
                    {recentWeights.length} entries
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="gradient-text-ki font-mono text-sm font-semibold mobile-small">
                  {kgToLbs(recentWeights[0]?.kg || 0).toFixed(1)}lbs
                </div>
                <div className="text-xs text-gray-400 mobile-caption">current</div>
              </div>
            </div>

            <div className="mt-auto text-center font-mono text-xs text-gray-400">
              → Tap to view full weight history
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-gray-700 bg-gray-900">
              <BarChart3 className="cyber-icon h-8 w-8 text-gray-600" />
            </div>
            <div>
              <div className="font-inter mb-2 text-gray-400">
                No weight data available
              </div>
              <div className="text-ki-green cursor-pointer font-mono text-sm">
                → Start tracking to see trends
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
