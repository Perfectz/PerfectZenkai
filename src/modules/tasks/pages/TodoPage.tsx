import { useState, useEffect } from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { useTasksStore } from '../store'
import { TodoRow } from '../components/TodoRow'

export default function TodoPage() {
  const [inputValue, setInputValue] = useState('')
  const { todos, addTodo, loadTodos, isLoading } = useTasksStore()

  useEffect(() => {
    if (todos.length === 0) {
      loadTodos()
    }
  }, [todos.length, loadTodos])

  const incompleteTodos = todos.filter(todo => !todo.done)
  const completedTodos = todos.filter(todo => todo.done)

  const handleAddTodo = async () => {
    if (!inputValue.trim()) return

    try {
      await addTodo({
        text: inputValue.trim(),
        done: false,
        createdAt: new Date().toISOString()
      })
      setInputValue('')
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
    <div className="container mx-auto px-4 pb-24 pt-4">
      <h2 className="text-lg font-semibold mb-4">Tasks</h2>

      {/* Add new task input */}
      <div className="flex gap-2 mb-6">
        <Input
          id="new-task"
          placeholder="Add new task..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          size="icon"
          onClick={handleAddTodo}
          disabled={isLoading || !inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {/* Incomplete todos */}
      {!isLoading && (
        <>
          {incompleteTodos.length > 0 ? (
            <div className="space-y-2 mb-6">
              {incompleteTodos.map((todo) => (
                <TodoRow key={todo.id} todo={todo} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground mb-6">
              <p className="text-4xl mb-2">✅</p>
              <p>No pending tasks</p>
              <p className="text-sm">Add one above to get started</p>
            </div>
          )}

          {/* Completed todos */}
          {completedTodos.length > 0 && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Completed ({completedTodos.length})
                </h3>
                <div className="space-y-2">
                  {completedTodos.map((todo) => (
                    <TodoRow key={todo.id} todo={todo} />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
} 