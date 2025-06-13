import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { Calendar, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Todo } from '../types'
import { useTasksStore } from '../store'
import { 
  getPriorityConfig, 
  getCategoryConfig, 
  isOverdue, 
  isDueToday, 
  formatDueDate,
  getCompletionPercentage 
} from '../utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface TodoRowProps {
  todo: Todo
}

export function TodoRow({ todo }: TodoRowProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [newSubtaskText, setNewSubtaskText] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  
  const { toggleTodo, deleteTodo, addSubtask, toggleSubtask, deleteSubtask } = useTasksStore()

  const priorityConfig = getPriorityConfig(todo.priority)
  const categoryConfig = getCategoryConfig(todo.category)
  const completionPercentage = getCompletionPercentage(todo)

  const handleToggle = async () => {
    try {
      await toggleTodo(todo.id)
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete task: "${todo.text}"?`)
    if (confirmed) {
      deleteTodo(todo.id)
    }
  }

  const handleAddSubtask = async () => {
    if (!newSubtaskText.trim()) return
    
    try {
      await addSubtask(todo.id, newSubtaskText.trim())
      setNewSubtaskText('')
      setIsAddingSubtask(false)
    } catch (error) {
      console.error('Failed to add subtask:', error)
    }
  }

  const handleSubtaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask()
    } else if (e.key === 'Escape') {
      setIsAddingSubtask(false)
      setNewSubtaskText('')
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      handleDelete()
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  })

  return (
    <Card
      {...swipeHandlers}
      className={`transition-all duration-150 ${
        isPressed ? 'bg-muted scale-95' : 'hover:bg-muted/50'
      } ${todo.done ? 'opacity-75' : ''} ${isOverdue(todo) ? 'border-red-200 bg-red-50/50' : ''}`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <CardContent className="py-3 px-4">
        <div className="space-y-3">
          {/* Main todo row */}
          <div className="flex items-center gap-3">
            {/* Expand button for subtasks */}
            {todo.subtasks.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0.5 hover:bg-muted rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            )}

            {/* Checkbox */}
            <button
              onClick={handleToggle}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                todo.done
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground hover:border-primary'
              }`}
            >
              {todo.done && (
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Todo text and details */}
            <div className="flex-1 min-w-0 space-y-1">
              <p
                className={`text-sm transition-all ${
                  todo.done
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground'
                }`}
              >
                {todo.text}
              </p>
              
              {/* Progress bar for subtasks */}
              {todo.subtasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <Progress value={completionPercentage} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {todo.subtasks.filter(s => s.done).length}/{todo.subtasks.length}
                  </span>
                </div>
              )}
              
              {/* Tags and badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Priority badge */}
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-0.5 ${priorityConfig.color} border-current`}
                >
                  <span className="mr-1">{priorityConfig.icon}</span>
                  {priorityConfig.label}
                </Badge>
                
                {/* Category badge */}
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-0.5 ${categoryConfig.color} border-current`}
                >
                  <span className="mr-1">{categoryConfig.icon}</span>
                  {categoryConfig.label}
                </Badge>
                
                {/* Due date badge */}
                {todo.dueDate && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0.5 ${
                      isOverdue(todo) 
                        ? 'text-red-600 border-red-300 bg-red-50' 
                        : isDueToday(todo)
                        ? 'text-orange-600 border-orange-300 bg-orange-50'
                        : 'text-blue-600 border-blue-300 bg-blue-50'
                    }`}
                  >
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDueDate(todo.dueDate)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Add subtask button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAddingSubtask(true)}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Subtasks section */}
          {isExpanded && todo.subtasks.length > 0 && (
            <div className="ml-8 space-y-2">
              {todo.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => toggleSubtask(todo.id, subtask.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      subtask.done
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground hover:border-primary'
                    }`}
                  >
                    {subtask.done && (
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <span className={subtask.done ? 'line-through text-muted-foreground' : ''}>
                    {subtask.text}
                  </span>
                  <button
                    onClick={() => deleteSubtask(todo.id, subtask.id)}
                    className="ml-auto text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add subtask input */}
          {isAddingSubtask && (
            <div className="ml-8 flex items-center gap-2">
              <Input
                placeholder="Add subtask..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyPress={handleSubtaskKeyPress}
                onBlur={() => {
                  if (!newSubtaskText.trim()) {
                    setIsAddingSubtask(false)
                  }
                }}
                className="text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtaskText.trim()}>
                Add
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 