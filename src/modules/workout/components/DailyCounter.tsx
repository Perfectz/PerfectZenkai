import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { 
  Zap, 
  RotateCcw, 
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react'
import { useTouchFeedback, useResponsiveBreakpoint } from '@/shared/hooks/useMobileInteractions'

interface DailyCounterData {
  date: string
  punches: number
  kicks: number
  total: number
}

export function DailyCounter() {
  const [todayData, setTodayData] = useState<DailyCounterData>({
    date: new Date().toDateString(),
    punches: 0,
    kicks: 0,
    total: 0
  })
  
  const [weeklyTotal, setWeeklyTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  
  // Mobile interactions
  const { isMobile } = useResponsiveBreakpoint()
  const buttonFeedback = useTouchFeedback<HTMLButtonElement>({ 
    scale: 0.95, 
    haptic: true 
  })

  // Load data from localStorage on mount
  useEffect(() => {
    loadTodayData()
    loadWeeklyStats()
  }, [])

  const loadTodayData = () => {
    const today = new Date().toDateString()
    const saved = localStorage.getItem(`daily-counter-${today}`)
    
    if (saved) {
      const data = JSON.parse(saved)
      setTodayData(data)
    } else {
      // Initialize today's data
      const newData = {
        date: today,
        punches: 0,
        kicks: 0,
        total: 0
      }
      setTodayData(newData)
      localStorage.setItem(`daily-counter-${today}`, JSON.stringify(newData))
    }
  }

  const loadWeeklyStats = () => {
    const today = new Date()
    let weekTotal = 0
    let currentStreak = 0
    
    // Calculate weekly total (last 7 days)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toDateString()
      const dayData = localStorage.getItem(`daily-counter-${dateStr}`)
      
      if (dayData) {
        const parsed = JSON.parse(dayData)
        weekTotal += parsed.total
        
        // Calculate streak (consecutive days with activity)
        if (parsed.total > 0) {
          if (i === currentStreak) {
            currentStreak++
          }
        }
      }
    }
    
    setWeeklyTotal(weekTotal)
    setStreak(currentStreak)
  }

  const updateCount = (type: 'punches' | 'kicks', increment: number) => {
    const newData = {
      ...todayData,
      [type]: todayData[type] + increment,
      total: todayData.total + increment
    }
    
    setTodayData(newData)
    localStorage.setItem(`daily-counter-${newData.date}`, JSON.stringify(newData))
    
    // Update weekly stats
    loadWeeklyStats()
  }

  const resetToday = () => {
    const resetData = {
      date: todayData.date,
      punches: 0,
      kicks: 0,
      total: 0
    }
    
    setTodayData(resetData)
    localStorage.setItem(`daily-counter-${resetData.date}`, JSON.stringify(resetData))
    loadWeeklyStats()
  }

  const incrementButtons = [5, 10, 25]

  return (
    <Card className={`cyber-card mobile-card mobile-responsive ${isMobile ? 'galaxy-s24-ultra-optimized' : ''}`}>
      <CardHeader className="mobile-layout">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 gradient-text-ki mobile-heading">
            <Zap className="h-5 w-5" />
            Daily Strike Counter
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToday}
            className="text-xs touch-target mobile-button"
            aria-label="Reset daily counter"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 mobile-form-spacing">
        {/* Today's Totals */}
        <div className="grid grid-cols-3 gap-4 text-center mobile-grid">
          <div>
            <div className="gradient-text-ki metric-display text-2xl font-bold mobile-large">
              {todayData.punches}
            </div>
            <div className="font-mono text-xs text-gray-400 mobile-caption">Punches</div>
          </div>
          <div>
            <div className="gradient-text-cyan metric-display text-2xl font-bold mobile-large">
              {todayData.kicks}
            </div>
            <div className="font-mono text-xs text-gray-400 mobile-caption">Kicks</div>
          </div>
          <div>
            <div className="gradient-text-magenta metric-display text-2xl font-bold mobile-large">
              {todayData.total}
            </div>
            <div className="font-mono text-xs text-gray-400 mobile-caption">Total</div>
          </div>
        </div>

        {/* Punch Counter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm gradient-text-ki">👊 Punches</h3>
            <Badge variant="outline" className="text-ki-green border-ki-green">
              {todayData.punches}
            </Badge>
          </div>
          <div className="flex gap-2 mobile-button-group">
            {incrementButtons.map((count) => (
              <Button
                key={`punch-${count}`}
                ref={buttonFeedback.elementRef}
                variant="outline"
                size="sm"
                onClick={() => updateCount('punches', count)}
                className="flex-1 cyber-button-ki touch-target mobile-button"
                aria-label={`Add ${count} punches`}
              >
                +{count}
              </Button>
            ))}
          </div>
        </div>

        {/* Kick Counter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm gradient-text-cyan">🦵 Kicks</h3>
            <Badge variant="outline" className="text-plasma-cyan border-plasma-cyan">
              {todayData.kicks}
            </Badge>
          </div>
          <div className="flex gap-2 mobile-button-group">
            {incrementButtons.map((count) => (
              <Button
                key={`kick-${count}`}
                variant="outline"
                size="sm"
                onClick={() => updateCount('kicks', count)}
                className="flex-1 cyber-button-cyan touch-target mobile-button"
                aria-label={`Add ${count} kicks`}
              >
                +{count}
              </Button>
            ))}
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="border-t border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-mono text-xs text-gray-400">7-Day Total</span>
              </div>
              <div className="gradient-text-yellow metric-display text-lg font-bold">
                {weeklyTotal}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="font-mono text-xs text-gray-400">Streak</span>
              </div>
              <div className="gradient-text-plasma metric-display text-lg font-bold">
                {streak} days
              </div>
            </div>
          </div>
        </div>

        {/* Quick Goals */}
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-gray-400" />
            <span className="font-mono text-xs text-gray-400">Daily Goals</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`text-center p-2 rounded ${todayData.total >= 100 ? 'bg-ki-green/20 text-ki-green' : 'bg-gray-700/50 text-gray-400'}`}>
              <div className="font-bold">100</div>
              <div>Beginner</div>
            </div>
            <div className={`text-center p-2 rounded ${todayData.total >= 250 ? 'bg-plasma-cyan/20 text-plasma-cyan' : 'bg-gray-700/50 text-gray-400'}`}>
              <div className="font-bold">250</div>
              <div>Intermediate</div>
            </div>
            <div className={`text-center p-2 rounded ${todayData.total >= 500 ? 'bg-plasma-magenta/20 text-plasma-magenta' : 'bg-gray-700/50 text-gray-400'}`}>
              <div className="font-bold">500</div>
              <div>Advanced</div>
            </div>
          </div>
        </div>

        {/* Today's Date */}
        <div className="text-center">
          <div className="font-mono text-xs text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 