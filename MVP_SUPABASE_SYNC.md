# MVP: Supabase Data Synchronization
# Cross-Platform Data Sync for PerfectZenkai

## 📋 **Executive Summary**

**Objective**: Integrate Supabase to synchronize data between local storage (IndexedDB) and cloud, enabling seamless data access across desktop browsers and mobile native applications.

**Current State**: PerfectZenkai uses an offline-first architecture with user-specific IndexedDB databases via Dexie, Google OAuth authentication, and Zustand state management.

**Target State**: Hybrid local-cloud sync ensuring data availability across all user devices while maintaining offline-first performance.

## 🔍 **Current Architecture Analysis**

### **Data Management Stack**
- **Local Storage**: Dexie (IndexedDB wrapper) with user-specific databases
- **State Management**: Zustand stores for Weight, Tasks, Notes
- **Authentication**: Google OAuth with JWT tokens
- **Data Isolation**: User-specific database naming (`WeightDatabase_${userId}`)

### **Existing Data Models**
```typescript
// Weight Tracking
interface WeightEntry {
  id: string
  dateISO: string  // YYYY-MM-DD format
  kg: number
}

// Task Management
interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: string
}

// Notes System
interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}
```

### **Current User Flow**
1. Google OAuth login → User ID extraction
2. User-specific databases initialized (`DatabaseName_${userId}`)
3. All CRUD operations via repository pattern
4. Zustand stores manage UI state
5. Data persists locally with user isolation

## 🎯 **MVP Objectives**

### **Primary Goals**
1. **Cross-Platform Sync**: Same data on desktop browser and mobile app
2. **Offline-First Maintained**: Local operations remain primary
3. **Conflict Resolution**: Handle simultaneous edits across devices
4. **Performance**: Minimal impact on current app speed
5. **Data Integrity**: No data loss during sync operations

### **Success Metrics**
- **Sync Latency**: <5 seconds for data propagation
- **Offline Performance**: No degradation when cloud unavailable
- **Data Consistency**: 99.9% conflict resolution success
- **User Experience**: Seamless sync without user intervention

## 🏗️ **Proposed Architecture**

### **Hybrid Sync Strategy**

1. **Local-First Operations**
   - All user actions write to local Dexie first
   - UI updates immediately from local data
   - Background sync queue processes cloud operations

2. **Sync Queue System**
   - Queue pending changes for cloud sync
   - Handle offline scenarios gracefully
   - Retry failed operations with exponential backoff

3. **Real-time Synchronization**
   - Supabase real-time subscriptions for live updates
   - Conflict resolution using last-write-wins with timestamp
   - Merge strategies for different data types

## 🗄️ **Supabase Schema Design**

### **Database Tables**

```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  name TEXT,
  picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight entries with user isolation
CREATE TABLE weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date_iso DATE NOT NULL,
  kg DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  local_id TEXT, -- Original UUID from local storage
  device_id TEXT, -- Track which device created the entry
  UNIQUE(user_id, date_iso) -- One weight entry per day per user
);

-- Task entries
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  local_id TEXT,
  device_id TEXT
);

-- Notes entries
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  local_id TEXT,
  device_id TEXT
);

-- Sync metadata tracking
CREATE TABLE sync_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_id TEXT NOT NULL,
  UNIQUE(user_id, table_name, device_id)
);
```

### **Row Level Security (RLS)**

```sql
-- Enable RLS on all tables
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can access their own weight entries" ON weight_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own sync metadata" ON sync_metadata
  FOR ALL USING (auth.uid() = user_id);
```

## 🔧 **Implementation Plan**

### **Phase 1: Foundation Setup (Week 1-2)**

#### **1.1 Supabase Project Setup**
```bash
# Install Supabase client
npm install @supabase/supabase-js

# Environment configuration
echo "VITE_SUPABASE_URL=your_supabase_url" >> .env
echo "VITE_SUPABASE_ANON_KEY=your_anon_key" >> .env
```

#### **1.2 Supabase Client Configuration**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

#### **1.3 Authentication Integration**
```typescript
// src/modules/auth/services/supabaseAuth.ts
import { supabase } from '@/lib/supabase'

export const supabaseAuthService = {
  async signInWithGoogleToken(googleToken: string) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: googleToken
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}
```

### **Phase 2: Sync Infrastructure (Week 3-4)**

#### **2.1 Sync Queue System**
```typescript
// src/shared/sync/syncQueue.ts
interface SyncOperation {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  table: 'weight_entries' | 'todos' | 'notes'
  data: any
  localId: string
  timestamp: string
  retries: number
}

class SyncQueue {
  private queue: SyncOperation[] = []
  private processing = false

  async addOperation(operation: Omit<SyncOperation, 'id' | 'retries'>) {
    const syncOp: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      retries: 0
    }
    
    this.queue.push(syncOp)
    await this.saveQueue()
    this.processQueue()
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true
    
    while (this.queue.length > 0) {
      const operation = this.queue[0]
      
      try {
        await this.executeOperation(operation)
        this.queue.shift() // Remove successful operation
      } catch (error) {
        operation.retries++
        if (operation.retries >= 3) {
          // Move to dead letter queue or handle permanently failed operations
          this.queue.shift()
        }
        break // Stop processing on error, retry later
      }
    }
    
    this.processing = false
    await this.saveQueue()
  }
}
```

#### **2.2 Bidirectional Sync Service**
```typescript
// src/shared/sync/syncService.ts
import { supabase } from '@/lib/supabase'

export class SyncService {
  private userId: string
  private deviceId: string

  constructor(userId: string) {
    this.userId = userId
    this.deviceId = this.getOrCreateDeviceId()
  }

  // Push local changes to cloud
  async pushLocalChanges(tableName: string, localData: any[]) {
    const cloudData = await this.getCloudData(tableName)
    const changes = this.calculateDelta(localData, cloudData)
    
    for (const change of changes) {
      await this.pushChange(tableName, change)
    }
  }

  // Pull cloud changes to local
  async pullCloudChanges(tableName: string) {
    const lastSync = await this.getLastSyncTimestamp(tableName)
    const { data: changes } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', this.userId)
      .gte('updated_at', lastSync)

    return changes || []
  }

  // Merge changes with conflict resolution
  async mergeChanges(tableName: string, cloudChanges: any[], localData: any[]) {
    const merged = [...localData]
    
    for (const cloudChange of cloudChanges) {
      const localIndex = merged.findIndex(item => 
        item.id === cloudChange.local_id || item.id === cloudChange.id
      )
      
      if (localIndex >= 0) {
        // Conflict resolution: last-write-wins
        if (new Date(cloudChange.updated_at) > new Date(merged[localIndex].updatedAt)) {
          merged[localIndex] = this.mapCloudToLocal(cloudChange)
        }
      } else {
        // New item from cloud
        merged.push(this.mapCloudToLocal(cloudChange))
      }
    }
    
    return merged
  }
}
```

### **Phase 3: Repository Pattern Enhancement (Week 5-6)**

#### **3.1 Enhanced Weight Repository**
```typescript
// src/modules/weight/repo.ts (enhanced)
import { SyncService } from '@/shared/sync/syncService'
import { SyncQueue } from '@/shared/sync/syncQueue'

export class WeightRepository {
  private syncService: SyncService
  private syncQueue: SyncQueue
  private database: WeightDatabase

  constructor(userId: string) {
    this.database = new WeightDatabase(userId)
    this.syncService = new SyncService(userId)
    this.syncQueue = new SyncQueue()
  }

  async addWeight(entry: Omit<WeightEntry, 'id'>): Promise<WeightEntry> {
    // 1. Add to local database first (offline-first)
    const newEntry: WeightEntry = {
      id: uuidv4(),
      ...entry
    }
    
    await this.database.weights.add(newEntry)
    
    // 2. Queue for cloud sync
    await this.syncQueue.addOperation({
      type: 'CREATE',
      table: 'weight_entries',
      data: newEntry,
      localId: newEntry.id,
      timestamp: new Date().toISOString()
    })
    
    return newEntry
  }

  async syncWithCloud(): Promise<void> {
    try {
      // 1. Push local changes
      const localWeights = await this.getAllWeights()
      await this.syncService.pushLocalChanges('weight_entries', localWeights)
      
      // 2. Pull cloud changes
      const cloudChanges = await this.syncService.pullCloudChanges('weight_entries')
      
      // 3. Merge and resolve conflicts
      const mergedData = await this.syncService.mergeChanges(
        'weight_entries',
        cloudChanges,
        localWeights
      )
      
      // 4. Update local database
      await this.database.weights.clear()
      await this.database.weights.bulkAdd(mergedData)
      
    } catch (error) {
      console.error('Weight sync failed:', error)
      throw error
    }
  }
}
```

### **Phase 4: Real-time Synchronization (Week 7-8)**

#### **4.1 Real-time Listeners**
```typescript
// src/shared/sync/realtimeSync.ts
import { supabase } from '@/lib/supabase'

export class RealtimeSync {
  private subscriptions: Map<string, any> = new Map()

  async startListening(userId: string, onDataChange: (data: any) => void) {
    // Subscribe to weight entries changes
    const weightSub = supabase
      .channel(`weight_changes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weight_entries',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.handleRealtimeChange('weight_entries', payload, onDataChange)
        }
      )
      .subscribe()

    this.subscriptions.set('weight_entries', weightSub)
  }

  private async handleRealtimeChange(
    table: string,
    payload: any,
    onDataChange: (data: any) => void
  ) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    // Ignore changes from current device to prevent loops
    if (newRecord?.device_id === this.getCurrentDeviceId()) {
      return
    }
    
    // Apply change to local database
    await this.applyChangeLocally(table, eventType, newRecord, oldRecord)
    
    // Notify UI to refresh
    onDataChange({ table, eventType, data: newRecord || oldRecord })
  }
}
```

### **Phase 5: Enhanced Store Integration (Week 9-10)**

#### **5.1 Sync-Aware Zustand Stores**
```typescript
// src/modules/weight/store.ts (enhanced)
import { RealtimeSync } from '@/shared/sync/realtimeSync'

interface WeightState {
  weights: WeightEntry[]
  isLoading: boolean
  isSyncing: boolean
  syncError: string | null
  lastSyncAt: Date | null
  
  // Enhanced actions
  addWeight: (entry: Omit<WeightEntry, 'id'>) => Promise<void>
  syncWithCloud: () => Promise<void>
  startRealtimeSync: () => void
  stopRealtimeSync: () => void
}

export const useWeightStore = create<WeightState>((set, get) => {
  const realtimeSync = new RealtimeSync()
  
  return {
    // ... existing state
    isSyncing: false,
    syncError: null,
    lastSyncAt: null,

    addWeight: async (entry) => {
      try {
        set({ isLoading: true, error: null })
        
        // Add to local repo (which handles sync queue)
        const newEntry = await weightRepo.addWeight(entry)
        
        set((state) => ({
          weights: [newEntry, ...state.weights].sort((a, b) => 
            new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
          ),
          isLoading: false
        }))

        // Trigger background sync
        get().syncWithCloud()
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to add weight',
          isLoading: false 
        })
      }
    },

    syncWithCloud: async () => {
      try {
        set({ isSyncing: true, syncError: null })
        
        await weightRepo.syncWithCloud()
        
        // Refresh local data after sync
        const weights = await weightRepo.getAllWeights()
        
        set({ 
          weights, 
          isSyncing: false, 
          lastSyncAt: new Date() 
        })
      } catch (error) {
        set({ 
          syncError: error instanceof Error ? error.message : 'Sync failed',
          isSyncing: false 
        })
      }
    }
  }
})
```

## 🧪 **Testing Strategy**

### **Unit Tests**
- **Sync Queue Operations**: Test queue management and retry logic
- **Conflict Resolution**: Test merge strategies with various scenarios
- **Repository Methods**: Test enhanced CRUD operations with sync
- **Real-time Handlers**: Test real-time change processing

### **Integration Tests**
- **End-to-End Sync**: Test complete sync cycle between devices
- **Offline Scenarios**: Test behavior when cloud is unavailable
- **Authentication Flow**: Test Supabase auth integration with Google OAuth
- **Data Consistency**: Test data integrity across sync operations

### **Manual Testing Scenarios**

#### **Cross-Device Sync Test**
1. **Device A**: Add weight entry, note, and task
2. **Device B**: Verify data appears within 5 seconds
3. **Device B**: Modify the same data
4. **Device A**: Verify changes sync back
5. **Both Devices**: Go offline, make changes, come online
6. **Verification**: Ensure conflict resolution works correctly

#### **Offline-First Test**
1. Disconnect from internet
2. Add/modify data locally
3. Verify UI remains responsive
4. Reconnect to internet
5. Verify data syncs automatically

## 📈 **Performance Considerations**

### **Optimization Strategies**

#### **Efficient Sync Operations**
- **Delta Sync**: Only sync changed data, not full datasets
- **Batching**: Group multiple operations into single API calls
- **Debouncing**: Prevent excessive sync calls during rapid user input
- **Compression**: Compress large payloads before transmission

#### **Local Performance**
- **Indexing**: Maintain Dexie indexes for fast local queries
- **Lazy Loading**: Load data on-demand for large datasets
- **Memory Management**: Clean up unused subscriptions and listeners
- **Background Processing**: Use Web Workers for heavy sync operations

## 🚀 **Deployment Strategy**

### **Environment Configuration**

#### **Development**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SYNC_ENABLED=true
VITE_SYNC_INTERVAL=30000
```

#### **Production**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SYNC_ENABLED=true
VITE_SYNC_INTERVAL=10000
VITE_REALTIME_ENABLED=true
```

### **Feature Flags**

```typescript
// src/shared/config/features.ts
export const features = {
  syncEnabled: import.meta.env.VITE_SYNC_ENABLED === 'true',
  realtimeEnabled: import.meta.env.VITE_REALTIME_ENABLED === 'true',
  syncInterval: parseInt(import.meta.env.VITE_SYNC_INTERVAL || '30000'),
  batchSize: 50,
  maxRetries: 3
}
```

## 📱 **Mobile App Considerations**

### **React Native Integration**

For the mobile native app, the same Supabase integration can be used with platform-specific considerations:

```typescript
// Mobile-specific sync considerations
export class MobileSyncService extends SyncService {
  constructor(userId: string) {
    super(userId)
    
    // Mobile-specific optimizations
    this.setupNetworkStateListener()
    this.setupAppStateListener()
  }

  private setupNetworkStateListener() {
    // Listen for network connectivity changes
    // Trigger sync when connection restored
  }

  private setupAppStateListener() {
    // Sync when app comes to foreground
    // Pause real-time subscriptions when backgrounded
  }
}
```

### **Platform Differences**
- **Storage**: Use AsyncStorage or SQLite for React Native
- **Background Sync**: Handle platform-specific background processing
- **Push Notifications**: Notify users of sync conflicts or updates
- **Battery Optimization**: Adjust sync frequency based on battery level

## 🔒 **Security & Privacy**

### **Data Protection**
- **Row Level Security**: Supabase RLS ensures user data isolation
- **JWT Validation**: All requests validated against Supabase auth
- **Local Encryption**: Consider encrypting sensitive local data
- **Audit Logging**: Track all sync operations for debugging

### **Privacy Compliance**
- **Data Residency**: Configure Supabase region for GDPR compliance
- **User Consent**: Inform users about cloud sync and provide opt-out
- **Data Export**: Maintain ability to export all user data
- **Right to Deletion**: Implement complete user data removal

## 💰 **Cost Analysis**

### **Supabase Pricing Considerations**

#### **Free Tier Limits**
- **Database Size**: 500MB
- **Bandwidth**: 5GB
- **Auth Users**: 50,000
- **Realtime**: 200 concurrent connections

#### **Estimated Usage (1000 Active Users)**
- **Storage**: ~100MB (user data is lightweight)
- **Bandwidth**: ~2GB/month (sync operations)
- **Realtime**: ~50 concurrent connections
- **Auth**: Well within limits

**Estimated Monthly Cost**: $0 (Free tier sufficient for MVP)

## 🔄 **Migration Strategy**

### **Existing User Data Migration**

```typescript
// src/shared/sync/migration.ts
export class DataMigration {
  async migrateExistingUser(userId: string) {
    try {
      // 1. Export existing local data
      const localData = await this.exportLocalData(userId)
      
      // 2. Check if user has cloud data
      const hasCloudData = await this.checkCloudData(userId)
      
      if (!hasCloudData) {
        // 3. First-time sync: upload all local data
        await this.uploadLocalData(userId, localData)
      } else {
        // 4. Merge with existing cloud data
        await this.mergeDataSets(userId, localData)
      }
      
      // 5. Mark migration complete
      await this.markMigrationComplete(userId)
      
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }
}
```

## 📊 **Success Metrics & KPIs**

### **Technical Metrics**
- **Sync Success Rate**: >99% of sync operations complete successfully
- **Sync Latency**: <5 seconds average time for data propagation
- **Conflict Resolution**: <1% of operations result in conflicts
- **Offline Performance**: No degradation in app responsiveness

### **User Experience Metrics**
- **Data Consistency**: Users report consistent data across devices
- **Sync Transparency**: Users unaware of sync operations (seamless)
- **Error Recovery**: Quick recovery from sync failures
- **Cross-Platform Usage**: Increased usage across multiple devices

## 🛠️ **Maintenance & Support**

### **Monitoring Dashboard**
```typescript
// Basic sync health monitoring
export const syncHealthCheck = async () => {
  const metrics = {
    queueSize: await syncQueue.getSize(),
    lastSuccessfulSync: await getLastSyncTime(),
    failedOperations: await getFailedOperationsCount(),
    activeSubscriptions: realtimeSync.getActiveSubscriptions()
  }
  
  return metrics
}
```

### **User Support Tools**
- **Sync Status UI**: Show users their sync status and last sync time
- **Manual Sync Trigger**: Allow users to manually trigger sync
- **Conflict Resolution UI**: Let users choose resolution for conflicts
- **Data Export**: Always maintain local data export capability

## 🎯 **MVP Completion Criteria**

### **Must-Have Features**
- ✅ **Offline-First**: All operations work without internet
- ✅ **Cross-Platform Sync**: Data syncs between desktop and mobile
- ✅ **Conflict Resolution**: Automatic handling of simultaneous edits
- ✅ **Real-time Updates**: Changes appear on other devices within 5 seconds
- ✅ **Data Integrity**: No data loss during sync operations

### **Success Validation**
1. **Two-Device Test**: Same user account on two devices shows identical data
2. **Offline Test**: App works normally without internet connection
3. **Conflict Test**: Simultaneous edits resolve correctly
4. **Performance Test**: Sync operations don't impact app responsiveness
5. **Migration Test**: Existing users' data migrates successfully

## 📅 **Timeline Summary**

| Phase | Duration | Key Deliverables | Dependencies |
|-------|----------|------------------|--------------|
| **Phase 1** | Week 1-2 | Supabase setup, Auth integration | Supabase account, Schema design |
| **Phase 2** | Week 3-4 | Sync queue, Basic sync service | Phase 1 complete |
| **Phase 3** | Week 5-6 | Enhanced repositories | Phase 2 complete |
| **Phase 4** | Week 7-8 | Real-time sync | Phase 3 complete |
| **Phase 5** | Week 9-10 | Store integration, Testing | All phases complete |

**Total Estimated Duration**: 10 weeks

## 🚦 **Risk Mitigation**

### **Technical Risks**
- **Supabase Outages**: Maintain offline-first architecture as fallback
- **Sync Conflicts**: Implement robust conflict resolution strategies
- **Data Corruption**: Maintain local backups and export capabilities
- **Performance Impact**: Use background processing and efficient APIs

### **Business Risks**
- **Cost Overruns**: Monitor usage and implement usage-based scaling
- **User Adoption**: Maintain existing offline functionality as default
- **Migration Issues**: Thoroughly test migration with existing user data
- **Privacy Concerns**: Ensure transparent communication about data sync

---

This MVP document provides a comprehensive roadmap for integrating Supabase data synchronization while maintaining PerfectZenkai's offline-first architecture and excellent user experience. The phased approach ensures minimal disruption to existing functionality while adding powerful cross-platform sync capabilities. 