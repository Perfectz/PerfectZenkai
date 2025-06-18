import { useEffect, useState } from 'react'
import { useWeightStore } from '@/modules/weight/store'
import { useTasksStore } from '@/modules/tasks/store'
import { useGoalsStore } from '@/modules/goals/store'
import { WeightSparkCard } from '../components/WeightSparkCard'
import { TodayWeightCard } from '../components/TodayWeightCard'
import { TodoSummaryCard } from '../components/TodoSummaryCard'
import { StreakCard } from '../components/StreakCard'
import { DataExportCard } from '../components/DataExportCard'
import { DashboardSkeleton } from '@/shared/ui/skeleton'
import { useResponsiveBreakpoint } from '@/shared/hooks/useMobileInteractions'
import headerVideo from '../../../assets/videos/header.webm'

export default function DashboardPage() {
  const { loadWeights, isLoading: weightLoading } = useWeightStore()
  const { loadTodos, isLoading: todoLoading } = useTasksStore()
  const { loadGoals, isLoading: goalsLoading } = useGoalsStore()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  // Mobile responsiveness
  const { isMobile } = useResponsiveBreakpoint()

  useEffect(() => {
    // Load data for both modules when dashboard loads
    const loadData = async () => {
      try {
        setIsInitialLoading(true)
        await Promise.all([
          loadTodos(),
          loadWeights(),
          loadGoals()
        ])
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadData()
  }, [loadTodos, loadWeights, loadGoals])

  // Show skeleton during initial load
  if (isInitialLoading || (weightLoading && todoLoading && goalsLoading)) {
    return (
      <div className="container mx-auto px-4 pb-24 pt-4">
        <div className="mb-6">
          <div className="shimmer mb-6 h-8 w-32 rounded bg-gray-700"></div>
        </div>

        {/* Header video skeleton */}
        <div className="shimmer mb-8 h-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-800"></div>

        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className={`container mx-auto px-4 pb-24 pt-4 mobile-safe-area ${isMobile ? 'mobile-layout' : ''}`}>
      {/* Cyber-styled header */}
      <div className="mb-6 sm:mb-8 mobile-layout">
        <h1 className="cyber-title gradient-text-ki mb-2 text-xl sm:text-2xl mobile-heading">CONTROL NEXUS</h1>
        <p className="font-mono text-sm text-gray-400 mobile-body">
          Mission Status Overview
        </p>
      </div>

      {/* Header Video with cyber frame - Mobile optimized */}
      <div className="relative mb-6 sm:mb-8 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
        <video
          className="h-auto max-h-[200px] sm:max-h-[300px] w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src={headerVideo}
        >
          Your browser does not support the video tag.
        </video>

        {/* Cyber overlay frame */}
        <div className="border-ki-green/20 pointer-events-none absolute inset-0 rounded-xl border-2"></div>
        <div className="border-ki-green absolute left-2 sm:left-4 top-2 sm:top-4 h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-t-2"></div>
        <div className="border-ki-green absolute right-2 sm:right-4 top-2 sm:top-4 h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-t-2"></div>
        <div className="border-ki-green absolute bottom-2 sm:bottom-4 left-2 sm:left-4 h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-l-2"></div>
        <div className="border-ki-green absolute bottom-2 sm:bottom-4 right-2 sm:right-4 h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-r-2"></div>
      </div>

      {/* Enhanced responsive grid layout with uniform card heights - Mobile optimized */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 sm:gap-6 mobile-grid ${isMobile ? 'mobile-stack' : ''}`}>
        {/* Priority cards first - Mobile stacked */}
        <div className={`${isMobile ? 'min-h-80' : 'h-80'} mobile-card ${isMobile ? 'mobile-responsive' : ''}`}>
          <TodayWeightCard />
        </div>

        <div className={`${isMobile ? 'min-h-80' : 'h-80'} mobile-card ${isMobile ? 'mobile-responsive' : ''}`}>
          <TodoSummaryCard />
        </div>

        {/* Secondary cards - Mobile responsive */}
        <div className={`${isMobile ? 'min-h-80' : 'h-80'} sm:col-span-1 lg:col-span-1 mobile-card ${isMobile ? 'mobile-responsive' : ''}`}>
          <WeightSparkCard />
        </div>

        <div className={`${isMobile ? 'min-h-80' : 'h-80'} sm:col-span-1 lg:col-span-1 xl:col-span-1 mobile-card ${isMobile ? 'mobile-responsive' : ''}`}>
          <StreakCard />
        </div>

        {/* Full width on mobile, spans remaining space on desktop */}
        <div className={`${isMobile ? 'min-h-80' : 'h-80'} sm:col-span-2 lg:col-span-1 xl:col-span-1 2xl:col-span-1 mobile-card ${isMobile ? 'mobile-responsive' : ''}`}>
          <DataExportCard />
        </div>
      </div>

      {/* Cyber grid lines for aesthetic - Hidden on mobile */}
      <div className="via-ki-green/20 mt-8 sm:mt-12 h-px bg-gradient-to-r from-transparent to-transparent hidden sm:block"></div>

      {/* Status indicator - Mobile optimized */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="font-mono text-xs text-gray-500">
          System Status: <span className="text-ki-green">OPERATIONAL</span>
        </p>
      </div>
    </div>
  )
}
