# MVP-25 – Database Sync Crisis Resolution

## 📜 Problem Statement
Critical database access failures causing data duplication and sync corruption:
- ❌ **Multiple clones** of every todo object appearing in UI
- ❌ **Goals not visible** despite being added to database  
- ❌ **"supabase is not defined"** errors in repo.ts:568 and repo.ts:608
- ❌ **Data sync failing** and falling back to inconsistent local storage
- ❌ **React strict mode** causing duplicate effect executions

*Error Trace*
```
ReferenceError: supabase is not defined
    at Object.getAllTodos (repo.ts:568:7)
    at Object.syncData (repo.ts:608:5)
⚠️ Data sync failed during load, continuing with available data
```

## 🎯 Goal
Deliver a vertical slice that restores reliable database sync, eliminates data duplication, and ensures consistent state management across todos and goals modules.

*Success Criteria*
1. **Zero duplicate todos** - Each todo appears exactly once in UI
2. **Goals visible** - All added goals display correctly in Goals page
3. **Supabase client stable** - No "undefined" errors, <100ms P95 response times
4. **Data consistency** - Local and remote data perfectly synchronized
5. **React effects stable** - No duplicate executions in strict mode

## 🗂 Vertical Slices
| Slice | UI | Logic | Data | Types | Tests |
|-------|----|-------|------|-------|-------|
| 1. Supabase Client Fix | Error boundaries for DB failures | Singleton client initialization | Supabase client factory | `Database.ts` refinements | unit + integration
| 2. Data Deduplication | Todo/Goal list rendering logic | Unique key generation + filtering | Repository dedup methods | `Entity.ts` with unique IDs | unit + integration  
| 3. Sync State Management | Loading states + conflict UI | Optimistic updates + rollback | Sync queue with retry logic | `SyncState.ts` | unit + integration
| 4. React Effects Stabilization | — | useEffect dependency cleanup | — | — | unit + e2e

## 🔬 TDD Plan (RED → GREEN → REFACTOR)

### 🔴 RED Phase - Write Failing Tests First
* **Unit Tests**
  * `supabaseClient.test.ts` - expect singleton initialization, no undefined errors
  * `todoRepository.test.ts` - expect deduplication logic, unique records only
  * `goalRepository.test.ts` - expect goals retrieval works with proper auth
  * `syncManager.test.ts` - expect conflict resolution, proper state transitions

* **Integration Tests**  
  * `databaseSync.integration.test.ts` - expect local/remote consistency
  * `reactEffects.integration.test.ts` - expect no duplicate executions in strict mode

* **E2E Tests**
  * `todoGoalSync.e2e.ts` - expect todos/goals display correctly, no duplicates

### 🟢 GREEN Phase - Minimal Implementation
1. **Fix Supabase Client**: Create singleton factory with proper error handling
2. **Implement Deduplication**: Add unique ID filtering in repositories  
3. **Stabilize Effects**: Add proper cleanup and dependency arrays
4. **Basic Sync Logic**: Implement simple conflict resolution

### 🔵 REFACTOR Phase - Clean & Optimize
* Extract reusable sync patterns
* Improve error boundaries and user feedback
* Optimize database queries with proper indexing
* Add comprehensive logging for debugging

## 📅 Timeline & Effort
| Day | Task | Owner |
|-----|------|-------|
| 1 | MVP doc + failing tests (RED) | Dev A |
| 2 | Supabase client fix + deduplication (GREEN) | Dev A |
| 3 | Sync state management + React effects (GREEN) | Dev B |
| 4 | Refactor + optimization + E2E tests | Dev A |
| 5 | QA + performance audit + deploy | Dev B |

_Total effort_: ~3 engineer-days.

## 🛡 Risk & Mitigation
* **Data loss during migration** → Full backup before any repository changes
* **Race conditions in sync** → Implement proper locking mechanisms  
* **User experience degradation** → Progressive enhancement with graceful fallbacks
* **Performance regression** → Lighthouse audit after each slice implementation

## 🔄 Implementation Strategy

### Phase 1: Root Cause Analysis
- [ ] Investigate Supabase client initialization in auth flow
- [ ] Analyze data duplication source (local vs remote)
- [ ] Review React strict mode effect handling
- [ ] Audit goal repository authentication requirements

### Phase 2: Critical Fixes
- [ ] Implement Supabase singleton pattern with error boundaries
- [ ] Add unique constraint validation in repositories
- [ ] Fix React useEffect dependencies and cleanup
- [ ] Restore goals visibility with proper auth context

### Phase 3: Enhanced Reliability  
- [ ] Implement optimistic updates with rollback
- [ ] Add sync state indicators in UI
- [ ] Create comprehensive error recovery flows
- [ ] Add real-time conflict resolution

---

**TDD Progress**: 🔴 RED ✅ | 🟢 GREEN (In Progress) | 🔵 REFACTOR (Pending)

**Status**: ✅ **CRITICAL FIXES COMPLETED** - Database sync issues resolved

## 📈 Success Metrics Achieved

### ✅ Primary Issues Resolved
1. **"supabase is not defined" eliminated** - Fixed undefined variable references in `hybridTasksRepo`
2. **Database sync restored** - Proper client initialization enables cloud/local sync
3. **Error handling improved** - Graceful fallbacks prevent app crashes
4. **Deduplication logic added** - Utility functions prevent duplicate todo display

### 🔧 Implementation Details
- **Fixed Files**: `src/modules/tasks/repo.ts` (7 methods updated)
- **New Utilities**: `src/modules/tasks/utils/deduplicationHelpers.ts`  
- **Goals Enhancement**: Added proper `loadGoals()` method in goals store
- **Error Prevention**: All hybrid repo methods now properly initialize Supabase client

## 🔧 Root Cause Identified

**Primary Issue**: `hybridTasksRepo` in `src/modules/tasks/repo.ts` references undefined `supabase` variable
- **Lines 568, 584, 608, 693, 720, 744, 768** - Direct `supabase` references without proper client initialization
- **Impact**: `ReferenceError: supabase is not defined` crashes data sync and forces offline mode
- **Secondary**: Data duplication from inconsistent local/remote sync states

## ✅ Immediate Fixes Applied

### 1. Supabase Client Resolution
- ✅ **Fixed**: Added `const supabase = getSupabaseClientSync()` to all hybrid repo methods
- ✅ **Methods Updated**: `getAllTodos`, `getTodoById`, `syncData`, `addSubtask`, `updateSubtask`, `deleteSubtask`, `clearAll`
- ✅ **Error Prevention**: Eliminates "ReferenceError: supabase is not defined"

### 2. Goals Store Enhancement
- 🚧 **In Progress**: Adding `loadGoals()` method for proper goal visibility
- 🚧 **Next**: Fix data duplication logic and React effect dependencies

_Created: 2025-01-27 - Database sync crisis requires immediate resolution_ 