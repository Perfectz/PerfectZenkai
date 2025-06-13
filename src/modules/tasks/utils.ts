import { Priority, Category, Todo } from './types'

export const PRIORITIES: {
  value: Priority
  label: string
  icon: string
  color: string
}[] = [
  { value: 'high', label: 'High', icon: '🔥', color: 'text-red-500' },
  { value: 'medium', label: 'Medium', icon: '⚡', color: 'text-yellow-500' },
  { value: 'low', label: 'Low', icon: '💤', color: 'text-blue-500' },
]

export const CATEGORIES: {
  value: Category
  label: string
  icon: string
  color: string
}[] = [
  { value: 'work', label: 'Work', icon: '💼', color: 'text-purple-500' },
  { value: 'personal', label: 'Personal', icon: '🏠', color: 'text-green-500' },
  { value: 'health', label: 'Health', icon: '💪', color: 'text-red-500' },
  { value: 'learning', label: 'Learning', icon: '📚', color: 'text-blue-500' },
  { value: 'other', label: 'Other', icon: '📋', color: 'text-gray-500' },
]

export const getPriorityConfig = (priority: Priority) => {
  return PRIORITIES.find((p) => p.value === priority) || PRIORITIES[1]
}

export const getCategoryConfig = (category: Category) => {
  return CATEGORIES.find((c) => c.value === category) || CATEGORIES[4]
}

export const isOverdue = (todo: Todo): boolean => {
  if (!todo.dueDate || todo.done) return false
  const today = new Date().toISOString().split('T')[0]
  return todo.dueDate < today
}

export const isDueToday = (todo: Todo): boolean => {
  if (!todo.dueDate) return false
  const today = new Date().toISOString().split('T')[0]
  return todo.dueDate === today
}

export const isDueSoon = (todo: Todo, days: number = 3): boolean => {
  if (!todo.dueDate || todo.done) return false
  const today = new Date()
  const dueDate = new Date(todo.dueDate)
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= days && diffDays > 0
}

export const getCompletionPercentage = (todo: Todo): number => {
  if (!todo.subtasks || todo.subtasks.length === 0) return todo.done ? 100 : 0
  const completedSubtasks = todo.subtasks.filter((s) => s.done).length
  return Math.round((completedSubtasks / todo.subtasks.length) * 100)
}

export const formatDueDate = (dueDate: string): string => {
  const date = new Date(dueDate)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dueDate === today.toISOString().split('T')[0]) {
    return 'Today'
  } else if (dueDate === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday'
  } else if (dueDate === tomorrow.toISOString().split('T')[0]) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }
}

export const sortTodosByPriority = (todos: Todo[]): Todo[] => {
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  return [...todos].sort(
    (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
  )
}

export const sortTodosByDueDate = (todos: Todo[]): Todo[] => {
  return [...todos].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}
