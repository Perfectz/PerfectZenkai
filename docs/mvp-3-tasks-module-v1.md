# MVP 3 — Tasks Module v1 (to-dos)

**Status:** ✅ Complete  
**Sprint:** Core Feature - Task Management  
**Estimated Effort:** 6-8 hours  
**Dependencies:** MVP 1 (Test Suite Foundation)  
**Last Updated:** 2025-01-12

---

## 📋 Sprint Overview

This MVP implements task management functionality, allowing users to create, complete, and manage their daily to-dos. This complements the weight tracking to create a complete daily "power-up" experience.

### Success Criteria

- ✅ Users can add, toggle, and delete tasks
- ✅ Tasks persist offline via Dexie
- ✅ Intuitive mobile interactions (swipe-to-delete)
- ✅ Clear separation of completed vs incomplete tasks
- ✅ Navigation integration complete

---

## 🎯 User Stories & Tasks

### 3.1 Tasks Store + Repo

**Priority:** P0 (Blocker)  
**Story Points:** 3  
**Status:** ✅ Complete

**User Story:** _As a user, I want my tasks to persist locally with full CRUD operations._

**Acceptance Criteria:**

- ✅ Zustand + Dexie following same pattern as weight module
- ✅ Todo type: `{id: string, text: string, done: boolean, createdAt: string}`
- ✅ Full CRUD methods with proper error handling
- ✅ Module isolation maintained

**Technical Details:**

```typescript
interface Todo {
  id: string;           // UUID v4
  text: string;         // Task description
  done: boolean;        // Completion status
  createdAt: string;    // ISO timestamp
}

// Store actions
- addTodo(todo: Omit<Todo, 'id'>): Promise<void>
- updateTodo(id: string, updates: Partial<Todo>): Promise<void>
- deleteTodo(id: string): Promise<void>
- toggleTodo(id: string): Promise<void>
```

**Implementation Prompt:**

```
Create src/modules/tasks/ folder with same structure as weight:

1. types.ts: export interface Todo {id: string, text: string, done: boolean, createdAt: string}

2. repo.ts: Dexie database with todos table:
   - addTodo(todo: Omit<Todo, 'id'>)
   - updateTodo(id: string, updates: Partial<Todo>)
   - deleteTodo(id: string)
   - getAllTodos(): Promise<Todo[]>

3. store.ts: Zustand slice with:
   - todos: Todo[]
   - addTodo, updateTodo, deleteTodo, loadTodos actions
   - hydrate() function

4. index.ts: export routes, store, types

Initialize in main.tsx.
```

**Test-Code Prompt:**

```
Create src/modules/tasks/store.test.ts that:
- Tests all CRUD operations
- Tests toggle done functionality
- Tests hydration from repo
- Mocks Dexie properly
- Uses renderWithProviders for React hooks
```

**Definition of Done:**

- [ ] All CRUD operations work correctly
- [ ] Data persists across sessions
- [ ] Unit tests pass with >90% coverage
- [ ] Performance good with 100+ tasks

---

### 3.2 Todo Page

**Priority:** P0 (Blocker)  
**Story Points:** 4  
**Status:** ✅ Complete

**User Story:** _As a user, I can manage my tasks offline with intuitive interactions._

**Acceptance Criteria:**

- ✅ `/todo` route with input to add new todos
- ✅ Checkbox to toggle completion status
- ✅ Swipe-to-delete functionality
- ✅ Works offline with Dexie persistence
- ✅ Shows completed vs incomplete todos
- ✅ Empty states for both sections

**UI Specifications:**

```
Todo Page Layout:
┌─────────────────────────────────┐
│ [Add new task...        ] [+]   │
├─────────────────────────────────┤
│ ☐ Buy groceries                 │
│ ☐ Call dentist                  │
│ ☐ Finish project                │
├─────────────────────────────────┤
│ Completed (2)                   │
│ ☑ Morning workout               │
│ ☑ Read chapter 5                │
└─────────────────────────────────┘
```

**Implementation Prompt:**

```
Create src/modules/tasks/pages/TodoPage.tsx with:
- Input field to add new todos (Enter to submit)
- TodoRow components with:
  - Checkbox for done/undone toggle
  - Text with strikethrough when completed
  - react-swipeable for delete
- Separate sections for incomplete and completed todos
- Empty states for each section

Create src/modules/tasks/components/TodoRow.tsx with proper touch interactions.

Add routes to src/modules/tasks/routes.ts.
```

**Test-Code Prompt:**

```
Create e2e/TodoOffline.e2e.ts that:
- Goes offline (network disabled)
- Navigates to /todo
- Adds new todo via input
- Toggles todo completion status
- Deletes a todo via swipe
- Reloads page while offline
- Expects all changes to persist
- Goes back online and verifies data integrity
```

**Definition of Done:**

- [ ] All interactions work smoothly
- [ ] Offline functionality verified
- [ ] Touch gestures reliable on mobile
- [ ] Performance good with many tasks

---

### 3.3 Nav & FAB wiring

**Priority:** P1 (High)  
**Story Points:** 1  
**Status:** 🔴 Not Started

**User Story:** _As a user, I can navigate to tasks and access quick actions._

**Acceptance Criteria:**

- [ ] Bottom nav "Tasks" with CheckSquare lucide icon
- [ ] FAB shows on /todo routes with appropriate action
- [ ] Proper active state styling
- [ ] FAB focuses input or shows quick-add

**Implementation Prompt:**

```
Update src/app/NavigationBar.tsx to add:
- Tasks nav item with lucide CheckSquare icon
- Text "Tasks"
- Active state when pathname startsWith '/todo'

Update src/app/GlobalFab.tsx to:
- Show on /todo routes
- Focus on todo input when clicked (or show add todo sheet)
- Use appropriate icon (Plus or PlusCircle)

Merge taskRoutes into src/app/routes.ts.
```

**Test-Code Prompt:**

```
Create e2e/NavToTasks.e2e.ts that:
- Clicks "Tasks" nav icon from dashboard
- Expects pathname '/todo'
- Verifies TodoPage renders
- Tests FAB functionality on todo page
- Verifies nav active state
```

**Definition of Done:**

- [ ] Navigation works from all pages
- [ ] FAB provides useful quick action
- [ ] Active states clearly visible
- [ ] Accessibility requirements met

---

## 🏗️ Design Decisions

### Data Architecture

1. **Same pattern as weight module**: Consistency, proven approach
2. **Boolean for completion**: Simple, clear state
3. **CreatedAt timestamp**: Enables sorting, future analytics
4. **Text-only tasks**: Simplicity, focus on core functionality

### UX Patterns

1. **Checkbox for toggle**: Universal pattern, clear affordance
2. **Strikethrough for completed**: Visual feedback, maintains context
3. **Swipe-to-delete**: Consistent with weight module
4. **Separate sections**: Clear organization, reduces cognitive load

### Technical Choices

1. **Input-based adding**: Fast, keyboard-friendly
2. **Enter to submit**: Standard pattern, efficient
3. **Optimistic updates**: Better perceived performance
4. **Local-first**: Works offline, fast response

---

## 📊 Progress Tracking

### Sprint Velocity

- **Planned Story Points:** 8
- **Completed Story Points:** 0
- **Sprint Progress:** 0%

### Task Status

| Task                   | Status         | Assignee | Estimated Hours | Actual Hours |
| ---------------------- | -------------- | -------- | --------------- | ------------ |
| 3.1 Tasks Store + Repo | 🔴 Not Started | AI Agent | 2.5h            | -            |
| 3.2 Todo Page          | 🔴 Not Started | AI Agent | 4h              | -            |
| 3.3 Nav & FAB wiring   | 🔴 Not Started | AI Agent | 1h              | -            |

### Blockers & Risks

- **Dependency on MVP 1**: Need test infrastructure
- **Can run parallel to MVP 2**: Independent modules

### Quality Gates

- [ ] All unit tests pass with ≥90% coverage
- [ ] E2E tests pass including offline scenarios
- [ ] Manual testing on mobile device
- [ ] Performance acceptable with 100+ tasks

---

**Previous MVP:** [MVP 2 - Weight Module v1](./mvp-2-weight-module-v1.md)  
**Next MVP:** [MVP 4 - Dashboard Module](./mvp-4-dashboard-module.md)
