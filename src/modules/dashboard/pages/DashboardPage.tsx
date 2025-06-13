import { useEffect, useState } from 'react'
import { useWeightStore } from '@/modules/weight/store'
import { useTasksStore } from '@/modules/tasks/store'
import { WeightSparkCard } from '../components/WeightSparkCard'
import { TodayWeightCard } from '../components/TodayWeightCard'
import { TodoSummaryCard } from '../components/TodoSummaryCard'
import { StreakCard } from '../components/StreakCard'
import { DataExportCard } from '../components/DataExportCard'
import { DashboardSkeleton } from '@/shared/ui/skeleton'
import headerVideo from '../../../assets/videos/header.webm'

export default function DashboardPage() {
  const { loadWeights, isLoading: weightLoading } = useWeightStore()
  const { loadTodos, isLoading: todoLoading } = useTasksStore()
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    // Load data for both modules when dashboard loads
    const loadData = async () => {
      await Promise.all([loadWeights(), loadTodos()])
      setIsInitialLoading(false)
    }

    loadData()
  }, [loadWeights, loadTodos])

  // Show skeleton during initial load
  if (isInitialLoading || (weightLoading && todoLoading)) {
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
    <div className="container mx-auto px-4 pb-24 pt-4">
      {/* Cyber-styled header */}
      <div className="mb-8">
        <h1 className="cyber-title gradient-text-ki mb-2">CONTROL NEXUS</h1>
        <p className="font-mono text-sm text-gray-400">
          Mission Status Overview
        </p>
      </div>

      {/* Header Video with cyber frame */}
      <div className="relative mb-8 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
        <video
          className="h-auto max-h-[300px] w-full object-cover"
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
        <div className="border-ki-green absolute left-4 top-4 h-4 w-4 border-l-2 border-t-2"></div>
        <div className="border-ki-green absolute right-4 top-4 h-4 w-4 border-r-2 border-t-2"></div>
        <div className="border-ki-green absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2"></div>
        <div className="border-ki-green absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2"></div>
      </div>

      {/* Enhanced responsive grid layout with uniform card heights */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {/* Priority cards first */}
        <div className="h-80 sm:col-span-1">
          <TodayWeightCard />
        </div>

        <div className="h-80 sm:col-span-1">
          <TodoSummaryCard />
        </div>

        {/* Secondary cards */}
        <div className="h-80 sm:col-span-1 lg:col-span-1">
          <WeightSparkCard />
        </div>

        <div className="h-80 sm:col-span-1 lg:col-span-1 xl:col-span-1">
          <StreakCard />
        </div>

        {/* Full width on mobile, spans remaining space on desktop */}
        <div className="h-80 sm:col-span-2 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
          <DataExportCard />
        </div>
      </div>

      {/* Cyber grid lines for aesthetic */}
      <div className="via-ki-green/20 mt-12 h-px bg-gradient-to-r from-transparent to-transparent"></div>

      {/* Status indicator */}
      <div className="mt-6 text-center">
        <p className="font-mono text-xs text-gray-500">
          System Status: <span className="text-ki-green">OPERATIONAL</span>
        </p>
      </div>
    </div>
  )
}
