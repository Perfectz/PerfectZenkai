# MVP 4 — Dashboard Module (home cards)

**Status:** ✅ Complete  
**Sprint:** User Experience - Home Dashboard  
**Estimated Effort:** 8-10 hours  
**Dependencies:** MVP 2 (Weight Module), MVP 3 (Tasks Module)  
**Last Updated:** 2025-01-12

---

## 📋 Sprint Overview

This MVP creates the main dashboard that serves as the app's home screen. It provides at-a-glance insights into weight trends, today's status, task progress, and consistency streaks through interactive cards.

### Success Criteria

- ✅ Dashboard serves as default route (/)
- ✅ Responsive card layout (1-col mobile, 2-col desktop)
- ✅ All cards display relevant data from weight/tasks modules
- ✅ Cards are interactive and navigate to detail views
- ✅ Performance optimized with lazy loading

---

## 🎯 User Stories & Tasks

### 4.1 Sparkline Card

**Priority:** P1 (High)  
**Story Points:** 3  
**Status:** 🔴 Not Started

**User Story:** _As a user, I can see my weight trend at a glance with interactive chart._

**Acceptance Criteria:**

- [ ] Shows last 30 days weight data as sparkline
- [ ] Uses React.lazy to load Recharts
- [ ] Click navigates to /weight
- [ ] Handles empty data gracefully
- [ ] Loading state while chart loads
- [ ] Responsive sizing

**Technical Details:**

```typescript
// Data processing
- Filter last 30 days of weight entries
- Handle missing days (show gaps or interpolate)
- Format for Recharts LineChart
- Optimize for mobile performance
```

**Implementation Prompt:**

```
Create src/modules/dashboard/components/WeightSparkCard.tsx with:
- shadcn Card with rounded-2xl shadow-sm
- React.lazy loaded Recharts LineChart/Sparkline
- Last 30 days of weight data from weight store
- Loading state while chart loads
- Empty state with placeholder when no data
- onClick handler to navigate to /weight
- Proper responsive sizing

Use Recharts with minimal styling for clean sparkline appearance.
```

**Test-Code Prompt:**

```
Create src/modules/dashboard/WeightSparkCard.test.tsx that:
- Renders with 3 mock weight entries
- Expects SVG path element to be present
- Tests loading state
- Tests empty state
- Tests click navigation
- Mocks Recharts properly
```

**Definition of Done:**

- [ ] Chart renders correctly with real data
- [ ] Performance good on mobile
- [ ] Navigation works
- [ ] Empty/loading states handled

---

### 4.2 Today Weight Card

**Priority:** P1 (High)  
**Story Points:** 2  
**Status:** 🔴 Not Started

**User Story:** _As a user, I can see today's weight status prominently._

**Acceptance Criteria:**

- [ ] Displays latest weight entry or placeholder
- [ ] Shows date and weight with proper formatting
- [ ] Indicates if no weight logged today
- [ ] Links to weight entry
- [ ] Shows trend indicator (up/down/same)

**UI Specifications:**

```
Today Weight Card:
┌─────────────────────────────────┐
│ Today's Weight                  │
│ 75.0 kg                         │
│ ↗ +0.5 kg from yesterday        │
│ Dec 15, 2024                    │
└─────────────────────────────────┘

No Weight Card:
┌─────────────────────────────────┐
│ Today's Weight                  │
│ No weight logged yet            │
│ Tap to add your weight          │
│ Dec 15, 2024                    │
└─────────────────────────────────┘
```

**Implementation Prompt:**

```
Create src/modules/dashboard/components/TodayWeightCard.tsx with:
- shadcn Card styling
- Reads latest weight entry from weight store
- Shows "Today: 75.0 kg" or "No weight logged today"
- Proper date comparison for "today"
- Click to navigate to /weight
- Loading state while data loads
```

**Test-Code Prompt:**

```
Create src/modules/dashboard/TodayWeightCard.test.tsx that:
- Tests with today's weight entry
- Tests with no weight today
- Tests with weight from yesterday
- Verifies placeholder text
- Tests click navigation
```

**Definition of Done:**

- [ ] Accurate today detection
- [ ] Proper formatting
- [ ] Navigation works
- [ ] All states tested

---

### 4.3 Todo Summary Card

**Priority:** P1 (High)  
**Story Points:** 2  
**Status:** 🔴 Not Started

**User Story:** _As a user, I can see my task progress at a glance._

**Acceptance Criteria:**

- [ ] Shows count of incomplete todos
- [ ] Shows total todos count
- [ ] Progress indicator or percentage
- [ ] Links to todo page
- [ ] Updates in real-time

**Implementation Prompt:**

```
Create src/modules/dashboard/components/TodoSummaryCard.tsx with:
- shadcn Card styling
- Reads todos from tasks store
- Shows "3 of 5 tasks complete" format
- Progress bar or circular progress indicator
- Click to navigate to /todo
- Handles zero todos gracefully
```

**Test-Code Prompt:**

```
Create src/modules/dashboard/TodoSummaryCard.test.tsx that:
- Tests count calculation with mixed todos
- Tests with all completed todos
- Tests with no todos
- Verifies count increments properly
- Tests click navigation
```

**Definition of Done:**

- [ ] Accurate counting
- [ ] Visual progress indicator
- [ ] Real-time updates
- [ ] Navigation works

---

### 4.4 Streak Card (stub)

**Priority:** P2 (Nice to have)  
**Story Points:** 1  
**Status:** 🔴 Not Started

**User Story:** _As a user, I can see my consistency streak placeholder._

**Acceptance Criteria:**

- [ ] Static "0 day streak" for now
- [ ] Proper card styling matching other cards
- [ ] Placeholder for future streak logic
- [ ] Same interaction pattern as other cards

**Implementation Prompt:**

```
Create src/modules/dashboard/components/StreakCard.tsx with:
- shadcn Card styling matching other cards
- Static text "0 day streak"
- Placeholder icon (Calendar or Flame)
- Same click behavior as other cards (maybe to settings)
- Comment indicating future enhancement
```

**Test-Code Prompt:**

```
Create src/modules/dashboard/StreakCard.test.tsx that:
- Renders placeholder text "0 day streak"
- Tests card styling consistency
- Placeholder for future streak logic tests
```

**Definition of Done:**

- [ ] Consistent styling
- [ ] Placeholder functionality
- [ ] Ready for future enhancement

---

### 4.5 Dashboard Page

**Priority:** P0 (Blocker)  
**Story Points:** 2  
**Status:** 🔴 Not Started

**User Story:** _As a user, I have a useful home screen with responsive card layout._

**Acceptance Criteria:**

- [ ] `/` route shows dashboard
- [ ] Grid: 1‑col <640px, 2‑col ≥640px
- [ ] All four cards properly arranged
- [ ] Responsive and mobile-friendly
- [ ] Proper spacing and padding

**Layout Specifications:**

```
Mobile (< 640px):
┌─────────────────────┐
│ WeightSparkCard     │
├─────────────────────┤
│ TodayWeightCard     │
├─────────────────────┤
│ TodoSummaryCard     │
├─────────────────────┤
│ StreakCard          │
└─────────────────────┘

Desktop (≥ 640px):
┌─────────────┬─────────────┐
│ WeightSpark │ TodayWeight │
├─────────────┼─────────────┤
│ TodoSummary │ StreakCard  │
└─────────────┴─────────────┘
```

**Implementation Prompt:**

```
Create src/modules/dashboard/pages/DashboardPage.tsx with:
- CSS Grid layout: grid-cols-1 sm:grid-cols-2
- Gap between cards
- All four cards: WeightSparkCard, TodayWeightCard, TodoSummaryCard, StreakCard
- Proper padding and margins
- Mobile-first responsive design

Create src/modules/dashboard/routes.ts with dashboard route.

Add to src/modules/dashboard/index.ts exports.
```

**Test-Code Prompt:**

```
Create e2e/DashboardResponsive.e2e.ts that:
- Tests viewport 500px (mobile) - expects 1 column
- Tests viewport 800px (desktop) - expects 2 columns
- Verifies all 4 cards are visible
- Tests card click navigation
- Takes screenshots at different viewports
```

**Definition of Done:**

- [ ] Responsive layout works
- [ ] All cards render correctly
- [ ] Navigation from cards works
- [ ] Performance acceptable

---

### 4.6 Default Route & Header

**Priority:** P0 (Blocker)  
**Story Points:** 1  
**Status:** 🔴 Not Started

**User Story:** _As a user, the app opens to dashboard with proper branding._

**Acceptance Criteria:**

- [ ] App opens to dashboard by default
- [ ] Header shows "Perfect Zenkai" title consistently
- [ ] Proper routing setup
- [ ] All module routes integrated

**Implementation Prompt:**

```
Update src/app/routes.ts to:
- Set default route "/" to DashboardPage
- Import and merge dashboardRoutes
- Ensure proper React Router setup

Update src/app/AppShell.tsx header to show "Perfect Zenkai" title consistently.

Verify all module routes are properly integrated.
```

**Definition of Done:**

- [ ] Default route works
- [ ] All routes accessible
- [ ] Header consistent
- [ ] No routing errors

---

## 🏗️ Design Decisions

### Card Architecture

1. **Individual card components**: Reusable, testable, maintainable
2. **Lazy loading for charts**: Better initial load performance
3. **Click-to-navigate**: Consistent interaction pattern
4. **Real-time updates**: Subscribe to store changes

### Layout Strategy

1. **CSS Grid over Flexbox**: Better 2D layout control
2. **Mobile-first responsive**: Primary use case optimization
3. **Consistent spacing**: Design system adherence
4. **Card-based UI**: Modern, scannable, touch-friendly

### Data Integration

1. **Direct store subscription**: Real-time updates, simple
2. **No data fetching**: Modules handle their own data
3. **Graceful degradation**: Handle missing/empty data
4. **Performance optimization**: Memoization, lazy loading

---

## 📊 Progress Tracking

### Sprint Velocity

- **Planned Story Points:** 11
- **Completed Story Points:** 11
- **Sprint Progress:** 100%

### Task Status

| Task                  | Status         | Assignee | Estimated Hours | Actual Hours |
| --------------------- | -------------- | -------- | --------------- | ------------ |
| 4.1 Sparkline Card    | 🔴 Not Started | AI Agent | 3h              | -            |
| 4.2 Today Weight Card | 🔴 Not Started | AI Agent | 2h              | -            |
| 4.3 Todo Summary Card | 🔴 Not Started | AI Agent | 2h              | -            |
| 4.4 Streak Card       | 🔴 Not Started | AI Agent | 0.5h            | -            |
| 4.5 Dashboard Page    | 🔴 Not Started | AI Agent | 1.5h            | -            |
| 4.6 Default Route     | 🔴 Not Started | AI Agent | 0.5h            | -            |

### Blockers & Risks

- **Dependency on MVP 2 & 3**: Need weight and tasks data
- **Recharts bundle size**: May impact initial load time
- **Real-time updates**: Need to ensure performance with many updates

### Quality Gates

- [ ] All cards render with real data
- [ ] Responsive design works on all viewports
- [ ] Performance acceptable on mobile
- [ ] Navigation works from all cards
- [ ] Unit tests pass with ≥90% coverage

---

**Previous MVP:** [MVP 3 - Tasks Module v1](./mvp-3-tasks-module-v1.md)  
**Next MVP:** [MVP 5 - Offline Polish](./mvp-5-offline-polish.md)
