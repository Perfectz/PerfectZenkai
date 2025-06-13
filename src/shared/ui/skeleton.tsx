import { cn } from "@/shared/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'cyber' | 'text' | 'circle'
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const variants = {
    default: 'animate-pulse rounded-md bg-gray-700',
    cyber: 'animate-pulse rounded-lg bg-gray-700 border border-gray-600 shimmer',
    text: 'animate-pulse rounded bg-gray-700 h-4',
    circle: 'animate-pulse rounded-full bg-gray-700'
  }

  return (
    <div
      className={cn(variants[variant], className)}
      {...props}
    />
  )
}

// Cyber-themed card skeleton
function CardSkeleton() {
  return (
    <div className="cyber-card">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-24 h-4" />
          <Skeleton variant="text" className="w-16 h-3" />
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
            <Skeleton variant="circle" className="w-8 h-8" />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" className="w-32 h-4" />
              <Skeleton variant="text" className="w-24 h-3" />
            </div>
            <Skeleton variant="text" className="w-16 h-6" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Dashboard skeleton grid
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="flex items-center justify-center mb-4">
        <Skeleton variant="circle" className="w-12 h-12" />
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" className="w-20 h-8 mx-auto" />
        <Skeleton variant="text" className="w-16 h-4 mx-auto" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton variant="cyber" className="h-8" />
          <Skeleton variant="cyber" className="h-8" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, ListSkeleton, DashboardSkeleton, MetricSkeleton } 