import { useTasksStore } from '@/modules/tasks'
import { StatusChip } from '@/shared/ui/status-chip'
import { CheckSquare, Circle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Progress } from '@/shared/ui/progress'

export function TodoSummaryCard() {
  const navigate = useNavigate()
  const { todos, isLoading } = useTasksStore()

  const totalTodos = todos.length
  const completedTodos = todos.filter(todo => todo.done).length
  const incompleteTodos = totalTodos - completedTodos
  const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  const handleClick = () => {
    navigate('/todo')
  }

  if (isLoading) {
    return (
      <div className="cyber-card cursor-pointer">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
            <Clock className="h-5 w-5 text-ki-green cyber-icon" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Quest Progress</h3>
            <p className="text-xs text-gray-400 font-mono">Loading...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-24">
          <div className="shimmer w-20 h-20 rounded-full bg-gray-700"></div>
        </div>
      </div>
    )
  }

  const getProgressStatus = () => {
    if (totalTodos === 0) return 'pending'
    if (progressPercentage === 100) return 'success'
    if (progressPercentage >= 75) return 'active'
    if (progressPercentage >= 50) return 'info'
    return 'warning'
  }

  return (
    <div 
      className="cyber-card cursor-pointer transition-cyber h-full flex flex-col"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
          <Clock className="h-5 w-5 text-ki-green cyber-icon glow-ki" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Quest Progress</h3>
          <p className="text-xs text-gray-400 font-mono">Today's missions</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {totalTodos > 0 ? (
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Progress ring */}
            <div className="flex items-center justify-center">
              <Progress 
                value={progressPercentage} 
                variant="ring" 
                size="lg"
                className="w-24 h-24"
              />
            </div>
            
            {/* Stats breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CheckSquare className="h-4 w-4 text-ki-green cyber-icon" />
                  <span className="text-sm font-mono text-ki-green">Done</span>
                </div>
                <div className="metric-medium gradient-text-ki">{completedTodos}</div>
              </div>
              
              <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Circle className="h-4 w-4 text-gray-400 cyber-icon" />
                  <span className="text-sm font-mono text-gray-400">Left</span>
                </div>
                <div className="metric-medium text-gray-300">{incompleteTodos}</div>
              </div>
            </div>
            
            {/* Status chip */}
            <div className="flex justify-center mt-auto">
              <StatusChip variant={getProgressStatus()} size="md">
                {progressPercentage === 100 ? 'Complete!' : 
                 progressPercentage >= 75 ? 'Almost done' :
                 progressPercentage >= 50 ? 'Making progress' :
                 progressPercentage > 0 ? 'Getting started' : 'Ready to begin'}
              </StatusChip>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center flex-1 flex flex-col justify-center">
            <div className="w-16 h-16 mx-auto rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center">
              <Clock className="h-8 w-8 text-gray-600 cyber-icon" />
            </div>
            <div>
              <div className="text-gray-400 mb-2 font-inter">
                No quests active
              </div>
              <div className="text-sm text-ki-green font-mono cursor-pointer">
                → Tap to create your first quest
              </div>
            </div>
            
            <div className="mt-auto">
              <StatusChip variant="pending" size="md">
                Awaiting missions
              </StatusChip>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 