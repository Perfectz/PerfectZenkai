export interface Todo {
  id: string;           // UUID v4
  text: string;         // Task description
  done: boolean;        // Completion status
  createdAt: string;    // ISO timestamp
} 