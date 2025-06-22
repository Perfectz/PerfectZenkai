# Perfect Zenkai - Technical Architecture

## 🏗️ **Architecture Overview**

Perfect Zenkai is built using **Vertical Slice Architecture** combined with **Domain-Driven Design** principles to create a maintainable, scalable, and type-safe Progressive Web Application.

---

## 🧱 **Core Architectural Principles**

### 1. **Vertical Slice Architecture**

Each feature is implemented as a complete vertical slice that includes all layers:

```
📁 Feature Module (e.g., weight/)
├── 🎨 UI Layer
│   ├── components/        # React components
│   └── pages/            # Route-level components
├── 🧠 Business Logic
│   ├── hooks/            # Custom React hooks
│   └── services/         # Domain services & AI agents
├── 💾 Data Layer
│   ├── stores/           # Zustand state management
│   ├── repo.ts           # Data access layer
│   └── types/            # TypeScript interfaces
├── 🧪 Testing
│   └── __tests__/        # Comprehensive test suites
└── 📄 Public API
    └── index.ts          # Module exports
```

### 2. **Domain-Driven Design**

The application is organized around business domains:

- **Weight Management** - Health tracking and goal setting
- **Task Management** - Productivity and time management
- **Mental Wellness** - Journaling and emotional health
- **AI Chat** - Intelligent assistant and insights
- **Daily Journal** - Standup and reflection workflows

### 3. **Type-Safe Development**

- **TypeScript Strict Mode** - Complete type safety
- **Interface-First Design** - All data structures defined upfront
- **Generic Type System** - Reusable type patterns
- **96.6% Error Reduction** - From 237 to 8 ESLint errors

---

## 🔧 **Technology Stack**

### **Frontend Framework**
```typescript
// React 18 with TypeScript
import React from 'react'
import { createRoot } from 'react-dom/client'

// Vite for build tooling
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
```

### **State Management**
```typescript
// Zustand for lightweight state management
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

interface AppStore {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    subscribeWithSelector((set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user })
    })),
    { name: 'app-store' }
  )
)
```

### **Data Persistence**
```typescript
// Dexie.js for IndexedDB (offline-first)
import Dexie, { Table } from 'dexie'

class AppDatabase extends Dexie {
  weights!: Table<WeightEntry>
  tasks!: Table<TodoItem>
  goals!: Table<Goal>

  constructor(userId?: string) {
    super(`PerfectZenkai_${userId || 'offline'}`)
    
    this.version(1).stores({
      weights: '++id, dateISO, kg, createdAt',
      tasks: '++id, summary, done, priority, createdAt',
      goals: '++id, title, isActive, createdAt'
    })
  }
}
```

### **UI Framework**
```typescript
// Tailwind CSS with custom design tokens
import { cn } from '@/shared/utils/cn'

export const Button = ({ variant, className, ...props }) => (
  <button
    className={cn(
      'px-4 py-2 rounded-lg font-mono transition-all',
      variant === 'primary' && 'bg-ki-green text-black',
      variant === 'secondary' && 'bg-gray-800 text-gray-300',
      className
    )}
    {...props}
  />
)
```

---

## 🤖 **AI Agent Architecture**

### **Function Registry Pattern**

The AI system uses a centralized function registry for tool calling:

```typescript
interface FunctionCallResult {
  success: boolean
  message: string
  data?: unknown
  error?: string
}

export const functionRegistry = {
  // Weight Management
  async addWeight(params: AddWeightParams): Promise<FunctionCallResult> {
    const entry = await hybridWeightRepo.addWeight(params)
    return {
      success: true,
      message: `✅ Weight logged: ${params.weight}kg`,
      data: entry
    }
  },

  // Task Management  
  async prioritizeTasks(params: PrioritizeTasksParams): Promise<FunctionCallResult> {
    const analysis = await TaskProductivityAgent.analyzeTasks(params)
    return {
      success: true,
      message: analysis.recommendations,
      data: analysis
    }
  }
}
```

### **Specialized AI Agents**

Each domain has a dedicated AI agent:

#### **TaskProductivityAgent**
```typescript
export class TaskProductivityAgent {
  static async analyzeTasks(params: AnalyzeTasksParams): Promise<ProductivityAnalysis> {
    const tasks = await tasksRepo.getAllTodos()
    const analytics = new ProductivityAnalyticsEngine()
    
    return {
      completionRate: analytics.calculateCompletionRate(tasks),
      bottlenecks: analytics.identifyBottlenecks(tasks),
      recommendations: analytics.generateRecommendations(tasks),
      trends: analytics.analyzeTrends(tasks)
    }
  }
}
```

#### **WeightManagementAgent**
```typescript
export class WeightManagementAgent {
  static async analyzeProgress(timeframe: string): Promise<WeightAnalysis> {
    const weights = await weightRepo.getAllWeights()
    const analytics = new WeightAnalyticsEngine()
    
    return {
      trend: analytics.calculateTrend(weights),
      prediction: analytics.predictFutureWeight(weights),
      goalProgress: analytics.analyzeGoalProgress(weights),
      recommendations: analytics.generateCoaching(weights)
    }
  }
}
```

#### **JournalWellnessAgent**
```typescript
export class JournalWellnessAgent {
  static async analyzeEmotionalState(entry: JournalEntry): Promise<EmotionalAnalysis> {
    const engine = new EmotionalAnalysisEngine()
    
    return {
      emotions: engine.detectEmotions(entry.content),
      sentiment: engine.analyzeSentiment(entry.content),
      triggers: engine.identifyTriggers(entry.content),
      coping: engine.recommendCoping(entry.mood),
      crisis: engine.assessCrisisLevel(entry)
    }
  }
}
```

---

## 💾 **Data Architecture**

### **Hybrid Data Strategy**

Perfect Zenkai uses a hybrid approach for maximum reliability:

```typescript
// Hybrid Repository Pattern
export const hybridWeightRepo = {
  async addWeight(entry: WeightEntry, userId?: string): Promise<WeightEntry> {
    try {
      // Try Supabase first (online)
      if (supabase && userId) {
        const result = await supabaseWeightRepo.addWeight(entry, userId)
        // Also save locally for offline access
        await localWeightRepo.addWeight(entry)
        return result
      }
    } catch (error) {
      console.warn('Supabase save failed, using local storage:', error)
    }
    
    // Fallback to local storage (offline)
    return await localWeightRepo.addWeight(entry)
  }
}
```

### **Data Synchronization**

```typescript
export const syncService = {
  async syncData(userId: string): Promise<SyncResult> {
    const localData = await localRepo.getAllPendingSync()
    const results = { synced: 0, errors: 0 }
    
    for (const item of localData) {
      try {
        await supabaseRepo.upsert(item)
        await localRepo.markSynced(item.id)
        results.synced++
      } catch (error) {
        results.errors++
      }
    }
    
    return results
  }
}
```

### **Database Schema**

#### **Supabase Tables**
```sql
-- Weight tracking
CREATE TABLE weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date_iso TEXT NOT NULL,
  kg DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task management
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  summary TEXT NOT NULL,
  description TEXT,
  done BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  points INTEGER DEFAULT 1,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date_iso TEXT NOT NULL,
  mood TEXT,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  content TEXT,
  gratitude JSONB,
  goals_progress JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 **State Management Architecture**

### **Store Organization**

Each domain has its own Zustand store:

```typescript
// Weight Store
interface WeightStore {
  weights: WeightEntry[]
  currentGoal: WeightGoal | null
  isLoading: boolean
  error: string | null
  
  // Actions
  addWeight: (entry: Omit<WeightEntry, 'id'>) => Promise<void>
  updateWeight: (id: string, updates: Partial<WeightEntry>) => Promise<void>
  deleteWeight: (id: string) => Promise<void>
  setGoal: (goal: WeightGoalInput) => Promise<void>
  loadWeights: () => Promise<void>
}

export const useWeightStore = create<WeightStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      weights: [],
      currentGoal: null,
      isLoading: false,
      error: null,
      
      addWeight: async (entry) => {
        set({ isLoading: true, error: null })
        try {
          const newEntry = await hybridWeightRepo.addWeight(entry)
          set(state => ({ 
            weights: [newEntry, ...state.weights],
            isLoading: false 
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      }
    })),
    { name: 'weight-store' }
  )
)
```

### **Cross-Store Communication**

```typescript
// Subscribe to auth changes across all stores
useAuthStore.subscribe(
  (state) => state.user,
  (user) => {
    if (user) {
      // Initialize user-specific stores
      useWeightStore.getState().loadWeights()
      useTasksStore.getState().loadTasks()
      useGoalsStore.getState().loadGoals()
    } else {
      // Clear stores on logout
      useWeightStore.getState().clearData()
      useTasksStore.getState().clearData()
      useGoalsStore.getState().clearData()
    }
  }
)
```

---

## 🎨 **UI Architecture**

### **Component Hierarchy**

```typescript
// Page Level (Route)
export function WeightPage() {
  return (
    <PageLayout title="Weight Tracking">
      <WeightDashboard />
    </PageLayout>
  )
}

// Container Level (Business Logic)
export function WeightDashboard() {
  const { weights, isLoading, addWeight } = useWeightStore()
  
  if (isLoading) return <LoadingSpinner />
  
  return (
    <WeightDashboardView
      weights={weights}
      onAddWeight={addWeight}
    />
  )
}

// Presentation Level (Pure UI)
export function WeightDashboardView({ weights, onAddWeight }) {
  return (
    <div className="space-y-6">
      <WeightEntryForm onSubmit={onAddWeight} />
      <WeightChart data={weights} />
      <WeightList weights={weights} />
    </div>
  )
}
```

### **Design System**

```typescript
// Design tokens
export const designTokens = {
  colors: {
    primary: {
      ki: '#10B981',        // Emerald green
      accent: '#059669',    // Darker green
      background: '#111827', // Dark gray
    }
  },
  spacing: {
    mobile: {
      padding: '1rem',
      margin: '0.5rem'
    },
    desktop: {
      padding: '2rem',
      margin: '1rem'
    }
  }
}

// Responsive utilities
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}
```

---

## 🔒 **Security Architecture**

### **Authentication Flow**

```typescript
// Supabase Auth with fallback
export const authService = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Initialize user stores
      await this.initializeUserData(data.user)
      
      return { success: true, user: data.user }
    } catch (error) {
      // Fallback to local auth for offline mode
      return await localAuth.signIn(email, password)
    }
  }
}
```

### **Data Isolation**

```typescript
// User-specific data isolation
export const getDatabase = (userId?: string): AppDatabase => {
  const dbName = userId ? `PerfectZenkai_${userId}` : 'PerfectZenkai_offline'
  return new AppDatabase(dbName)
}

// Row-level security in Supabase
CREATE POLICY "Users can only access their own data" ON weight_entries
  FOR ALL USING (auth.uid() = user_id);
```

---

## 📱 **PWA Architecture**

### **Service Worker Strategy**

```typescript
// Workbox configuration
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [{
      cacheKeyWillBeUsed: async ({ request }) => {
        return `${request.url}?timestamp=${Date.now()}`
      }
    }]
  })
)
```

### **Offline Support**

```typescript
// Offline detection and handling
export const useOfflineStatus = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      // Trigger data sync
      syncService.syncPendingChanges()
    }
    
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOffline
}
```

---

## 🧪 **Testing Architecture**

### **Testing Strategy**

```typescript
// Unit Tests with Vitest
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WeightEntryForm } from '../WeightEntryForm'

describe('WeightEntryForm', () => {
  it('should submit weight entry', async () => {
    const mockSubmit = vi.fn()
    render(<WeightEntryForm onSubmit={mockSubmit} />)
    
    fireEvent.change(screen.getByLabelText('Weight'), {
      target: { value: '70' }
    })
    fireEvent.click(screen.getByText('Save'))
    
    expect(mockSubmit).toHaveBeenCalledWith({
      weight: 70,
      date: expect.any(String)
    })
  })
})

// Integration Tests
describe('Weight Management Flow', () => {
  it('should complete full weight tracking workflow', async () => {
    // Test complete user journey
    const user = await createTestUser()
    await addWeightEntry(user, { weight: 70, date: '2024-01-15' })
    await setWeightGoal(user, { targetWeight: 65, goalType: 'lose' })
    
    const progress = await analyzeWeightProgress(user)
    expect(progress.trend).toBe('decreasing')
  })
})
```

### **E2E Testing**

```typescript
// Playwright E2E tests
import { test, expect } from '@playwright/test'

test('complete weight tracking workflow', async ({ page }) => {
  await page.goto('/')
  
  // Add weight entry
  await page.click('[data-testid="add-weight"]')
  await page.fill('[data-testid="weight-input"]', '70')
  await page.click('[data-testid="save-weight"]')
  
  // Verify entry appears
  await expect(page.locator('[data-testid="weight-entry"]')).toBeVisible()
  await expect(page.locator('[data-testid="weight-value"]')).toHaveText('70.0 kg')
})
```

---

## 🚀 **Performance Architecture**

### **Bundle Optimization**

```typescript
// Vite configuration for optimal bundling
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
          charts: ['recharts'],
          ai: ['openai']
        }
      }
    }
  },
  
  // Code splitting at route level
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ]
})
```

### **Lazy Loading**

```typescript
// Route-level code splitting
import { lazy, Suspense } from 'react'

const WeightPage = lazy(() => import('./modules/weight/pages/WeightPage'))
const TasksPage = lazy(() => import('./modules/tasks/pages/TasksPage'))

export const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/weight" element={
        <Suspense fallback={<PageSkeleton />}>
          <WeightPage />
        </Suspense>
      } />
    </Routes>
  </Router>
)
```

### **Caching Strategy**

```typescript
// Intelligent caching with TTL
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl: number = 300000) { // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
}
```

---

## 📊 **Monitoring & Analytics**

### **Performance Monitoring**

```typescript
// Performance tracking
export const performanceMonitor = {
  trackPageLoad: (pageName: string) => {
    const loadTime = performance.now()
    console.log(`Page ${pageName} loaded in ${loadTime}ms`)
    
    // Track to analytics service
    analytics.track('page_load', {
      page: pageName,
      loadTime,
      timestamp: Date.now()
    })
  },
  
  trackUserAction: (action: string, metadata?: any) => {
    analytics.track('user_action', {
      action,
      metadata,
      timestamp: Date.now()
    })
  }
}
```

### **Error Tracking**

```typescript
// Global error boundary
export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo)
    
    // Send to error tracking service
    errorTracker.captureException(error, {
      extra: errorInfo,
      tags: {
        component: 'ErrorBoundary'
      }
    })
  }
}
```

---

## 🔮 **Future Architecture Considerations**

### **Microservices Evolution**

```typescript
// Potential service separation
interface ServiceArchitecture {
  aiService: {
    endpoint: '/api/ai'
    responsibilities: ['chat', 'insights', 'function-calling']
  }
  
  dataService: {
    endpoint: '/api/data'
    responsibilities: ['crud', 'sync', 'analytics']
  }
  
  authService: {
    endpoint: '/api/auth'
    responsibilities: ['authentication', 'authorization', 'user-management']
  }
}
```

### **Scalability Patterns**

```typescript
// Event-driven architecture preparation
interface EventBus {
  emit<T>(event: string, payload: T): void
  subscribe<T>(event: string, handler: (payload: T) => void): () => void
}

// Domain events
export const domainEvents = {
  WEIGHT_ADDED: 'weight.added',
  GOAL_ACHIEVED: 'goal.achieved',
  TASK_COMPLETED: 'task.completed'
}
```

---

**This architecture provides a solid foundation for scaling Perfect Zenkai while maintaining code quality, performance, and developer experience. The modular design allows for easy feature additions and modifications while preserving the core architectural principles.** 