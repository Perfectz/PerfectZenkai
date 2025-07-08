import { getSupabaseClient } from '@/lib/supabase-client'
import { simpleTodoRepo } from '@/modules/tasks/repositories/SimpleTodoRepo'
import { weightRepo } from '@/modules/weight/repo'

export interface SyncOperation {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  table: string
  data: Record<string, unknown>
  localId: string
  timestamp: string
  retries: number
  maxRetries: number
  priority: 'high' | 'medium' | 'low'
}

export interface SyncStatus {
  isOnline: boolean
  lastSync: string | null
  pendingOperations: number
  syncInProgress: boolean
  errors: SyncError[]
}

export interface SyncError {
  id: string
  operation: SyncOperation
  error: string
  timestamp: string
  canRetry: boolean
}

export interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual'
  resolver?: (local: unknown, remote: unknown) => unknown
}

export class OfflineSyncService {
  private syncQueue: SyncOperation[] = []
  private status: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: null,
    pendingOperations: 0,
    syncInProgress: false,
    errors: []
  }
  private listeners: Array<(status: SyncStatus) => void> = []
  private syncInterval: number = 30000 // 30 seconds
  private intervalId: NodeJS.Timeout | null = null
  
  constructor() {
    this.setupNetworkListeners()
    this.loadSyncQueue()
    this.startSyncTimer()
  }

  /**
   * Add operation to sync queue for eventual consistency
   */
  async queueOperation(operation: Omit<SyncOperation, 'id' | 'retries'>): Promise<void> {
    const syncOp: SyncOperation = {
      id: crypto.randomUUID(),
      retries: 0,
      ...operation,
      maxRetries: operation.maxRetries || 3
    }

    this.syncQueue.push(syncOp)
    await this.saveSyncQueue()
    this.updateStatus({ pendingOperations: this.syncQueue.length })
    
    // Try immediate sync if online
    if (this.status.isOnline && !this.status.syncInProgress) {
      this.processSyncQueue()
    }
  }

  /**
   * Process the sync queue and attempt to sync with server
   */
  async processSyncQueue(): Promise<void> {
    if (this.status.syncInProgress || !this.status.isOnline || this.syncQueue.length === 0) {
      return
    }

    this.updateStatus({ syncInProgress: true })
    console.log(`🔄 Processing ${this.syncQueue.length} pending sync operations...`)

    const errors: SyncError[] = []
    let successCount = 0

    // Process operations in order (FIFO)
    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue[0]

      try {
        await this.executeOperation(operation)
        this.syncQueue.shift() // Remove successful operation
        successCount++
        console.log(`✅ Synced ${operation.type} operation for ${operation.table}`)
      } catch (error) {
        operation.retries++
        
        if (operation.retries >= operation.maxRetries) {
          // Move to error state
          const syncError: SyncError = {
            id: crypto.randomUUID(),
            operation,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            canRetry: this.isRetryableError(error)
          }
          errors.push(syncError)
          this.syncQueue.shift() // Remove failed operation
          console.error(`❌ Failed to sync ${operation.type} operation for ${operation.table}:`, error)
        } else {
          console.warn(`⚠️ Retry ${operation.retries}/${operation.maxRetries} for ${operation.type} operation`)
          break // Stop processing to retry later
        }
      }
    }

    await this.saveSyncQueue()
    
    this.updateStatus({
      syncInProgress: false,
      pendingOperations: this.syncQueue.length,
      lastSync: successCount > 0 ? new Date().toISOString() : this.status.lastSync,
      errors: [...this.status.errors, ...errors]
    })

    if (successCount > 0) {
      localStorage.setItem('last-sync', this.status.lastSync!)
      console.log(`✅ Sync completed: ${successCount} operations synced`)
    }
  }

  /**
   * Execute a single sync operation against the server
   */
  private async executeOperation(operation: SyncOperation): Promise<void> {
    const supabase = await getSupabaseClient()
    
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const tableName = this.mapTableName(operation.table)
    
    switch (operation.type) {
      case 'CREATE':
        const { error: createError } = await supabase
          .from(tableName)
          .insert({ ...operation.data, user_id: user.id })
        
        if (createError) throw createError
        break

      case 'UPDATE':
        const { error: updateError } = await supabase
          .from(tableName)
          .update(operation.data)
          .eq('local_id', operation.localId)
          .eq('user_id', user.id)
        
        if (updateError) throw updateError
        break

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('local_id', operation.localId)
          .eq('user_id', user.id)
        
        if (deleteError) throw deleteError
        break

      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }

  /**
   * Pull changes from server and resolve conflicts
   */
  async pullServerChanges(
    tableName: string,
    conflictResolution: ConflictResolution = { strategy: 'server-wins' }
  ): Promise<{ applied: number; conflicts: number }> {
    const supabase = await getSupabaseClient()
    
    if (!supabase || !this.status.isOnline) {
      return { applied: 0, conflicts: 0 }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { applied: 0, conflicts: 0 }

    const lastSync = this.status.lastSync || '1970-01-01T00:00:00Z'
    const supabaseTableName = this.mapTableName(tableName)
    
    const { data: serverChanges, error } = await supabase
      .from(supabaseTableName)
      .select('*')
      .eq('user_id', user.id)
      .gte('updated_at', lastSync)
      .order('updated_at', { ascending: true })

    if (error) {
      console.error(`Failed to pull server changes for ${tableName}:`, error)
      return { applied: 0, conflicts: 0 }
    }

    if (!serverChanges || serverChanges.length === 0) {
      return { applied: 0, conflicts: 0 }
    }

    console.log(`📥 Pulled ${serverChanges.length} server changes for ${tableName}`)

    // Apply changes with conflict resolution
    let applied = 0
    let conflicts = 0

    for (const serverChange of serverChanges) {
      try {
        const result = await this.applyServerChange(tableName, serverChange, conflictResolution)
        if (result.conflict) {
          conflicts++
        } else {
          applied++
        }
      } catch (error) {
        console.error(`Failed to apply server change:`, error)
      }
    }

    return { applied, conflicts }
  }

  /**
   * Apply a server change with conflict resolution
   */
  private async applyServerChange(
    tableName: string,
    serverChange: Record<string, unknown>,
    conflictResolution: ConflictResolution
  ): Promise<{ applied: boolean; conflict: boolean }> {
    // This would be implemented per-table with specific database access
    // For now, return a mock implementation
    console.log(`Applying server change for ${tableName}:`, serverChange)
    
    // Check for local version
    const localId = serverChange.local_id as string
    if (localId) {
      // Check if local version exists and is newer
      const localVersion = await this.getLocalRecord(tableName, localId)
      
      if (localVersion) {
        const localUpdated = new Date(localVersion.updated_at as string)
        const serverUpdated = new Date(serverChange.updated_at as string)
        
        if (localUpdated > serverUpdated) {
          // Conflict detected
          switch (conflictResolution.strategy) {
            case 'client-wins':
              return { applied: false, conflict: true }
            case 'server-wins':
              await this.updateLocalRecord(tableName, localId, serverChange)
              return { applied: true, conflict: true }
            case 'merge':
              if (conflictResolution.resolver) {
                const merged = conflictResolution.resolver(localVersion, serverChange) as Record<string, unknown>
                await this.updateLocalRecord(tableName, localId, merged)
                return { applied: true, conflict: true }
              }
              break
            case 'manual':
              // Store conflict for manual resolution
              this.storeConflict(tableName, localVersion, serverChange)
              return { applied: false, conflict: true }
          }
        }
      }
    }

    // No conflict, apply server change
    await this.applyLocalChange(tableName, serverChange)
    return { applied: true, conflict: false }
  }

  /**
   * Force full sync of all data
   */
  async fullSync(): Promise<void> {
    if (!this.status.isOnline) {
      throw new Error('Cannot perform full sync while offline')
    }

    this.updateStatus({ syncInProgress: true })

    try {
      // Process pending operations first
      await this.processSyncQueue()
      
      // Pull server changes for all tables
      const tables = ['todos', 'weight_entries', 'meals', 'notes', 'workouts']
      
      for (const table of tables) {
        await this.pullServerChanges(table)
      }
      
      this.updateStatus({
        lastSync: new Date().toISOString(),
        errors: [] // Clear errors on successful full sync
      })
      
      localStorage.setItem('last-sync', this.status.lastSync!)
      console.log('✅ Full sync completed successfully')
      
    } catch (error) {
      console.error('❌ Full sync failed:', error)
      throw error
    } finally {
      this.updateStatus({ syncInProgress: false })
    }
  }

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status }
  }

  /**
   * Clear sync errors
   */
  clearErrors(): void {
    this.updateStatus({ errors: [] })
  }

  /**
   * Retry failed operations
   */
  async retryFailedOperations(): Promise<void> {
    const retryableErrors = this.status.errors.filter(e => e.canRetry)
    
    for (const error of retryableErrors) {
      // Reset retry count and add back to queue
      const operation = { ...error.operation, retries: 0 }
      this.syncQueue.unshift(operation) // Add to front for priority
    }
    
    // Clear retryable errors
    const nonRetryableErrors = this.status.errors.filter(e => !e.canRetry)
    this.updateStatus({ errors: nonRetryableErrors })
    
    await this.saveSyncQueue()
    
    if (this.status.isOnline) {
      this.processSyncQueue()
    }
  }

  /**
   * Private helper methods
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.status.isOnline = true
      console.log('🌐 Network connection restored')
      
      // Auto-sync when coming back online
      if (this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    })

    window.addEventListener('offline', () => {
      this.status.isOnline = false
      console.log('📵 Network offline')
    })
  }

  private startSyncTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.intervalId = setInterval(() => {
      if (this.status.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    }, this.syncInterval)
  }

  private updateStatus(updates: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...updates }
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.status)
      } catch (error) {
        console.error('Error in sync status listener:', error)
      }
    })
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      localStorage.setItem('sync-queue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Failed to save sync queue:', error)
    }
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('sync-queue')
      if (stored) {
        this.syncQueue = JSON.parse(stored)
        this.updateStatus({ pendingOperations: this.syncQueue.length })
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error)
      this.syncQueue = []
    }
  }

  private mapTableName(localTable: string): string {
    const tableMap: Record<string, string> = {
      'todos': 'todos',
      'weight_entries': 'weight_entries',
      'meals': 'meal_entries',
      'notes': 'notes',
      'workouts': 'workout_entries'
    }
    
    return tableMap[localTable] || localTable
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const retryableErrors = [
        'Network request failed',
        'timeout',
        'connection',
        'PGRST301' // Supabase timeout
      ]
      
      return retryableErrors.some(pattern => 
        error.message.toLowerCase().includes(pattern.toLowerCase())
      )
    }
    
    return false
  }

  private async getLocalRecord(tableName: string, localId: string): Promise<Record<string, unknown> | null> {
    switch (tableName) {
      case 'todos':
        return (await simpleTodoRepo.getTodoById(localId)) || null
      case 'weight_entries':
        return (await weightRepo.getWeightById(localId)) || null
      // Add other tables as needed
      default:
        console.warn(`No local record implementation for table: ${tableName}`)
        return null
    }
  }

  private async updateLocalRecord(tableName: string, localId: string, data: Record<string, unknown>): Promise<void> {
    switch (tableName) {
      case 'todos':
        await simpleTodoRepo.updateTodo(localId, data)
        break
      case 'weight_entries':
        await weightRepo.updateWeight(localId, data)
        break
      // Add other tables as needed
      default:
        console.warn(`No local update implementation for table: ${tableName}`)
    }
  }

  private async applyLocalChange(tableName: string, data: Record<string, unknown>): Promise<void> {
    switch (tableName) {
      case 'todos':
        await simpleTodoRepo.addTodo(data as any) // Assuming addTodo can handle partial updates or full objects
        break
      case 'weight_entries':
        await weightRepo.addWeight(data as any) // Assuming addWeight can handle partial updates or full objects
        break
      // Add other tables as needed
      default:
        console.warn(`No local apply change implementation for table: ${tableName}`)
    }
  }

  private storeConflict(tableName: string, local: Record<string, unknown>, remote: Record<string, unknown>): void {
    console.log(`Storing conflict for manual resolution in ${tableName}:`, { local, remote })
    // Would store in conflicts table/storage for manual resolution UI
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    this.listeners = []
    window.removeEventListener('online', this.setupNetworkListeners)
    window.removeEventListener('offline', this.setupNetworkListeners)
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService() 