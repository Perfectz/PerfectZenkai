import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Progress } from '@/shared/ui/progress'
import { 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Pause, 
  Play, 
  Target,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'
import { RecurringTodo, TodoCompletion } from '../types'
import { useTasksStore } from '../store'
import {
  getPriorityConfig,
  getCategoryConfig,
  formatDueDate,
} from '../utils'
import { cn } from '@/shared/utils/cn'

interface RecurringTaskRowProps {
  todo: RecurringTodo
}

export function RecurringTaskRow({ todo }: RecurringTaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  const { updateTodo, deleteTodo } = useTasksStore()
  
  const priorityConfig = getPriorityConfig(todo.priority)
  const categoryConfig = getCategoryConfig(todo.category)
  
  const handleComplete = async () => {
    const newCompletion: TodoCompletion = {
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
      scheduledFor: todo.nextDueDate,
      points: todo.points || 5,
      streakDay: todo.currentStreak + 1
    }
    
    const updatedTodo: RecurringTodo = {
      ...todo,
      completions: [...todo.completions, newCompletion],
      currentStreak: todo.currentStreak + 1,
      bestStreak: Math.max(todo.bestStreak, todo.currentStreak + 1),
      updatedAt: new Date().toISOString()
    }
    
    await updateTodo(updatedTodo.id, updatedTodo)
  }
  
  const handleTogglePause = async () => {
    const newStatus = todo.status === 'active' ? 'paused' : 'active'
    const updatedTodo: RecurringTodo = {
      ...todo,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }
    
    await updateTodo(updatedTodo.id, updatedTodo)
  }
  
  const handleDelete = async () => {
    await deleteTodo(todo.id)
  }
  
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      handleDelete()
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  })
  
  const formatNextDueDate = (dateTime: string): string => {
    const date = new Date(dateTime)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
    
    let dateStr = date.toLocaleDateString()
    if (isToday) dateStr = 'Today'
    else if (isTomorrow) dateStr = 'Tomorrow'
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    return `${dateStr} ${timeStr}`
  }
  
  const getRecurrenceLabel = () => {
    const { type, interval } = todo.recurrence
    if (interval === 1) {
      return `${type}`.charAt(0).toUpperCase() + `${type}`.slice(1)
    }
    return `Every ${interval} ${type === 'daily' ? 'days' : type === 'weekly' ? 'weeks' : 'months'}`
  }
  
  const getConsistencyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const consistencyRate = todo.completions.length > 0 
    ? Math.round((todo.completions.length / Math.max(1, Math.floor((new Date().getTime() - new Date(todo.createdAt).getTime()) / (1000 * 60 * 60 * 24)))) * 100)
    : 0

  return (
    <Card
      {...swipeHandlers}
      className={cn(
        "transition-all duration-150",
        isPressed ? 'scale-95 bg-muted' : 'hover:bg-muted/50',
        todo.status === 'paused' ? 'opacity-60' : '',
        "border-l-4 border-l-blue-500" // Recurring task indicator
      )}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <CardContent className="px-4 py-3">
        <div className="space-y-3">
          {/* Main recurring task row */}
          <div className="flex items-center gap-3">
            {/* Expand button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded p-0.5 transition-colors hover:bg-muted"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {/* Complete button */}
            <Button
              size="sm"
              variant={todo.status === 'active' ? 'default' : 'outline'}
              onClick={handleComplete}
              disabled={todo.status !== 'active'}
              className="h-8 w-8 p-0 rounded-full"
            >
              <Target className="h-4 w-4" />
            </Button>

            {/* Task info */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <h3 className={cn(
                  "text-sm font-medium transition-all",
                  todo.status === 'paused' ? 'text-muted-foreground' : 'text-foreground'
                )}>
                  {todo.summary}
                </h3>
                
                {/* Recurring indicator */}
                <Badge variant="outline" className="text-xs border-blue-500 bg-blue-50 text-blue-700">
                  <span className="mr-1">🔄</span>
                  {getRecurrenceLabel()}
                </Badge>
              </div>

              {/* Streak and next due */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {/* Current streak */}
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-orange-500" />
                  <span>{todo.currentStreak} streak</span>
                </div>
                
                {/* Next due date */}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span>{formatNextDueDate(todo.nextDueDate)}</span>
                </div>
                
                {/* Consistency rate */}
                <div className="flex items-center gap-1">
                  <TrendingUp className={cn("h-3 w-3", getConsistencyColor(consistencyRate))} />
                  <span className={getConsistencyColor(consistencyRate)}>
                    {consistencyRate}%
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Priority badge */}
                <Badge
                  variant="outline"
                  className={`px-2 py-0.5 text-xs ${priorityConfig.color} border-current`}
                >
                  <span className="mr-1">{priorityConfig.icon}</span>
                  {priorityConfig.label}
                </Badge>

                {/* Category badge */}
                <Badge
                  variant="outline"
                  className={`px-2 py-0.5 text-xs ${categoryConfig.color} border-current`}
                >
                  <span className="mr-1">{categoryConfig.icon}</span>
                  {categoryConfig.label}
                </Badge>
                
                {/* Points badge */}
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  {todo.points || 5} pts
                </Badge>
              </div>
            </div>

            {/* Pause/Resume button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleTogglePause}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              {todo.status === 'active' ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="pl-12 space-y-3 border-t pt-3">
              {/* Streak statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-500">{todo.currentStreak}</div>
                  <div className="text-xs text-muted-foreground">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500">{todo.bestStreak}</div>
                  <div className="text-xs text-muted-foreground">Best</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-500">{todo.completions.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className={cn("text-lg font-bold", getConsistencyColor(consistencyRate))}>
                    {consistencyRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">Consistency</div>
                </div>
              </div>
              
              {/* Recent completions */}
              {todo.completions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Recent Completions</h4>
                  <div className="space-y-1">
                    {todo.completions.slice(-3).reverse().map((completion) => (
                      <div key={completion.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {new Date(completion.completedAt).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          +{completion.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Description if exists */}
              {todo.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{todo.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecurringTaskRow 