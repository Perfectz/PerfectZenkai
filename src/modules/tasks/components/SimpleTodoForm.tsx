// src/modules/tasks/components/SimpleTodoForm.tsx
// Simple todo form for adding new tasks

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Plus, Calendar } from 'lucide-react'
import { Priority, Category } from '../types'
import { useSimpleTodoStore } from '../stores/SimpleTodoStore'
import { PRIORITIES, CATEGORIES } from '../utils'

export function SimpleTodoForm() {
  const [inputValue, setInputValue] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium')
  const [selectedCategory, setSelectedCategory] = useState<Category>('other')
  const [dueDate, setDueDate] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { addTodo, isLoading } = useSimpleTodoStore()

  const handleAddTodo = async () => {
    if (!inputValue.trim()) return

    const newTodo = {
      summary: inputValue.trim(),
      done: false,
      priority: selectedPriority,
      category: selectedCategory,
      points: 5, // Default points
      dueDate: dueDate || undefined,
      description: '',
      descriptionFormat: 'plaintext' as const,
      subtasks: [],
    }

    try {
      await addTodo(newTodo)
      setInputValue('')
      setDueDate('')
      setSelectedPriority('medium')
      setSelectedCategory('other')
      setShowAdvanced(false)
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic input */}
        <div className="flex gap-2">
          <Input
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleAddTodo}
            disabled={!inputValue.trim() || isLoading}
            className="px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Advanced options toggle */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>
        </div>

        {/* Advanced options */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                disabled={isLoading}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.icon} {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category)}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                disabled={isLoading}
              >
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Due Date
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm"
                  disabled={isLoading}
                />
                <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 