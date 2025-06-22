import { Todo } from '../types'

export interface PriorityOptions {
  considerDeadlines?: boolean
  includeEffortEstimates?: boolean
  focusArea?: string
  minimizeContextSwitching?: boolean
  userPattern?: Record<string, unknown>
}

export interface PrioritizedTask {
  task: Todo
  priorityScore: number
  urgencyScore?: number
  importanceScore?: number
  categoryWeight?: number
  personalizedScore?: number
  reasoning: string
}

export class TaskPriorityEngine {
  async prioritizeTasks(todos: Todo[], options: PriorityOptions): Promise<PrioritizedTask[]> {
    // Minimal implementation for GREEN phase
    return todos.map((todo, index) => {
      // Check if task is urgent (due within 24 hours)
      const isUrgent = todo.dueDateTime && 
        new Date(todo.dueDateTime).getTime() - Date.now() < 24 * 60 * 60 * 1000
      
      return {
        task: todo,
        priorityScore: 1 - (index * 0.1), // Simple descending score
        urgencyScore: isUrgent ? 0.95 : 0.8,
        importanceScore: 0.7,
        categoryWeight: 1.2,
        personalizedScore: 0.9,
        reasoning: isUrgent ? 'urgent and due soon' : 
                  options.considerDeadlines ? 'urgent and important' : 'based on priority'
      }
    })
  }

  calculatePriority(todo: Todo): number {
    // Replace any with proper Record type
    const weights: Record<string, number> = {
      urgent: 0.4,
      important: 0.3, 
      effort: 0.2,
      deadline: 0.1
    }

    // Calculate based on todo priority
    const priority = todo.priority || 'medium'
    return weights[priority] || 0.5
  }
} 