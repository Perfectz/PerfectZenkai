import { useWeightStore } from '@/modules/weight'
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export function WeightSparkCard() {
  const navigate = useNavigate()
  const { weights, isLoading } = useWeightStore()
  const [isPressed, setIsPressed] = useState(false)

  // Get last 30 days of weight data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentWeights = weights.filter(w => {
    const weightDate = new Date(w.dateISO)
    return weightDate >= thirtyDaysAgo
  }).slice(0, 30) // Limit to 30 entries

  const handleClick = () => {
    navigate('/weight')
  }

  const handleTouchStart = () => setIsPressed(true)
  const handleTouchEnd = () => setIsPressed(false)

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
      days: recentWeights.length
    }
  }

  const trend = getTrend()

  if (isLoading) {
    return (
      <div className="cyber-card cursor-pointer">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-ki-green cyber-icon" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Weight Trend</h3>
            <p className="text-xs text-gray-400 font-mono">Loading...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-16">
          <div className="shimmer w-full h-8 rounded bg-gray-700"></div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`
        cyber-card cursor-pointer transition-all duration-200 h-full flex flex-col
        ${isPressed ? 'scale-95 shadow-inner' : 'hover:scale-[1.02]'}
        active:scale-95
      `}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
          <BarChart3 className={`
            h-5 w-5 text-ki-green cyber-icon glow-ki transition-all duration-200
            ${isPressed ? 'scale-90' : ''}
          `} />
        </div>
        <div>
          <h3 className="font-semibold text-white">Weight Trend</h3>
          <p className="text-xs text-gray-400 font-mono">30-day analysis</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {recentWeights.length > 0 ? (
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Mini sparkline visualization */}
            <div className="relative h-12 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <div className="absolute inset-0 p-2">
                <svg viewBox="0 0 100 20" className="w-full h-full">
                  <defs>
                    <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--ki-green)" />
                      <stop offset="100%" stopColor="var(--plasma-cyan)" />
                    </linearGradient>
                  </defs>
                  
                  {recentWeights.length > 1 && (
                    <polyline
                      points={recentWeights
                        .slice(0, 10) // Show last 10 points for simplicity
                        .map((w, i) => {
                          const x = (i / (Math.min(recentWeights.length, 10) - 1)) * 100
                          const minWeight = Math.min(...recentWeights.slice(0, 10).map(w => w.kg))
                          const maxWeight = Math.max(...recentWeights.slice(0, 10).map(w => w.kg))
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
            <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                {trend && trend.type === 'up' && (
                  <TrendingUp className="h-4 w-4 text-red-400 cyber-icon" />
                )}
                {trend && trend.type === 'down' && (
                  <TrendingDown className="h-4 w-4 text-ki-green cyber-icon glow-ki" />
                )}
                {trend && trend.type === 'stable' && (
                  <Minus className="h-4 w-4 text-plasma-cyan cyber-icon glow-cyan" />
                )}
                
                <div>
                  <div className="text-sm font-mono text-white">
                    {trend ? (
                      trend.type === 'stable' ? 'Stable' :
                      `${trend.type === 'up' ? '+' : '-'}${trend.diff.toFixed(1)}kg`
                    ) : 'No trend data'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {recentWeights.length} entries
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm gradient-text-ki font-mono font-semibold">
                  {recentWeights[0]?.kg || 0}kg
                </div>
                <div className="text-xs text-gray-400">current</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 text-center font-mono mt-auto">
              → Tap to view full weight history
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center flex-1 flex flex-col justify-center">
            <div className="w-16 h-16 mx-auto rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-gray-600 cyber-icon" />
            </div>
            <div>
              <div className="text-gray-400 mb-2 font-inter">
                No weight data available
              </div>
              <div className="text-sm text-ki-green font-mono cursor-pointer">
                → Start tracking to see trends
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 