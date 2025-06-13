import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Card, CardContent } from '@/shared/ui/card'
import { Todo } from '../types'
import { useTasksStore } from '../store'

interface TodoRowProps {
  todo: Todo
}

export function TodoRow({ todo }: TodoRowProps) {
  const [isPressed, setIsPressed] = useState(false)
  const { toggleTodo, deleteTodo } = useTasksStore()

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
      } ${todo.done ? 'opacity-75' : ''}`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-3">
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

          {/* Todo text */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm transition-all ${
                todo.done
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              }`}
            >
              {todo.text}
            </p>
          </div>

          {/* Swipe hint */}
          <div className="text-xs text-muted-foreground opacity-50">
            Swipe to delete
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 