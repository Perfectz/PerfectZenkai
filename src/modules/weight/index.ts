// src/modules/weight/index.ts

// Public API exports - no internal exports
export { useWeightStore, initializeWeightStore } from './store'
export { weightRepo, initializeWeightDatabase } from './repo'
export type { WeightEntry } from './types'

// Routes will be added in task 2.4
export { weightRoutes } from './routes'
