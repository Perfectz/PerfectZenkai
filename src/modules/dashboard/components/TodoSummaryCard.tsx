import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useNavigate } from 'react-router-dom'
import { useTasksStore } from '@/modules/tasks/store'
import { CheckSquare, Square } from 'lucide-react'

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
      <Card className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl"
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckSquare className="h-4 w-4" />
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalTodos > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {completedTodos} of {totalTodos}
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}%
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Square className="h-3 w-3" />
                {incompleteTodos} pending
              </div>
              <div className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {completedTodos} done
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-muted-foreground">
              No tasks created yet
            </div>
            <div className="text-sm text-primary">
              Tap to add your first task
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 