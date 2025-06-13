import * as React from "react"
import { cn } from "@/shared/lib/utils"
import { CheckCircle, AlertTriangle, XCircle, Info, Clock, Zap } from "lucide-react"

interface StatusChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'active'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  children: React.ReactNode
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-ki-green',
    border: 'border-ki-green',
    bg: 'bg-ki-green/10',
    glow: 'ki-glow-soft'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    border: 'border-yellow-400',
    bg: 'bg-yellow-400/10',
    glow: 'shadow-[0_0_8px_rgba(251,191,36,0.3)]'
  },
  error: {
    icon: XCircle,
    color: 'text-red-400',
    border: 'border-red-400',
    bg: 'bg-red-400/10',
    glow: 'shadow-[0_0_8px_rgba(239,68,68,0.3)]'
  },
  info: {
    icon: Info,
    color: 'text-plasma-cyan',
    border: 'border-plasma-cyan',
    bg: 'bg-plasma-cyan/10',
    glow: 'cyan-glow'
  },
  pending: {
    icon: Clock,
    color: 'text-gray-400',
    border: 'border-gray-400',
    bg: 'bg-gray-400/10',
    glow: ''
  },
  active: {
    icon: Zap,
    color: 'text-hyper-magenta',
    border: 'border-hyper-magenta',
    bg: 'bg-hyper-magenta/10',
    glow: 'magenta-glow'
  }
}

const StatusChip = React.forwardRef<HTMLDivElement, StatusChipProps>(
  ({ className, variant = 'info', size = 'md', showIcon = true, children, ...props }, ref) => {
    const config = statusConfig[variant]
    const Icon = config.icon

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs gap-1',
      md: 'px-3 py-1.5 text-sm gap-1.5',
      lg: 'px-4 py-2 text-base gap-2'
    }

    const iconSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4', 
      lg: 'h-5 w-5'
    }

    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border font-medium font-mono transition-all duration-200",
          sizeClasses[size],
          config.color,
          config.border,
          config.bg,
          config.glow,
          "hover:scale-105",
          className
        )}
        ref={ref}
        {...props}
      >
        {showIcon && (
          <Icon className={iconSizes[size]} />
        )}
        <span>{children}</span>
      </div>
    )
  }
)
StatusChip.displayName = "StatusChip"

export { StatusChip } 