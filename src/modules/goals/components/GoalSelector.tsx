import React from 'react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Target, ChevronDown, X } from 'lucide-react'
import { useGoalsStore } from '../store'
import { getCategoryInfo } from '../utils'

interface GoalSelectorProps {
  value?: string // Selected goal ID
  onChange: (goalId: string | undefined) => void
  disabled?: boolean
  className?: string
}

export const GoalSelector: React.FC<GoalSelectorProps> = ({ 
  value, 
  onChange, 
  disabled = false, 
  className = '' 
}) => {
  const { getActiveGoals } = useGoalsStore()
  const activeGoals = getActiveGoals()
  const selectedGoal = activeGoals.find(goal => goal.id === value)

  const handleSelect = (goalId: string) => {
    onChange(goalId)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
  }

  if (activeGoals.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        No active goals. <a href="/goals" className="text-primary hover:underline">Create one</a> to link tasks.
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-between ${className}`}
          disabled={disabled}
          type="button"
        >
          {selectedGoal ? (
            <div className="flex items-center gap-2 flex-1">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: selectedGoal.color }}
              />
              <span className="truncate">{selectedGoal.title}</span>
              <Badge variant="outline" className="text-xs ml-auto">
                {getCategoryInfo(selectedGoal.category).icon}
              </Badge>
              <X 
                className="h-4 w-4 hover:bg-muted rounded" 
                onClick={handleClear}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Link to goal (optional)</span>
            </div>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="start">
        <div className="space-y-1">
          {!selectedGoal && (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => onChange(undefined)}
              type="button"
            >
              <X className="h-4 w-4 mr-2" />
              No goal
            </Button>
          )}
          {activeGoals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category)
            return (
              <Button
                key={goal.id}
                variant={value === goal.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleSelect(goal.id)}
                type="button"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: goal.color }}
                  />
                  <span className="truncate">{goal.title}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {categoryInfo.icon}
                  </Badge>
                </div>
              </Button>
            )
          })}
        </div>
        {activeGoals.length > 0 && (
          <div className="border-t mt-2 pt-2">
            <a 
              href="/goals" 
              className="text-xs text-muted-foreground hover:text-primary block text-center"
            >
              Manage goals →
            </a>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
} 