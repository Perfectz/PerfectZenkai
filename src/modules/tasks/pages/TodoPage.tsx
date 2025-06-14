import { useState, useEffect } from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Plus, Filter, Layout, Calendar, AlertCircle, FileText, Star } from 'lucide-react'
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
import { Progress } from '@/shared/ui/progress'

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
    getPointsStats,
    isLoading,
  } = useTasksStore()

  useEffect(() => {
    if (todos.length === 0) {
      loadTodos()
    }
    if (templates.length === 0) {
      loadTemplates()
    }
  }, [todos.length, templates.length, loadTodos, loadTemplates])

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

  // Get points statistics
  const pointsStats = getPointsStats()

  return (
    <div className="container mx-auto space-y-6 px-4 pb-24 pt-4">
      {/* Overdue Tasks Alert */}
      {overdueTodos.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                {overdueTodos.length} overdue task
                {overdueTodos.length > 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points Summary Dashboard */}
      {todos.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {todos.filter(t => t.done).reduce((sum, t) => sum + (t.points || 5), 0)}
                  </p>
                  <p className="text-xs text-blue-600">Points Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {todos.reduce((sum, t) => sum + (t.points || 5), 0)}
                  </p>
                  <p className="text-xs text-blue-600">Total Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {incompleteTodos.reduce((sum, t) => sum + (t.points || 5), 0)}
                  </p>
                  <p className="text-xs text-blue-600">Remaining</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-blue-700">
                  {Math.round((todos.filter(t => t.done).length / todos.length) * 100)}% Complete
                </p>
                <div className="mt-1 h-2 w-24 rounded-full bg-blue-200">
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

      {/* Points Dashboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Points Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pointsStats.dailyPoints}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{pointsStats.weeklyPoints}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{pointsStats.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pointsStats.completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{pointsStats.totalPoints} / {pointsStats.totalPossiblePoints} points</span>
            </div>
            <Progress 
              value={(pointsStats.totalPoints / pointsStats.totalPossiblePoints) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add New Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Quest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main input */}
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
              onClick={() => setShowDescription(!showDescription)}
              variant="outline"
              size="icon"
              className={showDescription ? 'bg-muted' : ''}
              title="Add description"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleAddTodo}
              disabled={isLoading || !inputValue.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Essential options - Always visible */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Points */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Difficulty Points (1-10)
              </label>
              <PointSelector
                value={selectedPoints}
                onChange={setSelectedPoints}
                size="sm"
                showLabel={false}
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>
              <div className="grid grid-cols-2 gap-1">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.value}
                    variant={
                      selectedCategory === category.value
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className="text-xs"
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Link to Goal
              </label>
              <GoalSelector
                value={selectedGoal}
                onChange={setSelectedGoal}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Due Date & Time
              </label>
              <EnhancedDatePicker
                value={dueDateTimeEnhanced}
                onChange={setDueDateTimeEnhanced}
                placeholder="e.g., tomorrow 2pm"
                className="w-full"
              />
            </div>
          </div>

          {/* Priority and task summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Priority:</label>
              <div className="flex gap-1">
                {PRIORITIES.map((priority) => (
                  <Button
                    key={priority.value}
                    variant={
                      selectedPriority === priority.value
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => setSelectedPriority(priority.value)}
                  >
                    <span className="mr-1">{priority.icon}</span>
                    {priority.label}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              size="sm"
              className={showAdvanced ? 'bg-muted' : ''}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showAdvanced ? 'Hide' : 'More'} Options
            </Button>
          </div>

          {/* Task Summary */}
          {inputValue.trim() && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">New Task Preview:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedPoints} {selectedPoints === 1 ? 'point' : 'points'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {CATEGORIES.find(c => c.value === selectedCategory)?.icon} {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {PRIORITIES.find(p => p.value === selectedPriority)?.icon} {PRIORITIES.find(p => p.value === selectedPriority)?.label}
                  </Badge>
                  {dueDateTimeEnhanced && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="mr-1 h-3 w-3" />
                      Due: {new Date(dueDateTimeEnhanced).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description section */}
          {showDescription && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Task Description (Optional)
              </label>
              <RichTextEditor
                value={taskDescription}
                onChange={(content) => setTaskDescription(content)}
                placeholder="Add detailed description, notes, or instructions..."
                minHeight={100}
                maxLength={2000}
              />
            </div>
          )}

          {/* Additional advanced options */}
          {showAdvanced && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Additional Options</h4>
                
                {/* Fallback basic date picker */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm">Basic date fallback:</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="flex-1 max-w-xs text-xs"
                    placeholder="Basic date fallback"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Templates */}
          {templates.length > 0 && (
            <div>
              <label className="mb-2 block flex items-center gap-2 text-sm font-medium">
                <Layout className="h-4 w-4" />
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="text-xs"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Priority:</span>
              <div className="flex gap-1">
                <Button
                  variant={filterPriority === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPriority('all')}
                  className="text-xs"
                >
                  All
                </Button>
                {PRIORITIES.map((priority) => (
                  <Button
                    key={priority.value}
                    variant={
                      filterPriority === priority.value ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setFilterPriority(priority.value)}
                    className="text-xs"
                  >
                    {priority.icon}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Category:</span>
              <div className="flex gap-1">
                <Button
                  variant={filterCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory('all')}
                  className="text-xs"
                >
                  All
                </Button>
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.value}
                    variant={
                      filterCategory === category.value ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setFilterCategory(category.value)}
                    className="text-xs"
                  >
                    {category.icon}
                  </Button>
                ))}
              </div>
            </div>

            {/* Points Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Points:</span>
              <div className="flex gap-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'low', label: '1-3' },
                  { value: 'medium', label: '4-7' },
                  { value: 'high', label: '8-10' },
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={filterPoints === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterPoints(filter.value as 'all' | 'low' | 'medium' | 'high')}
                    className="text-xs"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort:</span>
              <div className="flex gap-1">
                {[
                  { value: 'created', label: 'Created' },
                  { value: 'priority', label: 'Priority' },
                  { value: 'dueDate', label: 'Due Date' },
                  { value: 'points', label: 'Points' },
                ].map((sort) => (
                  <Button
                    key={sort.value}
                    variant={sortBy === sort.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setSortBy(
                        sort.value as 'created' | 'priority' | 'dueDate' | 'points'
                      )
                    }
                    className="text-xs"
                  >
                    {sort.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {/* Active Tasks */}
      {!isLoading && (
        <>
          {incompleteTodos.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Quests</h3>
                <Badge variant="outline">{incompleteTodos.length}</Badge>
              </div>
              <div className="space-y-2">
                {incompleteTodos.map((todo) => (
                  <EnhancedTodoRow key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p className="mb-2 text-4xl">🎉</p>
              <p className="text-lg font-medium">All quests completed!</p>
              <p className="text-sm">Ready for new adventures?</p>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTodos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Completed Quests
                </h3>
                <Badge variant="outline">{completedTodos.length}</Badge>
              </div>
              <div className="space-y-2">
                {completedTodos.map((todo) => (
                  <EnhancedTodoRow key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
