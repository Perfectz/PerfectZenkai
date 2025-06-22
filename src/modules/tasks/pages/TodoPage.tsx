import { useState, useEffect } from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Plus, Filter, Calendar, AlertCircle, FileText, Star, CheckSquare } from 'lucide-react'
import { useTasksStore } from '../store'
import EnhancedTodoRow from '../components/EnhancedTodoRow'
import { PointSelector, EnhancedDatePicker, RichTextEditor } from '../components/rich-content'
import { GoalSelector } from '@/modules/goals'
import { Priority, Category } from '../types'
import {
  PRIORITIES,
  CATEGORIES,
  sortTodosByPriority,
  sortTodosByDueDate,
} from '../utils'

export default function TodoPage() {
  const [inputValue, setInputValue] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium')
  const [selectedCategory, setSelectedCategory] = useState<Category>('other')
  const [selectedPoints, setSelectedPoints] = useState(5)
  const [selectedGoal, setSelectedGoal] = useState<string | undefined>()
  const [dueDate, setDueDate] = useState('')
  const [dueDateTimeEnhanced, setDueDateTimeEnhanced] = useState<string | undefined>()
  const [taskDescription, setTaskDescription] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'dueDate' | 'points'>(
    'created'
  )
  const [filterPoints, setFilterPoints] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  const {
    todos,
    templates,
    addTodo,
    loadTodos,
    loadTemplates,
    createTodoFromTemplate,
    getOverdueTodos,
    isLoading,
  } = useTasksStore()

  useEffect(() => {
    // Only load if we truly have no data (prevents React Strict Mode duplicate loads)
    if (todos.length === 0 && !isLoading) {
      loadTodos()
    }
    if (templates.length === 0) {
      loadTemplates()
    }
  }, [loadTodos, loadTemplates, isLoading, todos.length, templates.length])

  // Filter todos based on selected filters
  const filteredTodos = todos.filter((todo) => {
    if (filterPriority !== 'all' && todo.priority !== filterPriority)
      return false
    if (filterCategory !== 'all' && todo.category !== filterCategory)
      return false
    if (filterPoints !== 'all') {
      const points = todo.points || 5
      if (filterPoints === 'low' && points > 3) return false
      if (filterPoints === 'medium' && (points <= 3 || points > 7)) return false
      if (filterPoints === 'high' && points <= 7) return false
    }
    return true
  })

  // Sort todos based on selected sort option
  const sortedTodos = (() => {
    switch (sortBy) {
      case 'priority':
        return sortTodosByPriority(filteredTodos)
      case 'dueDate':
        return sortTodosByDueDate(filteredTodos)
      case 'points':
        return [...filteredTodos].sort((a, b) => (b.points || 5) - (a.points || 5))
      default:
        return [...filteredTodos].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }
  })()

  const incompleteTodos = sortedTodos.filter((todo) => !todo.done)
  const completedTodos = sortedTodos.filter((todo) => todo.done)
  const overdueTodos = getOverdueTodos()

  const handleAddTodo = async () => {
    if (!inputValue.trim()) return

    const newTodo = {
      summary: inputValue.trim(),
      done: false,
      priority: selectedPriority,
      category: selectedCategory,
      points: selectedPoints,
      goalId: selectedGoal,
      dueDate: dueDate || undefined,
      dueDateTime: dueDateTimeEnhanced || undefined,
      description: taskDescription.trim() || undefined,
      descriptionFormat: 'markdown' as const,
      subtasks: [],
      createdAt: new Date().toISOString(),
    }

    try {
      await addTodo(newTodo)
      setInputValue('')
      setTaskDescription('')
      setDueDate('')
      setDueDateTimeEnhanced(undefined)
      setSelectedPoints(5)
      setSelectedGoal(undefined)
      setShowAdvanced(false)
      setShowDescription(false)
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo()
    }
  }

  const handleCreateFromTemplate = async (templateId: string) => {
    try {
      await createTodoFromTemplate(templateId)
    } catch (error) {
      console.error('Failed to create todo from template:', error)
    }
  }

  // Get points statistics (unused for now)
  // const pointsStats = getPointsStats()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header - Mobile optimized */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Tasks</h1>
        <p className="text-sm text-gray-400">Manage your daily tasks and goals</p>
      </div>

      {/* Overdue Tasks Alert - Mobile optimized */}
      {overdueTodos.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-sm">
                {overdueTodos.length} overdue task
                {overdueTodos.length > 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points Summary Dashboard - Mobile optimized */}
      {todos.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {todos.filter(t => t.done).reduce((sum, t) => sum + (t.points || 5), 0)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Points Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {todos.reduce((sum, t) => sum + (t.points || 5), 0)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Total Points</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {incompleteTodos.reduce((sum, t) => sum + (t.points || 5), 0)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Remaining</p>
                </div>
              </div>
              <div className="text-center w-full sm:w-auto">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {Math.round((todos.filter(t => t.done).length / todos.length) * 100)}% Complete
                </p>
                <div className="mt-1 h-2 w-full sm:w-24 rounded-full bg-blue-200 dark:bg-blue-800">
                  <div 
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${(todos.filter(t => t.done).length / todos.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Todo Form - Mobile optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main input - Mobile optimized */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="What do you need to do?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-base"
              autoComplete="off"
            />
          </div>

          {/* Quick options - Mobile optimized grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              >
                                 {PRIORITIES.map((priority) => (
                   <option key={priority.value} value={priority.value}>
                     {priority.icon} {priority.label}
                   </option>
                 ))}
               </select>
             </div>

             <div className="space-y-1">
               <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Category</label>
               <select
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value as Category)}
                 className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
               >
                 {CATEGORIES.map((category) => (
                   <option key={category.value} value={category.value}>
                     {category.icon} {category.label}
                   </option>
                 ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Points</label>
              <PointSelector 
                value={selectedPoints} 
                onChange={setSelectedPoints}
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Goal</label>
                             <GoalSelector 
                 value={selectedGoal}
                 onChange={setSelectedGoal}
               />
            </div>
          </div>

          {/* Advanced options toggle - Mobile optimized */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex-1 sm:flex-none"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
              className="flex-1 sm:flex-none"
            >
              <FileText className="mr-2 h-4 w-4" />
              {showDescription ? 'Hide' : 'Add'} Description
            </Button>
          </div>

          {/* Advanced options */}
          {showAdvanced && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                <EnhancedDatePicker
                  value={dueDateTimeEnhanced}
                  onChange={setDueDateTimeEnhanced}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Description */}
          {showDescription && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <RichTextEditor
                value={taskDescription}
                onChange={setTaskDescription}
                placeholder="Add task details, notes, or links..."
                className="min-h-[100px]"
              />
            </div>
          )}

          {/* Add button - Mobile optimized */}
          <Button
            onClick={handleAddTodo}
            className="w-full sm:w-auto min-h-[44px]"
            disabled={!inputValue.trim() || isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      {/* Filters and Sort - Mobile optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters & Sort
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
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

             <div className="space-y-1">
               <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Category</label>
               <select
                 value={filterCategory}
                 onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Points</label>
              <select
                value={filterPoints}
                onChange={(e) => setFilterPoints(e.target.value as 'all' | 'low' | 'medium' | 'high')}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              >
                <option value="all">All Points</option>
                <option value="low">Low (1-3 pts)</option>
                <option value="medium">Medium (4-7 pts)</option>
                <option value="high">High (8+ pts)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created' | 'priority' | 'dueDate' | 'points')}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              >
                <option value="created">Created Date</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
                <option value="points">Points</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Lists - Mobile optimized */}
      <div className="space-y-4">
        {/* Templates Section - Mobile optimized */}
        {templates.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5" />
                Quick Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {templates.slice(0, 4).map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="justify-start text-left h-auto py-2 px-3"
                  >
                                         <div className="flex items-center gap-2 w-full">
                       <span className="text-lg">{CATEGORIES.find(c => c.value === template.category)?.icon}</span>
                       <div className="min-w-0 flex-1">
                         <div className="font-medium text-sm truncate">{template.text}</div>
                         <div className="text-xs text-gray-500">
                           {PRIORITIES.find(p => p.value === template.priority)?.label}
                         </div>
                       </div>
                     </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Incomplete Tasks */}
        {incompleteTodos.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">Active Tasks</span>
                <Badge variant="secondary" className="text-xs">
                  {incompleteTodos.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {incompleteTodos.map((todo) => (
                <EnhancedTodoRow key={todo.id} todo={todo} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Completed Tasks */}
        {completedTodos.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">Completed Tasks</span>
                <Badge variant="secondary" className="text-xs">
                  {completedTodos.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {completedTodos.map((todo) => (
                <EnhancedTodoRow key={todo.id} todo={todo} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {todos.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get started by adding your first task above
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
