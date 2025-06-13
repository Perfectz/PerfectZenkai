export * from './types'
export * from './store'
export { tasksRepo, initializeTasksDatabase } from './repo'

// Re-export initialization function for main.tsx
export { useTasksStore, initializeTasksStore } from './store'

export type { Todo } from './types'
