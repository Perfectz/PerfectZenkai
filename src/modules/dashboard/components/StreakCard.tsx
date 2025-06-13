import { Flame, Zap, Star } from 'lucide-react'

export function StreakCard() {
  // TODO: Implement actual streak calculation logic
  // This will track consecutive days of weight logging or task completion
  const streakDays: number = 0

  const handleClick = () => {
    // TODO: Navigate to streak/stats page when implemented
    console.log('Streak card clicked - future enhancement')
  }

  const getStreakIcon = () => {
    if (streakDays >= 30) return Star
    if (streakDays >= 7) return Zap
    return Flame
  }

  const getStreakMessage = () => {
    if (streakDays === 0) return 'Begin your cyber journey'
    if (streakDays < 7) return 'Building momentum...'
    if (streakDays < 30) return 'Cyber warrior rising!'
    return 'Master ninja achieved!'
  }

  const getStreakColor = () => {
    if (streakDays >= 30) return 'text-hyper-magenta'
    if (streakDays >= 7) return 'text-plasma-cyan'
    return 'text-ki-green'
  }

  const StreakIcon = getStreakIcon()

  return (
    <div 
      className="cyber-card cursor-pointer transition-cyber h-full flex flex-col"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
          <StreakIcon className={`h-5 w-5 ${getStreakColor()}`} />
        </div>
        <div>
          <h3 className="font-semibold text-white">Momentum</h3>
          <p className="text-xs text-gray-400 font-mono">Daily streak</p>
        </div>
      </div>
      
      <div className="space-y-4 text-center">
        {/* Large streak display */}
        <div className="relative">
          <div className="text-4xl font-bold gradient-text-ki font-cyber mb-2">
            {streakDays}
          </div>
          <div className="text-sm text-gray-400 font-mono">
            {streakDays === 1 ? 'DAY' : 'DAYS'}
          </div>
          
          {/* Streak glow effect */}
          {streakDays > 0 && (
            <div className="absolute inset-0 -z-10">
              <div className={`w-16 h-16 mx-auto rounded-full ${
                streakDays >= 30 ? 'magenta-glow' : 
                streakDays >= 7 ? 'cyan-glow' : 
                'ki-glow-soft'
              } opacity-20`}></div>
            </div>
          )}
        </div>
        
        {/* Motivational message */}
        <div className="space-y-2">
          <div className="text-sm text-gray-300 font-inter">
            {getStreakMessage()}
          </div>
          
          {/* Progress indicators */}
          <div className="flex justify-center gap-1">
            {[1, 7, 14, 21, 30].map((milestone) => (
              <div
                key={milestone}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  streakDays >= milestone
                    ? 'bg-ki-green ki-glow-soft'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          
          <div className="text-xs text-gray-500 font-mono">
            Next milestone: {
              streakDays < 1 ? '1 day' :
              streakDays < 7 ? '7 days' :
              streakDays < 14 ? '14 days' :
              streakDays < 21 ? '21 days' :
              streakDays < 30 ? '30 days' :
              'Master level!'
            }
          </div>
        </div>
        
        {streakDays === 0 && (
          <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-xs text-ki-green font-mono">
              Log weight or complete tasks daily to build your streak
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 