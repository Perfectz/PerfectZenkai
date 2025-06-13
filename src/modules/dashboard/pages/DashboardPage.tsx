import { useEffect } from 'react'
import { useWeightStore } from '@/modules/weight/store'
import { useTasksStore } from '@/modules/tasks/store'
import { WeightSparkCard } from '../components/WeightSparkCard'
import { TodayWeightCard } from '../components/TodayWeightCard'
import { TodoSummaryCard } from '../components/TodoSummaryCard'
import { StreakCard } from '../components/StreakCard'
import { DataExportCard } from '../components/DataExportCard'
import headerVideo from '@/assets/videos/header.mp4'

export default function DashboardPage() {
  const { loadWeights } = useWeightStore()
  const { loadTodos } = useTasksStore()

  useEffect(() => {
    // Load data for both modules when dashboard loads
    loadWeights()
    loadTodos()
  }, [loadWeights, loadTodos])

  return (
    <div className="container mx-auto px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Header Video */}
      <div className="mb-6 rounded-lg overflow-hidden bg-muted shadow-lg">
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
      </div>
      
      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* WeightSparkCard - Top left on desktop, first on mobile */}
        <WeightSparkCard />
        
        {/* TodayWeightCard - Top right on desktop, second on mobile */}
        <TodayWeightCard />
        
        {/* TodoSummaryCard - Bottom left on desktop, third on mobile */}
        <TodoSummaryCard />
        
        {/* StreakCard - Bottom right on desktop, fourth on mobile */}
        <StreakCard />
        
        {/* DataExportCard - Data backup functionality */}
        <DataExportCard />
      </div>
    </div>
  )
} 