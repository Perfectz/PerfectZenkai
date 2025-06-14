# MVP 14: Simple Goals & Todo Integration

## Overview
A lightweight goal system that takes under 5 minutes per goal to set up, with seamless todo-goal linking for basic progress tracking.

## User Stories

### 1. Quick Goal Creation
**As a user, I want to create simple goals quickly so I can organize my todos around meaningful objectives.**

- Simple form with just essential fields
- Pre-defined goal categories for quick selection
- Optional target date
- One-click goal creation

### 2. Todo-Goal Linking
**As a user, I want to link my todos to goals so I can see how my daily tasks contribute to bigger objectives.**

- Dropdown in todo form to select goal
- Visual goal indicator on todo items
- Filter todos by goal
- Goal progress based on completed todos

### 3. Goal Progress Dashboard
**As a user, I want to see my goal progress at a glance so I stay motivated.**

- Simple progress bars for each goal
- Completion percentage based on linked todos
- Recently completed goal tasks
- Quick goal overview cards

## Technical Design

### Core Types
```typescript
export interface SimpleGoal {
  id: string
  title: string // Goal name (required)
  category: GoalCategory // Pre-defined categories
  description?: string // Optional brief description
  targetDate?: string // Optional target completion date
  color: string // Visual identifier
  isActive: boolean // Can be paused/archived
  createdAt: string
  updatedAt: string
}

export type GoalCategory = 
  | 'health' 
  | 'career' 
  | 'learning' 
  | 'personal' 
  | 'finance' 
  | 'relationships'
  | 'other'

// Enhanced Todo with goal link
export interface TodoWithGoal extends Todo {
  goalId?: string // Link to goal
}
```

### Goal Progress Calculation
- Progress = (Completed Todos / Total Linked Todos) * 100
- Simple completion tracking without complex metrics
- Visual progress indicators

## Implementation Phases

### Phase 1: Goal Foundation (Day 1)
- [ ] Create goal types and interfaces
- [ ] Build goal store with Zustand
- [ ] Create simple goal creation form
- [ ] Add goal management page

### Phase 2: Todo Integration (Day 2)
- [ ] Add goalId field to Todo interface
- [ ] Update todo forms with goal selection
- [ ] Add goal indicator to todo rows
- [ ] Implement goal-based todo filtering

### Phase 3: Progress Dashboard (Day 3)
- [ ] Create goal progress components
- [ ] Build goal overview cards
- [ ] Add progress visualization
- [ ] Integrate with main dashboard

## Key Features

### Quick Setup (< 5 minutes per goal)
1. **Goal Title** - What you want to achieve
2. **Category** - Select from predefined list
3. **Target Date** - Optional deadline
4. **Color** - Visual identifier
5. **Done** - One-click creation

### Minimal Data Collection
- No complex SMART goal framework
- No detailed metrics or tracking
- Focus on simplicity and adoption
- Easy to maintain and update

### Visual Integration
- Goal badges on todos
- Color-coded goal indicators
- Simple progress bars
- Clean, minimal UI

## Success Metrics
- Goal creation time < 5 minutes
- High goal-todo linking adoption
- Regular goal progress checking
- Low goal abandonment rate

## Future Enhancements
- Goal templates for common objectives
- Goal sharing and collaboration
- Simple goal analytics
- Goal achievement celebrations 