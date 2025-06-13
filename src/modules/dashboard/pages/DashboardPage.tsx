import { useEffect, useState } from 'react'
import { useWeightStore } from '@/modules/weight/store'
import { useTasksStore } from '@/modules/tasks/store'
import { WeightSparkCard } from '../components/WeightSparkCard'
import { TodayWeightCard } from '../components/TodayWeightCard'
import { TodoSummaryCard } from '../components/TodoSummaryCard'
import { StreakCard } from '../components/StreakCard'
import { DataExportCard } from '../components/DataExportCard'
import { DashboardSkeleton } from '@/shared/ui/skeleton'
import headerVideo from '../../../assets/videos/header.mp4'

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
          <div className="w-32 h-8 bg-gray-700 rounded shimmer mb-6"></div>
        </div>
        
        {/* Header video skeleton */}
        <div className="mb-8 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 h-48 shimmer"></div>
        
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pb-24 pt-4">
      {/* Cyber-styled header */}
      <div className="mb-8">
        <h1 className="cyber-title gradient-text-ki mb-2">CONTROL NEXUS</h1>
        <p className="text-gray-400 font-mono text-sm">Mission Status Overview</p>
      </div>
      
      {/* Header Video with cyber frame */}
      <div className="mb-8 rounded-xl overflow-hidden bg-gray-900 border border-gray-700 relative shadow-2xl">
        <video
          className="w-full h-auto max-h-[300px] object-cover"
          autoPlay
          muted
          loop
          playsInline
          src={headerVideo}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Cyber overlay frame */}
        <div className="absolute inset-0 border-2 border-ki-green/20 rounded-xl pointer-events-none"></div>
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-ki-green"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-ki-green"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-ki-green"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-ki-green"></div>
      </div>
      
      {/* Enhanced responsive grid layout with uniform card heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {/* Priority cards first */}
        <div className="sm:col-span-1 h-80">
          <TodayWeightCard />
        </div>
        
        <div className="sm:col-span-1 h-80">
          <TodoSummaryCard />
        </div>
        
        {/* Secondary cards */}
        <div className="sm:col-span-1 lg:col-span-1 h-80">
          <WeightSparkCard />
        </div>
        
        <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 h-80">
          <StreakCard />
        </div>
        
        {/* Full width on mobile, spans remaining space on desktop */}
        <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1 2xl:col-span-1 h-80">
          <DataExportCard />
        </div>
      </div>
      
      {/* Cyber grid lines for aesthetic */}
      <div className="mt-12 h-px bg-gradient-to-r from-transparent via-ki-green/20 to-transparent"></div>
      
      {/* Status indicator */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 font-mono">
          System Status: <span className="text-ki-green">OPERATIONAL</span>
        </p>
      </div>
    </div>
  )
} 