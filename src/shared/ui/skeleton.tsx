import { cn } from '@/shared/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'cyber' | 'text' | 'circle'
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const variants = {
    default: 'animate-pulse rounded-md bg-gray-700',
    cyber:
      'animate-pulse rounded-lg bg-gray-700 border border-gray-600 shimmer',
    text: 'animate-pulse rounded bg-gray-700 h-4',
    circle: 'animate-pulse rounded-full bg-gray-700',
  }

  return <div className={cn(variants[variant], className)} {...props} />
}

// Cyber-themed card skeleton
function CardSkeleton() {
  return (
    <div className="cyber-card">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton variant="circle" className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="cyber" className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton variant="cyber" className="h-12" />
          <Skeleton variant="cyber" className="h-12" />
        </div>
      </div>
    </div>
  )
}

// List item skeleton
function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cyber-card py-3">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" className="h-8 w-8" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-4 w-32" />
              <Skeleton variant="text" className="h-3 w-24" />
            </div>
            <Skeleton variant="text" className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Dashboard skeleton grid
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Metric skeleton with cyber styling
function MetricSkeleton() {
  return (
    <div className="cyber-card text-center">
      <div className="mb-4 flex items-center justify-center">
        <Skeleton variant="circle" className="h-12 w-12" />
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" className="mx-auto h-8 w-20" />
        <Skeleton variant="text" className="mx-auto h-4 w-16" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton variant="cyber" className="h-8" />
          <Skeleton variant="cyber" className="h-8" />
        </div>
      </div>
    </div>
  )
}

export {
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  DashboardSkeleton,
  MetricSkeleton,
}
