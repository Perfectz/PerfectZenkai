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
      className="cyber-card transition-cyber flex h-full cursor-pointer flex-col"
      onClick={handleClick}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-700">
          <StreakIcon className={`h-5 w-5 ${getStreakColor()}`} />
        </div>
        <div>
          <h3 className="font-semibold text-white">Momentum</h3>
          <p className="font-mono text-xs text-gray-400">Daily streak</p>
        </div>
      </div>

      <div className="space-y-4 text-center">
        {/* Large streak display */}
        <div className="relative">
          <div className="gradient-text-ki font-cyber mb-2 text-4xl font-bold">
            {streakDays}
          </div>
          <div className="font-mono text-sm text-gray-400">
            {streakDays === 1 ? 'DAY' : 'DAYS'}
          </div>

          {/* Streak glow effect */}
          {streakDays > 0 && (
            <div className="absolute inset-0 -z-10">
              <div
                className={`mx-auto h-16 w-16 rounded-full ${
                  streakDays >= 30
                    ? 'magenta-glow'
                    : streakDays >= 7
                      ? 'cyan-glow'
                      : 'ki-glow-soft'
                } opacity-20`}
              ></div>
            </div>
          )}
        </div>

        {/* Motivational message */}
        <div className="space-y-2">
          <div className="font-inter text-sm text-gray-300">
            {getStreakMessage()}
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-1">
            {[1, 7, 14, 21, 30].map((milestone) => (
              <div
                key={milestone}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  streakDays >= milestone
                    ? 'bg-ki-green ki-glow-soft'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>

          <div className="font-mono text-xs text-gray-500">
            Next milestone:{' '}
            {streakDays < 1
              ? '1 day'
              : streakDays < 7
                ? '7 days'
                : streakDays < 14
                  ? '14 days'
                  : streakDays < 21
                    ? '21 days'
                    : streakDays < 30
                      ? '30 days'
                      : 'Master level!'}
          </div>
        </div>

        {streakDays === 0 && (
          <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900 p-3">
            <div className="text-ki-green font-mono text-xs">
              Log weight or complete tasks daily to build your streak
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
