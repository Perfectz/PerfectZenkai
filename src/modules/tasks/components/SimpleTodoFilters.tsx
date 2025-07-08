// src/modules/tasks/components/SimpleTodoFilters.tsx
// Simple todo filters for filtering and sorting

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Filter } from 'lucide-react'
import { Priority, Category } from '../types'
import { PRIORITIES, CATEGORIES } from '../utils'

interface SimpleTodoFiltersProps {
  filterPriority: Priority | 'all'
  filterCategory: Category | 'all'
  sortBy: 'created' | 'priority' | 'dueDate'
  onFilterPriorityChange: (priority: Priority | 'all') => void
  onFilterCategoryChange: (category: Category | 'all') => void
  onSortByChange: (sortBy: 'created' | 'priority' | 'dueDate') => void
}

export function SimpleTodoFilters({
  filterPriority,
  filterCategory,
  sortBy,
  onFilterPriorityChange,
  onFilterCategoryChange,
  onSortByChange,
}: SimpleTodoFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filters & Sort
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Priority Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => onFilterPriorityChange(e.target.value as Priority | 'all')}
              className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.icon} {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => onFilterCategoryChange(e.target.value as Category | 'all')}
              className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as 'created' | 'priority' | 'dueDate')}
              className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="created">Created Date</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Actions
            </label>
            <button
              onClick={() => {
                onFilterPriorityChange('all')
                onFilterCategoryChange('all')
                onSortByChange('created')
              }}
              className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 