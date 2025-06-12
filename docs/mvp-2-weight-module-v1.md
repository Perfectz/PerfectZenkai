# MVP 2 — Weight Module v1 (log & list)

**Status:** 🔴 Not Started  
**Sprint:** Core Feature - Weight Tracking  
**Estimated Effort:** 8-10 hours  
**Dependencies:** MVP 1 (Test Suite Foundation)  
**Last Updated:** 2025-01-12

---

## 📋 Sprint Overview

This MVP implements the core weight tracking functionality - the primary value proposition of Perfect Zenkai. Users can log daily weights, view their history, and manage entries with intuitive mobile interactions.

### Success Criteria
- ✅ Users can log weight entries via FAB + Sheet
- ✅ Weight history displays newest-first with proper formatting
- ✅ Touch interactions work (long-press delete, swipe)
- ✅ Data persists offline via Dexie
- ✅ Navigation integration complete

---

## 🎯 User Stories & Tasks

### 2.1 Weight Store + Repo
**Priority:** P0 (Blocker)  
**Story Points:** 3  
**Status:** 🔴 Not Started

**User Story:** *As a user, I want my weight data to persist locally with proper module isolation.*

**Acceptance Criteria:**
- [ ] Zustand slice in `src/modules/weight/store.ts` (`addWeight`, `deleteWeight`, `weights`)
- [ ] Dexie table `weights` in `src/modules/weight/repo.ts`
- [ ] WeightEntry type: `{id: string, dateISO: string, kg: number}`
- [ ] Hydrates store from Dexie on init
- [ ] No cross-module imports
- [ ] Error handling for database operations

**Technical Details:**
```typescript
// WeightEntry interface
interface WeightEntry {
  id: string;           // UUID v4
  dateISO: string;      // ISO date string (YYYY-MM-DD)
  kg: number;           // Weight in kilograms (1 decimal place)
}

// Store actions
- addWeight(entry: Omit<WeightEntry, 'id'>): Promise<void>
- deleteWeight(id: string): Promise<void>
- loadWeights(): Promise<void>
- hydrate(): Promise<void>
```

**Implementation Prompt:**
```
Create src/modules/weight/ folder with:

1. types.ts: export interface WeightEntry {id: string, dateISO: string, kg: number}

2. repo.ts: Dexie database with weights table, functions:
   - addWeight(entry: Omit<WeightEntry, 'id'>)
   - deleteWeight(id: string) 
   - getAllWeights(): Promise<WeightEntry[]>

3. store.ts: Zustand slice with:
   - weights: WeightEntry[]
   - addWeight, deleteWeight, loadWeights actions
   - hydrate() function that loads from repo on init

4. index.ts: export routes, store, types (no internal exports)

Initialize store hydration in main.tsx.
```

**Test-Code Prompt:**
```
Create src/modules/weight/store.test.ts that:
- Mocks Dexie repo functions
- Tests addWeight action updates store and calls repo
- Tests deleteWeight removes from store
- Tests hydration loads data from repo on init
- Uses renderWithProviders for any React hooks
```

**Definition of Done:**
- [ ] All store actions work correctly
- [ ] Data persists across browser sessions
- [ ] Unit tests pass with >90% coverage
- [ ] No memory leaks in store subscriptions

---

### 2.2 Weight Add Sheet
**Priority:** P0 (Blocker)  
**Story Points:** 3  
**Status:** 🔴 Not Started

**User Story:** *As a user, I can quickly log my weight via FAB sheet.*

**Acceptance Criteria:**
- [ ] FAB on /weight routes opens shadcn Sheet
- [ ] Form with date input (default today) and kg input (positive numbers only)
- [ ] Submit adds entry & closes sheet
- [ ] Uses shadcn Sheet component
- [ ] Form validation prevents invalid entries
- [ ] Loading states during submission

**UX Requirements:**
- Date picker defaults to today
- Weight input accepts decimals (e.g., 75.5)
- Validation: weight > 0 and < 1000
- Submit button disabled during loading
- Success feedback after submission

**Implementation Prompt:**
```
Create src/modules/weight/components/WeightSheet.tsx using:
- shadcn Sheet component
- Form with date input (default today) and number input for kg
- Validation: kg > 0, date required
- onSubmit calls weight store addWeight action

Update src/app/GlobalFab.tsx to:
- Show when location.pathname startsWith '/weight'
- onClick opens WeightSheet
- Use lucide Plus icon

Wire up the sheet state management between FAB and Sheet.
```

**Test-Code Prompt:**
```
Create e2e/AddWeight.e2e.ts that:
- Navigates to /weight
- Clicks FAB button
- Fills form with 75kg and today's date
- Submits form
- Expects new weight entry to appear in list
- Verifies sheet closes after submit
```

**Definition of Done:**
- [ ] Sheet opens/closes smoothly
- [ ] Form validation works correctly
- [ ] Data saves to store and database
- [ ] E2E test passes consistently

---

### 2.3 Weight List Page
**Priority:** P0 (Blocker)  
**Story Points:** 4  
**Status:** 🔴 Not Started

**User Story:** *As a user, I can view and manage my weight history with touch interactions.*

**Acceptance Criteria:**
- [ ] `/weight` route lists entries newest-first
- [ ] Each row shows date and kg with proper formatting
- [ ] Long-press row (200ms) → confirm delete dialog
- [ ] Uses react-swipeable for touch interactions
- [ ] Empty state when no weights
- [ ] Loading state while fetching data

**UI Specifications:**
```
WeightRow Layout:
┌─────────────────────────────────┐
│ Dec 15, 2024        75.0 kg     │
│ Yesterday           ↗ +0.5 kg   │
└─────────────────────────────────┘

Empty State:
┌─────────────────────────────────┐
│        📊                       │
│   No weights logged yet         │
│   Tap + to add your first       │
└─────────────────────────────────┘
```

**Implementation Prompt:**
```
Create src/modules/weight/pages/WeightPage.tsx with:
- List of weight entries sorted by date (newest first)
- WeightRow component using react-swipeable
- Long-press (200ms) triggers delete confirmation dialog
- Empty state when no weights
- Proper date formatting (e.g., "Dec 15, 2024")
- Weight formatting (e.g., "75.0 kg")

Create src/modules/weight/components/WeightRow.tsx with swipe-to-delete functionality.

Add route to src/modules/weight/routes.ts and export from index.ts.
```

**Test-Code Prompt:**
```
Create e2e/DeleteWeight.e2e.ts that:
- Adds 2 weight entries via API/store
- Navigates to /weight
- Long-presses first entry (200ms hold)
- Accepts delete confirmation dialog
- Expects list to show only 1 remaining entry
- Verifies correct entry was deleted
```

**Definition of Done:**
- [ ] List displays correctly on mobile and desktop
- [ ] Touch interactions work reliably
- [ ] Delete confirmation prevents accidents
- [ ] Performance good with 100+ entries

---

### 2.4 Nav Link
**Priority:** P1 (High)  
**Story Points:** 1  
**Status:** 🔴 Not Started

**User Story:** *As a user, I can navigate to weight tracking via bottom nav.*

**Acceptance Criteria:**
- [ ] Bottom nav shows "Weight" with BarChart3 lucide icon
- [ ] Clicking navigates to /weight route
- [ ] Active state styling when on weight pages
- [ ] Proper accessibility labels

**Implementation Prompt:**
```
Update src/app/NavigationBar.tsx to include:
- Weight nav item with lucide BarChart3 icon
- Text "Weight"
- Active state when pathname startsWith '/weight'
- Proper shadcn NavigationBar styling

Import and merge weightRoutes from src/modules/weight into src/app/routes.ts.

Ensure proper routing setup with React Router.
```

**Test-Code Prompt:**
```
Create e2e/NavToWeight.e2e.ts that:
- Starts on dashboard (/)
- Clicks "Weight" nav icon
- Expects pathname to be '/weight'
- Verifies nav item shows active state
- Verifies WeightPage content is visible
```

**Definition of Done:**
- [ ] Navigation works from any page
- [ ] Active state clearly visible
- [ ] Icon and text properly aligned
- [ ] Accessibility requirements met

---

## 🏗️ Design Decisions

### Data Architecture
1. **Dexie for persistence**: Offline-first, good React integration, mature
2. **Zustand for state**: Lightweight, good TypeScript support, easy testing
3. **ISO date strings**: Consistent formatting, timezone-safe, sortable
4. **Kilograms only**: Simplicity, international standard, easy conversion

### UX Patterns
1. **FAB for primary action**: Material Design standard, thumb-friendly
2. **Sheet for forms**: Mobile-optimized, doesn't lose context
3. **Long-press for delete**: Prevents accidental deletion, discoverable
4. **Newest-first sorting**: Most relevant data first, matches user expectations

### Technical Choices
1. **react-swipeable**: Mature touch library, good mobile support
2. **shadcn components**: Consistent with design system, accessible
3. **Module isolation**: Prevents coupling, easier testing, better maintainability
4. **UUID for IDs**: Collision-free, works offline, no server dependency

---

## 📊 Progress Tracking

### Sprint Velocity
- **Planned Story Points:** 11
- **Completed Story Points:** 0
- **Sprint Progress:** 0%

### Task Status
| Task | Status | Assignee | Estimated Hours | Actual Hours |
|------|--------|----------|----------------|--------------|
| 2.1 Weight Store + Repo | 🔴 Not Started | AI Agent | 3h | - |
| 2.2 Weight Add Sheet | 🔴 Not Started | AI Agent | 3h | - |
| 2.3 Weight List Page | 🔴 Not Started | AI Agent | 3.5h | - |
| 2.4 Nav Link | 🔴 Not Started | AI Agent | 0.5h | - |

### Blockers & Risks
- **Dependency on MVP 1**: Need working test harness before starting
- **Touch interaction complexity**: May need device testing for reliability
- **Performance with large datasets**: Need to consider virtualization for 1000+ entries

### Quality Gates
- [ ] All unit tests pass with ≥90% coverage
- [ ] E2E tests pass on mobile viewport
- [ ] Manual testing on actual mobile device
- [ ] Performance acceptable with 100+ weight entries
- [ ] Accessibility audit passes

---

## 🔄 Sprint Retrospective

### What Went Well
*To be filled after sprint completion*

### What Could Be Improved
*To be filled after sprint completion*

### Action Items
*To be filled after sprint completion*

---

## 📝 Notes & Comments

### Technical Debt
- Consider adding weight unit conversion (kg/lbs) in future
- May need virtualization for very large datasets
- Touch interactions may need fine-tuning on different devices

### Future Considerations
- Add weight goal setting and tracking
- Implement data export functionality
- Consider adding weight trends and analytics
- Add photo attachments to weight entries

### Dependencies for Next MVP
- MVP 3 (Tasks) can be developed in parallel
- Dashboard MVP will consume weight data from this module

---

**Previous MVP:** [MVP 1 - Test Suite Foundation](./mvp-1-test-suite-foundation.md)  
**Next MVP:** [MVP 3 - Tasks Module v1](./mvp-3-tasks-module-v1.md) 