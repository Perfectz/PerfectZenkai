# MVP 21 — Recurring Tasks System

**Status:** 🔄 In Planning  
**Sprint:** Task Enhancement - Recurring & One-off Tasks  
**Estimated Effort:** 12-16 hours (including TDD time)  
**Dependencies:** MVP 20 (Todo Functionality Fix)  
**Last Updated:** 2025-01-16  
**TDD Progress:** RED ⏳ | GREEN ⏳ | REFACTOR ⏳

---

## 📋 Sprint Overview

This MVP introduces a comprehensive recurring tasks system with three distinct task types: recurring (daily/weekly), one-time tasks, and a unified view. It transforms task management from manual recreation to intelligent automation while maintaining the existing one-off task functionality.

### Success Criteria

- ⏳ 3-tab task interface (Recurring, One-time, All Tasks)
- ⏳ Recurring task creation with flexible scheduling (daily, weekly, monthly)
- ⏳ Smart completion tracking with streak counters
- ⏳ Automatic next occurrence generation
- ⏳ Pause/resume functionality for recurring tasks
- ⏳ Backward compatibility with existing tasks
- ⏳ All tests pass (≥90% coverage)
- ⏳ Mobile-optimized recurring task interactions
- ⏳ Performance benchmarks met (Lighthouse ≥90)

### Vertical Slice Delivered

**Complete Recurring Task Journey:** User can create a recurring daily workout task, track completion streaks, pause it during vacation, resume it seamlessly, and view both recurring and one-time tasks in organized tabs - providing automated task management that reduces mental overhead while encouraging consistency.

**Slice Components:**
- 🎨 **UI Layer:** Tab navigation, recurring task indicators, streak displays, completion flows
- 🧠 **Business Logic:** Recurrence calculation, completion tracking, streak algorithms, pause/resume
- 💾 **Data Layer:** Recurring task storage, completion history, migration scripts
- 🔧 **Type Safety:** Recurring task types, completion interfaces, recurrence patterns
- 🧪 **Test Coverage:** Recurrence logic, streak calculations, UI interactions, data migrations

---

## 🎯 User Stories & Tasks

### 21.1 Enhanced Data Model & Migration

**Priority:** P0 (Blocker)  
**Story Points:** 4  
**Status:** ⏳ Planned  
**TDD Phase:** RED ⏳ | GREEN ⏳ | REFACTOR ⏳

**User Story:** _As a developer, I need extended data models to support recurring tasks while maintaining backward compatibility with existing todos._

**Acceptance Criteria:**

- ⏳ `RecurringTodo` type with recurrence patterns
- ⏳ `TodoCompletion` interface for tracking individual completions
- ⏳ `isRecurring` field added to existing Todo interface
- ⏳ Database migration script for existing todos
- ⏳ Hybrid storage for both recurring and one-time tasks
- ⏳ All tests written and passing
- ⏳ Code coverage ≥90%
- ⏳ Migration tested with real data
- ⏳ Type safety verified

**Technical Design:**

```typescript
export type RecurrenceType = 'daily' | 'weekly' | 'monthly'
export type RecurrenceStatus = 'active' | 'paused' | 'completed'

export interface RecurrencePattern {
  type: RecurrenceType
  interval: number // Every N days/weeks/months
  daysOfWeek?: number[] // For weekly: [0,1,2,3,4,5,6] (Sun-Sat)
  endDate?: string // Optional end date
  maxOccurrences?: number // Optional max completions
}

export interface RecurringTodo extends Omit<Todo, 'done' | 'completedAt'> {
  isRecurring: true
  recurrence: RecurrencePattern
  status: RecurrenceStatus
  completions: TodoCompletion[]
  nextDueDate: string
  currentStreak: number
  bestStreak: number
}

export interface TodoCompletion {
  id: string
  completedAt: string
  scheduledFor: string
  points: number
  streakDay: number
}
```

**Definition of Done:**

- [ ] TDD cycle completed (RED → GREEN → REFACTOR) ⏳
- [ ] All acceptance criteria met ⏳
- [ ] All tests pass (unit, integration) ⏳
- [ ] Code coverage ≥90% ⏳
- [ ] Migration script tested ⏳
- [ ] Type safety enforced ⏳
- [ ] Backward compatibility verified ⏳

---

### 21.2 Recurrence Engine & Logic

**Priority:** P0 (Blocker)  
**Story Points:** 5  
**Status:** ⏳ Planned  
**TDD Phase:** RED ⏳ | GREEN ⏳ | REFACTOR ⏳

**User Story:** _As a user, I want intelligent recurring task scheduling that automatically generates next occurrences and tracks my completion streaks._

**Acceptance Criteria:**

- ⏳ Next occurrence calculation for daily/weekly/monthly patterns
- ⏳ Completion streak tracking with streak preservation
- ⏳ Smart scheduling (no overwhelming backlogs)
- ⏳ Pause/resume functionality with state management
- ⏳ End date and max occurrence handling
- ⏳ All tests written and passing
- ⏳ Code coverage ≥90%
- ⏳ Performance optimized for large datasets
- ⏳ Edge cases handled (leap years, DST, etc.)

**Technical Design:**

```typescript
class RecurrenceEngine {
  calculateNextOccurrence(pattern: RecurrencePattern, lastCompletion?: string): string
  shouldCreateOccurrence(task: RecurringTodo, currentDate: string): boolean
  updateStreakOnCompletion(task: RecurringTodo, completionDate: string): number
  pauseRecurrence(taskId: string): Promise<void>
  resumeRecurrence(taskId: string): Promise<void>
  getStreakStatistics(completions: TodoCompletion[]): StreakStats
}

interface StreakStats {
  currentStreak: number
  bestStreak: number
  totalCompletions: number
  consistencyRate: number // percentage
  averageGapDays: number
}
```

**Definition of Done:**

- [ ] TDD cycle completed (RED → GREEN → REFACTOR) ⏳
- [ ] All acceptance criteria met ⏳
- [ ] All tests pass (unit, integration) ⏳
- [ ] Code coverage ≥90% ⏳
- [ ] Performance requirements met ⏳
- [ ] Edge cases handled ⏳
- [ ] Recurrence engine functional ⏳

---

### 21.3 Tab Navigation & Enhanced UI

**Priority:** P0 (Blocker)  
**Story Points:** 3  
**Status:** ⏳ Planned  
**TDD Phase:** RED ⏳ | GREEN ⏳ | REFACTOR ⏳

**User Story:** _As a user, I want organized task management with clear separation between recurring and one-time tasks, plus visual indicators for task types and progress._

**Acceptance Criteria:**

- ⏳ 3-tab interface: Recurring, One-time, All Tasks
- ⏳ Recurring task visual indicators (badges, icons)
- ⏳ Streak displays and progress visualization
- ⏳ Next due date prominence for recurring tasks
- ⏳ Pause/resume toggle controls
- ⏳ All tests written and passing
- ⏳ Code coverage ≥90%
- ⏳ Mobile-optimized interactions
- ⏳ Accessibility compliance

**UI Design Specifications:**

```tsx
// Tab Structure
<TaskTabs>
  <Tab name="recurring" icon="🔄" badge={activeRecurringCount}>
    <RecurringTaskList />
  </Tab>
  <Tab name="one-time" icon="⚡" badge={oneTimeCount}>
    <OneTimeTaskList />
  </Tab>
  <Tab name="all" icon="📋" badge={totalCount}>
    <AllTasksList />
  </Tab>
</TaskTabs>

// Recurring Task Card
<RecurringTaskCard>
  <TaskHeader>
    <Title>{task.summary}</Title>
    <RecurrenceIndicator type={task.recurrence.type} />
    <StreakBadge current={task.currentStreak} best={task.bestStreak} />
  </TaskHeader>
  <TaskBody>
    <NextDueDate date={task.nextDueDate} />
    <ProgressBar completions={weeklyCompletions} target={weeklyTarget} />
  </TaskBody>
  <TaskActions>
    <CompleteButton onComplete={handleComplete} />
    <PauseToggle isPaused={task.status === 'paused'} onToggle={handlePause} />
  </TaskActions>
</RecurringTaskCard>
```

**Definition of Done:**

- [ ] TDD cycle completed (RED → GREEN → REFACTOR) ⏳
- [ ] All acceptance criteria met ⏳
- [ ] All tests pass (unit, component, e2e) ⏳
- [ ] Code coverage ≥90% ⏳
- [ ] Mobile UI optimized ⏳
- [ ] Accessibility audit passed ⏳
- [ ] Tab navigation functional ⏳

---

### 21.4 Enhanced Task Creation Flow

**Priority:** P1 (High)  
**Story Points:** 3  
**Status:** ⏳ Planned  
**TDD Phase:** RED ⏳ | GREEN ⏳ | REFACTOR ⏳

**User Story:** _As a user, I want an intuitive task creation form that lets me easily configure recurring patterns while keeping one-time task creation simple._

**Acceptance Criteria:**

- ⏳ Toggle between recurring and one-time task modes
- ⏳ Intuitive recurrence configuration (daily, weekly, monthly)
- ⏳ Day-of-week selection for weekly recurring tasks
- ⏳ Optional end date and max occurrence settings
- ⏳ Smart defaults and validation
- ⏳ All tests written and passing
- ⏳ Code coverage ≥90%
- ⏳ Form validation and error handling
- ⏳ Mobile-optimized form interactions

**Definition of Done:**

- [ ] TDD cycle completed (RED → GREEN → REFACTOR) ⏳
- [ ] All acceptance criteria met ⏳
- [ ] All tests pass (unit, component, integration) ⏳
- [ ] Code coverage ≥90% ⏳
- [ ] Form validation comprehensive ⏳
- [ ] Mobile UX optimized ⏳
- [ ] Task creation flow functional ⏳

---

### 21.5 Completion & Interaction Flows

**Priority:** P1 (High)  
**Story Points:** 2  
**Status:** ⏳ Planned  
**TDD Phase:** RED ⏳ | GREEN ⏳ | REFACTOR ⏳

**User Story:** _As a user, I want different completion behaviors for recurring vs one-time tasks, with clear feedback about streaks and next occurrences._

**Acceptance Criteria:**

- ⏳ Recurring task completion updates streak and shows next occurrence
- ⏳ One-time task completion marks as permanently done
- ⏳ Visual feedback for completion types
- ⏳ Undo functionality for recent completions
- ⏳ Bulk operations for managing multiple tasks
- ⏳ All tests written and passing
- ⏳ Code coverage ≥90%
- ⏳ Mobile swipe gestures optimized
- ⏳ Performance requirements met

**Definition of Done:**

- [ ] TDD cycle completed (RED → GREEN → REFACTOR) ⏳
- [ ] All acceptance criteria met ⏳
- [ ] All tests pass (unit, integration, e2e) ⏳
- [ ] Code coverage ≥90% ⏳
- [ ] Performance requirements met ⏳
- [ ] Mobile interactions optimized ⏳
- [ ] Completion flows functional ⏳

---

## 🛠 Technical Architecture

### Data Flow Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   TaskCreationForm  │    │   RecurrenceEngine   │    │   TaskRepository    │
│   - Form validation │    │   - Next occurrence  │    │   - Hybrid storage  │
│   - Mode switching  │────│   - Streak tracking  │────│   - Sync management │
│   - Pattern config  │    │   - Pause/resume     │    │   - Migration logic │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
           │                           │                           │
           ▼                           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│    TaskTabsView     │    │   CompletionEngine   │    │    NotificationEngine│
│   - Tab navigation  │    │   - Completion logic │    │   - Streak alerts   │
│   - Task filtering  │────│   - Undo management  │────│   - Due reminders   │
│   - Visual indicators│    │   - Bulk operations  │    │   - Achievement     │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

---

## 🎯 User Experience Journey

### Primary User Flow: Creating & Managing Recurring Task

1. **Task Creation**
   - User clicks "Add Task" button
   - Enters task description "Morning workout"
   - Toggles "Make this recurring?" switch
   - Selects "Daily" recurrence
   - Sets priority as "High" and 8 points
   - Clicks "Create Task"

2. **First Completion**
   - User sees task in "Recurring" tab with "Due today" indicator
   - Swipes right or taps checkmark to complete
   - Gets feedback: "1 day streak! Next: Tomorrow at 7:00 AM"
   - Task stays in list with updated next due date

3. **Ongoing Management**
   - User builds up 5-day streak over time
   - Can see "🔥 5-day streak" badge on task
   - Before vacation, taps pause button
   - Gets confirmation: "Paused. Streak preserved (5 days)"

4. **Resuming After Break**
   - User returns from vacation, taps resume
   - Task shows "Due today" again
   - Streak counter shows preserved "5-day streak"
   - Can continue building streak from where left off

---

## 🔍 Design Decisions & Trade-offs

### Architecture Decisions

**Decision 1: Separate RecurringTodo Type vs Extended Todo**
- **Problem:** Whether to extend existing Todo or create separate type
- **Solution:** Separate RecurringTodo type with shared base interface
- **Alternatives Considered:** Single Todo type with optional recurring fields
- **Rationale:** Cleaner type safety, better separation of concerns, easier testing
- **Test Impact:** Requires comprehensive type testing and data migration testing

**Decision 2: Tab-Based Navigation vs Unified List with Filters**
- **Problem:** How to organize recurring vs one-time tasks
- **Solution:** 3-tab interface with dedicated views
- **Alternatives Considered:** Single list with filter toggles, separate pages
- **Rationale:** Clear mental model, reduced cognitive load, focused interactions
- **Test Impact:** Requires tab navigation testing and mobile interaction testing

**Decision 3: Streak Preservation During Pause vs Reset**
- **Problem:** What happens to streaks when tasks are paused
- **Solution:** Preserve streaks during pause, allow resumption
- **Rationale:** Better user experience, encourages honest pause usage
- **Future Impact:** May need advanced streak rules for different pause types

---

## 📊 Progress Tracking

### Sprint Velocity

- **Planned Story Points:** 17
- **Completed Story Points:** 0/17
- **Sprint Progress:** 0% ⏳
- **TDD Cycle Efficiency:** TBD

### Task Status

| Task | Status | TDD Phase | Assignee | Est Hours | Actual Hours | Test Coverage |
|------|--------|-----------|----------|-----------|--------------|---------------|
| 21.1 Enhanced Data Model & Migration | ⏳ Planned | RED ⏳ GREEN ⏳ REFACTOR ⏳ | AI Agent | 4h | TBD | TBD |
| 21.2 Recurrence Engine & Logic | ⏳ Planned | RED ⏳ GREEN ⏳ REFACTOR ⏳ | AI Agent | 5h | TBD | TBD |
| 21.3 Tab Navigation & Enhanced UI | ⏳ Planned | RED ⏳ GREEN ⏳ REFACTOR ⏳ | AI Agent | 3h | TBD | TBD |
| 21.4 Enhanced Task Creation Flow | ⏳ Planned | RED ⏳ GREEN ⏳ REFACTOR ⏳ | AI Agent | 3h | TBD | TBD |
| 21.5 Completion & Interaction Flows | ⏳ Planned | RED ⏳ GREEN ⏳ REFACTOR ⏳ | AI Agent | 2h | TBD | TBD |

### Quality Gates

- [ ] All tests written (TDD RED phase complete) ⏳
- [ ] All tests passing (TDD GREEN phase complete) ⏳
- [ ] Code refactored and polished (TDD REFACTOR phase complete) ⏳
- [ ] Coverage thresholds met (≥90%) ⏳
- [ ] Recurring functionality verified ⏳
- [ ] Performance requirements met ⏳
- [ ] Accessibility audit passed ⏳
- [ ] Mobile recurring experience verified ⏳

---

## 📝 Notes & Comments

### Future Considerations

- Advanced recurrence patterns (every 2 weeks, last day of month)
- Habit analytics dashboard with completion insights
- Team/shared recurring tasks for collaboration
- Integration with calendar apps for external scheduling
- Adaptive recurrence suggestions based on completion patterns
- Gamification elements (achievements, challenges)

### Dependencies for Next MVP

- Recurring task foundation enables habit tracking features
- Completion analytics can support goal progress tracking
- Tab navigation patterns reusable for other feature organization
- Streak mechanics applicable to other engagement features

---

**Next MVP:** TBD - Potential candidates: Advanced Analytics, Team Features, or Calendar Integration ⏳
