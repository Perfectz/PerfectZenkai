// src/modules/tasks/pages/SimpleTodoPage.tsx
// Completely new simplified todo page

import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { RefreshCw, Trash2 } from 'lucide-react'
import { useSimpleTodoStore } from '../stores/SimpleTodoStore'
import { SimpleTodoForm } from '../components/SimpleTodoForm'
import { SimpleTodoList } from '../components/SimpleTodoList'
import { SimpleTodoFilters } from '../components/SimpleTodoFilters'
import { Priority, Category } from '../types'

export default function SimpleTodoPage() {
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'dueDate'>('created')

  const { todos, isLoading, error, loadTodos, syncWithCloud, clearAll } = useSimpleTodoStore()

  useEffect(() => {
    // Load todos on component mount
    if (todos.length === 0 && !isLoading) {
      loadTodos()
    }
  }, [loadTodos, isLoading, todos.length])

  const handleSync = async () => {
    try {
      await syncWithCloud()
    } catch (error) {
      console.error('Failed to sync:', error)
    }
  }

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL tasks? This action cannot be undone.'
    )
    if (confirmed) {
      try {
        await clearAll()
      } catch (error) {
        console.error('Failed to clear all tasks:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tasks</h1>
            <p className="text-sm text-gray-400">
              Manage your daily tasks and goals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isLoading}
              title="Sync with cloud"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {todos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={isLoading}
                title="Clear all tasks"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Add Task Form */}
      <SimpleTodoForm />

      {/* Filters */}
      <SimpleTodoFilters
        filterPriority={filterPriority}
        filterCategory={filterCategory}
        sortBy={sortBy}
        onFilterPriorityChange={setFilterPriority}
        onFilterCategoryChange={setFilterCategory}
        onSortByChange={setSortBy}
      />

      {/* Task List */}
      <SimpleTodoList
        todos={todos}
        showOverdue={true}
        filterPriority={filterPriority}
        filterCategory={filterCategory}
        sortBy={sortBy}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 mx-auto animate-spin text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Loading tasks...</p>
        </div>
      )}
    </div>
  )
} 