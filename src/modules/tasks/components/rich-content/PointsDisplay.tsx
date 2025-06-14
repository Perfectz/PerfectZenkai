import { Star, TrendingUp } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'

interface PointsDisplayProps {
  points: number // Point value (1-10)
  size?: 'sm' | 'md' | 'lg'
  showStars?: boolean
  showLabel?: boolean
  showIcon?: boolean
  className?: string
}

export function PointsDisplay({
  points,
  size = 'md',
  showStars = true,
  showLabel = false,
  showIcon = true,
  className = '',
}: PointsDisplayProps) {
  const getPointConfig = (points: number) => {
    if (points <= 2) return { 
      color: 'text-gray-600', 
      bg: 'bg-gray-100', 
      label: 'Trivial',
      borderColor: 'border-gray-300' 
    }
    if (points <= 4) return { 
      color: 'text-green-700', 
      bg: 'bg-green-100', 
      label: 'Easy',
      borderColor: 'border-green-300' 
    }
    if (points <= 6) return { 
      color: 'text-blue-700', 
      bg: 'bg-blue-100', 
      label: 'Medium',
      borderColor: 'border-blue-300' 
    }
    if (points <= 8) return { 
      color: 'text-orange-700', 
      bg: 'bg-orange-100', 
      label: 'Hard',
      borderColor: 'border-orange-300' 
    }
    return { 
      color: 'text-purple-700', 
      bg: 'bg-purple-100', 
      label: 'Epic',
      borderColor: 'border-purple-300' 
    }
  }

  const config = getPointConfig(points)

  const renderStars = (points: number) => {
    const filledStars = Math.min(Math.ceil(points / 2), 5)
    const starSize = size === 'sm' ? 'h-2.5 w-2.5' : size === 'md' ? 'h-3 w-3' : 'h-3.5 w-3.5'
    
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < filledStars
                ? 'fill-current text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-sm',
    lg: 'px-2.5 py-1 text-sm',
  }

  const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : size === 'md' ? 'h-3 w-3' : 'h-3.5 w-3.5'

  return (
    <Badge
      variant="outline"
      className={`${sizeClasses[size]} ${config.bg} ${config.color} ${config.borderColor} border-current ${className}`}
    >
      {showIcon && <TrendingUp className={`mr-1 ${iconSize}`} />}
      <span className="font-medium">{points}</span>
      {showLabel && size !== 'sm' && (
        <span className="ml-1 opacity-75">{config.label}</span>
      )}
      {showStars && size !== 'sm' && (
        <div className="ml-1">
          {renderStars(points)}
        </div>
      )}
    </Badge>
  )
}

// Compact version for inline display
export function PointsBadge({ points, className = '' }: { points: number; className?: string }) {
  return (
    <PointsDisplay
      points={points}
      size="sm"
      showStars={false}
      showLabel={false}
      className={className}
    />
  )
}

// Full version with all details
export function PointsCard({ points, className = '' }: { points: number; className?: string }) {
  const config = PointsDisplay({
    points,
    size: 'lg',
    showStars: true,
    showLabel: true,
    className,
  })

  return config
} 