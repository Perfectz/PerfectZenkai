import * as React from "react"
import { cn } from "@/shared/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: 'default' | 'cyber' | 'ring'
  size?: 'sm' | 'md' | 'lg'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = 'default', size = 'md', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    }

    if (variant === 'ring') {
      const radius = size === 'lg' ? 40 : size === 'md' ? 32 : 24
      const strokeWidth = size === 'lg' ? 6 : size === 'md' ? 4 : 3
      const circumference = 2 * Math.PI * radius
      const strokeDashoffset = circumference - (percentage / 100) * circumference
      const svgSize = (radius + strokeWidth) * 2

      return (
        <div className={cn("relative", className)} ref={ref} {...props}>
          <svg width={svgSize} height={svgSize} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke="rgb(51, 65, 85)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress ring with gradient */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--ki-green)" />
                <stop offset="100%" stopColor="var(--plasma-cyan)" />
              </linearGradient>
            </defs>
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(34, 255, 183, 0.3))'
              }}
            />
          </svg>
          {/* Center content slot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold gradient-text-ki font-cyber">
                {Math.round(percentage)}%
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (variant === 'cyber') {
      return (
        <div 
          className={cn(
            "relative w-full overflow-hidden rounded-lg bg-gray-900 border border-gray-700",
            sizeClasses[size],
            className
          )}
          ref={ref}
          {...props}
        >
          <div
            className="h-full transition-all duration-500 ease-out relative"
            style={{ 
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, var(--ki-green), var(--plasma-cyan))',
              boxShadow: '0 0 12px rgba(34, 255, 183, 0.3)'
            }}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 shimmer opacity-50"></div>
          </div>
          {/* Glow overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-ki-green/10 to-transparent"
            style={{ 
              transform: `translateX(${percentage - 100}%)`,
              transition: 'transform 500ms ease-out'
            }}
          ></div>
        </div>
      )
    }

    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-secondary",
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all duration-300"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress } 