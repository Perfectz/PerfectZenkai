// src/modules/tasks/components/SimpleTodoItem.tsx
// Simple todo item with clear delete functionality

import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Trash2, Calendar, Check, X } from 'lucide-react'
import { Todo } from '../types'
import { useSimpleTodoStore } from '../stores/SimpleTodoStore'
import {
  getPriorityConfig,
  getCategoryConfig,
  isOverdue,
  isDueToday,
  formatDueDate,
} from '../utils'
import { cn } from '@/shared/utils/cn'

interface SimpleTodoItemProps {
  todo: Todo
}

export function SimpleTodoItem({ todo }: SimpleTodoItemProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { toggleTodo, deleteTodo } = useSimpleTodoStore()

  const priorityConfig = getPriorityConfig(todo.priority)
  const categoryConfig = getCategoryConfig(todo.category)

  const handleToggle = async () => {
    try {
      await toggleTodo(todo.id)
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTodo(todo.id)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!showDeleteConfirm) {
        setShowDeleteConfirm(true)
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  return (
    <Card
      {...swipeHandlers}
      className={cn(
        'transition-all duration-150',
        isPressed ? 'scale-95 bg-muted' : 'hover:bg-muted/50',
        todo.done ? 'opacity-75' : '',
        isOverdue(todo) ? 'border-red-200 bg-red-50/50' : ''
      )}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <CardContent className="px-4 py-3">
        {showDeleteConfirm ? (
          // Delete confirmation view
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600">
                Delete "{todo.summary}"?
              </p>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelDelete}
                className="h-8 px-3"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                className="h-8 px-3"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ) : (
          // Normal todo view
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <button
              onClick={handleToggle}
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
                todo.done
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground hover:border-primary'
              )}
            >
              {todo.done && <Check className="h-3 w-3" />}
            </button>

            {/* Todo content */}
            <div className="min-w-0 flex-1 space-y-1">
              <p
                className={cn(
                  'text-sm transition-all',
                  todo.done
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground'
                )}
              >
                {todo.summary}
              </p>

              {/* Tags and badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Priority badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    'px-2 py-0.5 text-xs border-current',
                    priorityConfig.color
                  )}
                >
                  <span className="mr-1">{priorityConfig.icon}</span>
                  {priorityConfig.label}
                </Badge>

                {/* Category badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    'px-2 py-0.5 text-xs border-current',
                    categoryConfig.color
                  )}
                >
                  <span className="mr-1">{categoryConfig.icon}</span>
                  {categoryConfig.label}
                </Badge>

                {/* Due date badge */}
                {todo.dueDate && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-2 py-0.5 text-xs',
                      isOverdue(todo)
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : isDueToday(todo)
                          ? 'border-orange-300 bg-orange-50 text-orange-600'
                          : 'border-blue-300 bg-blue-50 text-blue-600'
                    )}
                  >
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDueDate(todo.dueDate)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Delete button - always visible */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDeleteClick}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 