// src/modules/notes/index.ts

export { useNotesStore, initializeNotesStore } from './store'
export { notesRepo, initializeNotesDatabase } from './repo'
export type { Note } from './types'

// Re-export initialization function for main.tsx
