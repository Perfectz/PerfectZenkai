import { useTasksStore } from '@/modules/tasks'
import { StatusChip } from '@/shared/ui/status-chip'
import { CheckSquare, Circle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Progress } from '@/shared/ui/progress'

export function TodoSummaryCard() {
  const navigate = useNavigate()
  const { todos, isLoading } = useTasksStore()

  const totalTodos = todos.length
  const completedTodos = todos.filter((todo) => todo.done).length
  const incompleteTodos = totalTodos - completedTodos
  const progressPercentage =
    totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  const handleClick = () => {
    navigate('/todo')
  }

  if (isLoading) {
    return (
      <div className="cyber-card cursor-pointer">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-700">
            <Clock className="text-ki-green cyber-icon h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Quest Progress</h3>
            <p className="font-mono text-xs text-gray-400">Loading...</p>
          </div>
        </div>
        <div className="flex h-24 items-center justify-center">
          <div className="shimmer h-20 w-20 rounded-full bg-gray-700"></div>
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
      className="cyber-card transition-cyber flex h-full cursor-pointer flex-col"
      onClick={handleClick}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-700">
          <Clock className="text-ki-green cyber-icon glow-ki h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Quest Progress</h3>
          <p className="font-mono text-xs text-gray-400">Today's missions</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {totalTodos > 0 ? (
          <div className="flex flex-1 flex-col justify-center space-y-4">
            {/* Progress ring */}
            <div className="flex items-center justify-center">
              <Progress
                value={progressPercentage}
                variant="ring"
                size="lg"
                className="h-24 w-24"
              />
            </div>

            {/* Stats breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5">
                  <CheckSquare className="text-ki-green cyber-icon h-4 w-4" />
                  <span className="text-ki-green font-mono text-sm">Done</span>
                </div>
                <div className="metric-medium gradient-text-ki">
                  {completedTodos}
                </div>
              </div>

              <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5">
                  <Circle className="cyber-icon h-4 w-4 text-gray-400" />
                  <span className="font-mono text-sm text-gray-400">Left</span>
                </div>
                <div className="metric-medium text-gray-300">
                  {incompleteTodos}
                </div>
              </div>
            </div>

            {/* Status chip */}
            <div className="mt-auto flex justify-center">
              <StatusChip variant={getProgressStatus()} size="md">
                {progressPercentage === 100
                  ? 'Complete!'
                  : progressPercentage >= 75
                    ? 'Almost done'
                    : progressPercentage >= 50
                      ? 'Making progress'
                      : progressPercentage > 0
                        ? 'Getting started'
                        : 'Ready to begin'}
              </StatusChip>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-gray-700 bg-gray-900">
              <Clock className="cyber-icon h-8 w-8 text-gray-600" />
            </div>
            <div>
              <div className="font-inter mb-2 text-gray-400">
                No quests active
              </div>
              <div className="text-ki-green cursor-pointer font-mono text-sm">
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
