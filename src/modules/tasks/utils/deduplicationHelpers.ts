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
 * Creates a "signature" of a todo's content for easy comparison.
 * This signature ignores volatile fields like IDs and timestamps.
 */
function getTodoContentSignature(todo: Todo): string {
  // Sort subtasks by text to ensure consistent signature
  const sortedSubtasks = [...todo.subtasks].sort((a, b) => a.text.localeCompare(b.text));
  
  return JSON.stringify({
    summary: todo.summary,
    description: todo.description,
    done: todo.done,
    priority: todo.priority,
    category: todo.category,
    dueDate: todo.dueDate,
    subtasks: sortedSubtasks.map(({ text, done }) => ({ text, done })),
  });
}

/**
 * Filter out todos that are duplicates by content, keeping the first one encountered.
 * This is much more efficient (O(n)) than the previous O(n^2) implementation.
 */
export function removeDuplicateContent(todos: Todo[]): Todo[] {
  const seenSignatures = new Set<string>();
  const filtered: Todo[] = [];
  let duplicateCount = 0;

  for (const todo of todos) {
    const signature = getTodoContentSignature(todo);
    
    if (!seenSignatures.has(signature)) {
      seenSignatures.add(signature);
      filtered.push(todo);
    } else {
      duplicateCount++;
      if (duplicateCount <= 3) {
        console.warn('🔄 Removed duplicate todo content:', { id: todo.id, summary: todo.summary });
      } else if (duplicateCount === 4) {
        console.warn(`🔄 ... and ${todos.length - filtered.length - 3} more duplicates removed`);
      }
    }
  }

  if (duplicateCount > 0) {
    console.log(`✅ Deduplication complete: ${filtered.length} unique todos, ${duplicateCount} duplicates removed`);
  }

  return filtered;
} 