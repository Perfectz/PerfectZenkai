import { useWeightStore } from '@/modules/weight'
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function TodayWeightCard() {
  const { weights, isLoading } = useWeightStore()

  // Get today's weight entry
  const today = new Date().toISOString().split('T')[0]
  const todayWeight = weights.find(w => w.dateISO === today)
  
  // Get yesterday's weight for comparison
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayISO = yesterday.toISOString().split('T')[0]
  const yesterdayWeight = weights.find(w => w.dateISO === yesterdayISO)

  // Calculate trend
  const getTrend = () => {
    if (!todayWeight || !yesterdayWeight) return null
    const diff = todayWeight.kg - yesterdayWeight.kg
    if (Math.abs(diff) < 0.1) return { type: 'stable', diff: 0 }
    return { 
      type: diff > 0 ? 'up' : 'down', 
      diff: Math.abs(diff) 
    }
  }

  const trend = getTrend()

  if (isLoading) {
    return (
      <div className="cyber-card cursor-pointer">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
            <Scale className="h-5 w-5 text-ki-green cyber-icon" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Today's Weight</h3>
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
      className="cyber-card cursor-pointer transition-cyber h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
          <Scale className="h-5 w-5 text-ki-green cyber-icon glow-ki" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Today's Weight</h3>
          <p className="text-xs text-gray-400 font-mono">Current status</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {todayWeight ? (
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Large weight display */}
            <div className="text-center">
              <div className="metric-large gradient-text-ki metric-display">
                {todayWeight.kg}
                <span className="text-lg text-gray-400 ml-1 font-inter">kg</span>
              </div>
            </div>
            
            {/* Trend comparison */}
            {trend && (
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                {trend.type === 'up' && (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-400 cyber-icon" />
                    <span className="text-sm font-mono text-red-400">
                      +{trend.diff.toFixed(1)}kg from yesterday
                    </span>
                  </>
                )}
                {trend.type === 'down' && (
                  <>
                    <TrendingDown className="h-4 w-4 text-ki-green cyber-icon glow-ki" />
                    <span className="text-sm font-mono text-ki-green">
                      -{trend.diff.toFixed(1)}kg from yesterday
                    </span>
                  </>
                )}
                {trend.type === 'stable' && (
                  <>
                    <Minus className="h-4 w-4 text-plasma-cyan cyber-icon glow-cyan" />
                    <span className="text-sm font-mono text-plasma-cyan">
                      No change from yesterday
                    </span>
                  </>
                )}
              </div>
            )}
            
            <div className="text-xs text-gray-400 text-center font-mono mt-auto">
              Recorded on {new Date(todayWeight.dateISO).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center flex-1 flex flex-col justify-center">
            <div className="w-16 h-16 mx-auto rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center">
              <Scale className="h-8 w-8 text-gray-600 cyber-icon" />
            </div>
            <div>
              <div className="text-gray-400 mb-2 font-inter">
                No weight logged today
              </div>
              <div className="text-sm text-ki-green font-mono cursor-pointer">
                → Tap to log your weight
              </div>
            </div>
            
            {yesterdayWeight && (
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 mt-auto">
                <div className="text-xs text-gray-500 font-mono">
                  Yesterday: <span className="text-gray-300">{yesterdayWeight.kg}kg</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 