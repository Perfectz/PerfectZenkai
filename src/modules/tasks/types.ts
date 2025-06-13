export type Priority = 'low' | 'medium' | 'high'
export type Category = 'work' | 'personal' | 'health' | 'learning' | 'other'

export interface Subtask {
  id: string;           // UUID v4
  text: string;         // Subtask description
  done: boolean;        // Completion status
  createdAt: string;    // ISO timestamp
}

export interface TaskTemplate {
  id: string;           // UUID v4
  name: string;         // Template name
  text: string;         // Default task text
  priority: Priority;   // Default priority
  category: Category;   // Default category
  subtasks: Omit<Subtask, 'id' | 'createdAt'>[];  // Default subtasks
  createdAt: string;    // ISO timestamp
}

export interface Todo {
  id: string;           // UUID v4
  text: string;         // Task description
  done: boolean;        // Completion status
  priority: Priority;   // Task priority
  category: Category;   // Task category
  dueDate?: string;     // ISO date string (optional)
  subtasks: Subtask[];  // Array of subtasks
  templateId?: string;  // Reference to template (optional)
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp for last edit
} 