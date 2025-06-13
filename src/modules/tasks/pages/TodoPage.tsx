import { useState, useEffect } from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Plus, Filter, Layout, Calendar, AlertCircle } from 'lucide-react'
import { useTasksStore } from '../store'
import { TodoRow } from '../components/TodoRow'
import { Priority, Category } from '../types'
import { PRIORITIES, CATEGORIES, sortTodosByPriority, sortTodosByDueDate } from '../utils'

export default function TodoPage() {
  const [inputValue, setInputValue] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium')
  const [selectedCategory, setSelectedCategory] = useState<Category>('other')
  const [dueDate, setDueDate] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'dueDate'>('created')

  const { todos, templates, addTodo, loadTodos, loadTemplates, createTodoFromTemplate, getOverdueTodos, isLoading } = useTasksStore()

  useEffect(() => {
    if (todos.length === 0) {
      loadTodos()
    }
    if (templates.length === 0) {
      loadTemplates()
    }
  }, [todos.length, templates.length, loadTodos, loadTemplates])

  // Filter todos based on selected filters
  const filteredTodos = todos.filter(todo => {
    if (filterPriority !== 'all' && todo.priority !== filterPriority) return false
    if (filterCategory !== 'all' && todo.category !== filterCategory) return false
    return true
  })

  // Sort todos based on selected sort option
  const sortedTodos = (() => {
    switch (sortBy) {
      case 'priority':
        return sortTodosByPriority(filteredTodos)
      case 'dueDate':
        return sortTodosByDueDate(filteredTodos)
      default:
        return [...filteredTodos].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }
  })()

  const incompleteTodos = sortedTodos.filter(todo => !todo.done)
  const completedTodos = sortedTodos.filter(todo => todo.done)
  const overdueTodos = getOverdueTodos()

  const handleAddTodo = async () => {
    if (!inputValue.trim()) return

    try {
      await addTodo({
        text: inputValue.trim(),
        done: false,
        priority: selectedPriority,
        category: selectedCategory,
        dueDate: dueDate || undefined,
        subtasks: [],
        createdAt: new Date().toISOString()
      })
      setInputValue('')
      setDueDate('')
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

  const handleCreateFromTemplate = async (templateId: string) => {
    try {
      await createTodoFromTemplate(templateId)
    } catch (error) {
      console.error('Failed to create todo from template:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 pb-24 pt-4 space-y-6">      
      {/* Overdue Tasks Alert */}
      {overdueTodos.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                {overdueTodos.length} overdue task{overdueTodos.length > 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

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
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              size="icon"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleAddTodo}
              disabled={isLoading || !inputValue.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Advanced options */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Priority */}
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <div className="flex gap-1">
                  {PRIORITIES.map((priority) => (
                    <Button
                      key={priority.value}
                      variant={selectedPriority === priority.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPriority(priority.value)}
                      className="flex-1"
                    >
                      <span className="mr-1">{priority.icon}</span>
                      {priority.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
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

              {/* Due Date */}
              <div>
                <label className="text-sm font-medium mb-2 block">Due Date</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Templates */}
          {templates.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Quick Templates
              </label>
              <div className="flex gap-2 flex-wrap">
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
          <div className="flex items-center gap-4 flex-wrap">
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
                    variant={filterPriority === priority.value ? 'default' : 'outline'}
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
                    variant={filterCategory === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(category.value)}
                    className="text-xs"
                  >
                    {category.icon}
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
                  { value: 'dueDate', label: 'Due Date' }
                ].map((sort) => (
                  <Button
                    key={sort.value}
                    variant={sortBy === sort.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy(sort.value as any)}
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
                  <TodoRow key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-lg font-medium">All quests completed!</p>
              <p className="text-sm">Ready for new adventures?</p>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTodos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-muted-foreground">Completed Quests</h3>
                <Badge variant="outline">{completedTodos.length}</Badge>
              </div>
              <div className="space-y-2">
                {completedTodos.map((todo) => (
                  <TodoRow key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
} 