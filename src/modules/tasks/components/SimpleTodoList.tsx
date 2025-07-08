// src/modules/tasks/components/SimpleTodoList.tsx
// Simple todo list with filtering and empty states

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { CheckSquare, AlertCircle } from 'lucide-react'
import { Todo, Priority, Category } from '../types'
import { SimpleTodoItem } from './SimpleTodoItem'
import { useSimpleTodoStore } from '../stores/SimpleTodoStore'

interface SimpleTodoListProps {
  todos: Todo[]
  title?: string
  showOverdue?: boolean
  filterPriority?: Priority | 'all'
  filterCategory?: Category | 'all'
  sortBy?: 'created' | 'priority' | 'dueDate'
}

export function SimpleTodoList({
  todos,
  title = 'Tasks',
  showOverdue = false,
  filterPriority = 'all',
  filterCategory = 'all',
  sortBy = 'created',
}: SimpleTodoListProps) {
  const { getOverdueTodos } = useSimpleTodoStore()

  // Apply filters
  let filteredTodos = todos.filter((todo) => {
    if (filterPriority !== 'all' && todo.priority !== filterPriority) return false
    if (filterCategory !== 'all' && todo.category !== filterCategory) return false
    return true
  })

  // Apply sorting
  filteredTodos = [...filteredTodos].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  // Separate incomplete and complete todos
  const incompleteTodos = filteredTodos.filter((todo) => !todo.done)
  const completedTodos = filteredTodos.filter((todo) => todo.done)

  // Get overdue todos if requested
  const overdueTodos = showOverdue ? getOverdueTodos() : []

  return (
    <div className="space-y-4">
      {/* Overdue Tasks Alert */}
      {showOverdue && overdueTodos.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-sm">
                {overdueTodos.length} overdue task{overdueTodos.length > 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incomplete Tasks */}
      {incompleteTodos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">⚡ Active Tasks</span>
              <Badge variant="secondary" className="text-xs">
                {incompleteTodos.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incompleteTodos.map((todo) => (
              <SimpleTodoItem key={todo.id} todo={todo} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {completedTodos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">✅ Completed Tasks</span>
              <Badge variant="secondary" className="text-xs">
                {completedTodos.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedTodos.map((todo) => (
              <SimpleTodoItem key={todo.id} todo={todo} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredTodos.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filterPriority !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters to see more tasks'
                : 'Get started by adding your first task above'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 