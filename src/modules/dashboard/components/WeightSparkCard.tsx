import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useNavigate } from 'react-router-dom'
import { useWeightStore } from '@/modules/weight/store'
import { BarChart3 } from 'lucide-react'

export function WeightSparkCard() {
  const navigate = useNavigate()
  const { weights, isLoading } = useWeightStore()

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

  // Simple trend calculation
  const getTrend = () => {
    if (recentWeights.length < 2) return null
    
    const first = recentWeights[recentWeights.length - 1].kg
    const last = recentWeights[0].kg
    const diff = last - first
    
    if (Math.abs(diff) < 0.1) return 'stable'
    return diff > 0 ? 'up' : 'down'
  }

  const trend = getTrend()

  if (isLoading) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Weight Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl"
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Weight Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentWeights.length > 0 ? (
          <div className="space-y-3">
            {/* Simple visual representation */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Last 30 days
              </div>
              <div className={`text-sm font-medium ${
                trend === 'up' ? 'text-red-500' : 
                trend === 'down' ? 'text-green-500' : 
                'text-muted-foreground'
              }`}>
                {trend === 'up' && '↗ Trending up'}
                {trend === 'down' && '↘ Trending down'}
                {trend === 'stable' && '→ Stable'}
              </div>
            </div>
            
            {/* Simple dot visualization */}
            <div className="flex items-center gap-1 h-8">
              {recentWeights.slice(0, 15).reverse().map((weight, index) => {
                const isRecent = index >= recentWeights.length - 7
                return (
                  <div
                    key={weight.id}
                    className={`w-1 h-1 rounded-full ${
                      isRecent ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )
              })}
            </div>

            <div className="text-xs text-muted-foreground">
              {recentWeights.length} entries • Tap for details
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-muted-foreground">
              No weight data yet
            </div>
            <div className="text-sm text-primary">
              Tap to start tracking
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 