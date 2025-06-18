import { Todo } from '../types'

/**
 * Deduplicate todos by ID, keeping the most recently updated version
 */
export function deduplicateTodos(todos: Todo[]): Todo[] {
  const todoMap = new Map<string, Todo>()
  
  for (const todo of todos) {
    const existing = todoMap.get(todo.id)
    
    if (!existing) {
      todoMap.set(todo.id, todo)
    } else {
      // Keep the most recently updated version
      const existingUpdated = new Date(existing.updatedAt).getTime()
      const currentUpdated = new Date(todo.updatedAt).getTime()
      
      if (currentUpdated > existingUpdated) {
        todoMap.set(todo.id, todo)
      }
    }
  }
  
  return Array.from(todoMap.values())
}

/**
 * Merge local and cloud todos, preventing duplicates and resolving conflicts
 */
export function mergeLocalAndCloudTodos(localTodos: Todo[], cloudTodos: Todo[]): Todo[] {
  const allTodos = [...localTodos, ...cloudTodos]
  return deduplicateTodos(allTodos)
}

/**
 * Check if two todos are effectively the same (same content, different timestamps)
 */
export function todosAreEquivalent(todo1: Todo, todo2: Todo): boolean {
  return (
    todo1.summary === todo2.summary &&
    todo1.description === todo2.description &&
    todo1.done === todo2.done &&
    todo1.priority === todo2.priority &&
    todo1.category === todo2.category &&
    todo1.dueDate === todo2.dueDate &&
    JSON.stringify(todo1.subtasks) === JSON.stringify(todo2.subtasks)
  )
}

/**
 * Filter out todos that are duplicates but not exact ID matches
 */
export function removeDuplicateContent(todos: Todo[]): Todo[] {
  const filtered: Todo[] = []
  
  for (const todo of todos) {
    const isDuplicate = filtered.some(existing => 
      existing.id !== todo.id && todosAreEquivalent(existing, todo)
    )
    
    if (!isDuplicate) {
      filtered.push(todo)
    } else {
      console.warn('🔄 Removed duplicate todo content:', { id: todo.id, summary: todo.summary })
    }
  }
  
  return filtered
} 