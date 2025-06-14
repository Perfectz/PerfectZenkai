import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { MoreHorizontal, Target, Calendar, Pause, Play, Trash2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { GoalWithProgress } from '../types'
import { getCategoryInfo, formatTargetDate } from '../utils'
import { useGoalsStore } from '../store'

interface GoalCardProps {
  goal: GoalWithProgress
  onEdit?: (goal: GoalWithProgress) => void
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit }) => {
  const { toggleGoalActive, deleteGoal } = useGoalsStore()
  const categoryInfo = getCategoryInfo(goal.category)

  const handleToggleActive = () => {
    toggleGoalActive(goal.id)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goal.id)
    }
  }

  return (
    <Card className={`transition-all duration-200 ${goal.isActive ? '' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: goal.color }}
              />
              {goal.title}
              {!goal.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Paused
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <span className="mr-1">{categoryInfo.icon}</span>
                {categoryInfo.label}
              </Badge>
              {goal.targetDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatTargetDate(goal.targetDate)}
                </Badge>
              )}
            </div>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="space-y-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onEdit(goal)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Edit Goal
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleToggleActive}
                >
                  {goal.isActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Goal
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume Goal
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Goal
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {goal.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {goal.description}
          </p>
        )}
        
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {goal.progress.completedTodos} / {goal.progress.totalTodos} tasks
            </span>
          </div>
          
          <Progress 
            value={goal.progress.progressPercentage} 
            className="h-2"
          />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{goal.progress.progressPercentage}% complete</span>
            {goal.progress.totalTodos === 0 && (
              <span className="text-orange-600">No tasks linked yet</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 