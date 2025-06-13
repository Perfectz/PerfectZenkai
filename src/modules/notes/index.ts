// src/modules/notes/index.ts

export * from './types'
export * from './store'
export { notesRepo } from './repo'

// Re-export initialization function for main.tsx
export { initializeNotesStore } from './store'

// Routes will be added in the next step
export { notesRoutes } from './routes' 