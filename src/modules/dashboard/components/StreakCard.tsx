import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Flame } from 'lucide-react'

export function StreakCard() {
  // TODO: Implement actual streak calculation logic
  // This will track consecutive days of weight logging or task completion
  const streakDays = 0

  const handleClick = () => {
    // TODO: Navigate to streak/stats page when implemented
    console.log('Streak card clicked - future enhancement')
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl"
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4" />
          Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {streakDays} days
          </div>
          <div className="text-sm text-muted-foreground">
            {streakDays === 0 ? 'Start your streak today!' : 'Keep it going!'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 