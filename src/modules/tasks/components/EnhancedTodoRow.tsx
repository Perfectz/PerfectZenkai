import { useState } from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { Input } from '@/shared/ui/input'
import { Calendar, ChevronDown, ChevronRight, Plus, Edit3, FileText, Clock } from 'lucide-react'
import { Todo } from '../types'
import { useTasksStore } from '../store'
import {
  formatDueDate,
  isOverdue,
  isDueToday,
  getPriorityConfig,
  getCategoryConfig,
} from '../utils'
import { useSwipeable } from 'react-swipeable'
import {
  PointsDisplay,
  RichTextPreview,
  RichTextEditor 
} from './rich-content'

interface EnhancedTodoRowProps {
  todo: Todo
}

export default function EnhancedTodoRow({
  todo,
}: EnhancedTodoRowProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const [newSubtaskText, setNewSubtaskText] = useState('')

  const { 
    updateTodoField,
    deleteTodo, 
    addSubtask, 
    deleteSubtask,
    toggleTodo,
    toggleSubtask
  } = useTasksStore()

  const priorityConfig = getPriorityConfig(todo.priority)
  const categoryConfig = getCategoryConfig(todo.category)
  const completionPercentage = todo.subtasks?.length > 0 
    ? (todo.subtasks.filter(s => s.done).length / todo.subtasks.length) * 100 
    : 0

  const handleToggle = async () => {
    try {
      await toggleTodo(todo.id)
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete task: "${todo.summary}"?`)
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



  const handleDescriptionChange = (content: string, format: 'markdown' | 'plaintext' | 'html') => {
    updateTodoField(todo.id, 'description', content)
    updateTodoField(todo.id, 'descriptionFormat', format)
  }

  const formatEnhancedDueDate = (dateTime?: string): string => {
    if (!dateTime) return ''
    
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

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      handleDelete()
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  const hasDescription = todo.description && todo.description.trim().length > 0
  const hasEnhancedDueDate = todo.dueDateTime

  return (
    <Card
      {...swipeHandlers}
      className={`transition-all duration-150 ${
        isPressed ? 'scale-95 bg-muted' : 'hover:bg-muted/50'
      } ${todo.done ? 'opacity-75' : ''} ${
        isOverdue({ ...todo, dueDate: todo.dueDateTime?.split('T')[0] }) ? 'border-red-200 bg-red-50/50' : ''
      }`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <CardContent className="px-4 py-3">
        <div className="space-y-3">
          {/* Main todo row */}
          <div className="flex items-center gap-3">
            {/* Expand button for subtasks */}
            {((todo.subtasks && todo.subtasks.length > 0) || hasDescription) && (
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
            )}

            {/* Checkbox */}
            <button
              onClick={handleToggle}
              className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                todo.done
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground hover:border-primary'
              }`}
            >
              {todo.done && (
                <svg
                  className="h-3 w-3"
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
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <p
                  className={`text-sm transition-all ${
                    todo.done
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  }`}
                >
                  {todo.summary}
                </p>
                
                {/* Enhanced indicators */}
                <div className="flex items-center gap-1 ml-2">
                  {hasDescription && (
                    <FileText className="h-3 w-3 text-muted-foreground" />
                  )}
                  {hasEnhancedDueDate && (
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Progress bar for subtasks */}
              {todo.subtasks && todo.subtasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <Progress
                    value={completionPercentage}
                    className="h-1.5 flex-1"
                  />
                  <span className="text-xs text-muted-foreground">
                    {todo.subtasks.filter((s) => s.done).length}/{todo.subtasks.length}
                  </span>
                </div>
              )}

              {/* Enhanced tags and badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Points display */}
                {todo.points && (
                  <PointsDisplay 
                    points={todo.points} 
                    size="sm" 
                    showStars={false}
                    showLabel={false}
                  />
                )}

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

                {/* Enhanced due date badge */}
                {hasEnhancedDueDate ? (
                  <Badge
                    variant="outline"
                    className={`px-2 py-0.5 text-xs ${
                      isOverdue({ ...todo, dueDate: todo.dueDateTime?.split('T')[0] })
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : isDueToday({ ...todo, dueDate: todo.dueDateTime?.split('T')[0] })
                          ? 'border-orange-300 bg-orange-50 text-orange-600'
                          : 'border-blue-300 bg-blue-50 text-blue-600'
                    }`}
                  >
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatEnhancedDueDate(todo.dueDateTime)}
                  </Badge>
                ) : todo.dueDate && (
                  <Badge
                    variant="outline"
                    className={`px-2 py-0.5 text-xs ${
                      isOverdue(todo)
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : isDueToday(todo)
                          ? 'border-orange-300 bg-orange-50 text-orange-600'
                          : 'border-blue-300 bg-blue-50 text-blue-600'
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

          {/* Expanded section */}
          {isExpanded && (
            <div className="ml-8 space-y-3">
              {/* Rich text description */}
              {hasDescription && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDescription(!isEditingDescription)}
                      className="h-6 px-2 text-xs"
                    >
                      <Edit3 className="mr-1 h-3 w-3" />
                      {isEditingDescription ? 'Save' : 'Edit'}
                    </Button>
                  </div>
                  
                  {isEditingDescription ? (
                    <RichTextEditor
                      value={todo.description}
                      format={todo.descriptionFormat}
                      onChange={handleDescriptionChange}
                      minHeight={80}
                      className="text-sm"
                    />
                  ) : (
                    <RichTextPreview
                      content={todo.description || ''}
                      format={todo.descriptionFormat}
                      className="p-2 bg-muted/30 rounded"
                    />
                  )}
                </div>
              )}

              {/* Subtasks section */}
              {todo.subtasks && todo.subtasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Subtasks</h4>
                  {todo.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <button
                        onClick={() => toggleSubtask(todo.id, subtask.id)}
                        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                          subtask.done
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground hover:border-primary'
                        }`}
                      >
                        {subtask.done && (
                          <svg
                            className="h-2.5 w-2.5"
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
                      <span
                        className={
                          subtask.done ? 'text-muted-foreground line-through' : ''
                        }
                      >
                        {subtask.text}
                      </span>
                      <button
                        onClick={() => deleteSubtask(todo.id, subtask.id)}
                        className="ml-auto text-muted-foreground transition-colors hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              <Button
                size="sm"
                onClick={handleAddSubtask}
                disabled={!newSubtaskText.trim()}
              >
                Add
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 