import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useNavigate } from 'react-router-dom'
import { useWeightStore } from '@/modules/weight/store'
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function TodayWeightCard() {
  const navigate = useNavigate()
  const { weights, isLoading } = useWeightStore()

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  // Find today's weight entry
  const todayWeight = weights.find(w => w.dateISO === today)
  
  // Find yesterday's weight for trend
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayISO = yesterday.toISOString().split('T')[0]
  const yesterdayWeight = weights.find(w => w.dateISO === yesterdayISO)

  // Calculate trend
  let trend = null
  let trendText = ''
  if (todayWeight && yesterdayWeight) {
    const diff = todayWeight.kg - yesterdayWeight.kg
    if (diff > 0.1) {
      trend = 'up'
      trendText = `+${diff.toFixed(1)} kg from yesterday`
    } else if (diff < -0.1) {
      trend = 'down'
      trendText = `${diff.toFixed(1)} kg from yesterday`
    } else {
      trend = 'same'
      trendText = 'Same as yesterday'
    }
  }

  const handleClick = () => {
    navigate('/weight')
  }

  if (isLoading) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4" />
            Today's Weight
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
          <Scale className="h-4 w-4" />
          Today's Weight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayWeight ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {todayWeight.kg.toFixed(1)} kg
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${
                trend === 'up' ? 'text-red-500' : 
                trend === 'down' ? 'text-green-500' : 
                'text-muted-foreground'
              }`}>
                {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {trend === 'same' && <Minus className="h-3 w-3" />}
                {trendText}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {new Date(todayWeight.dateISO).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-muted-foreground">
              No weight logged today
            </div>
            <div className="text-sm text-primary">
              Tap to add your weight
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 