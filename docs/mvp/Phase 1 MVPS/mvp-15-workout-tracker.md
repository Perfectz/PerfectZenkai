# MVP 15: Workout Tracker & Health Tab Restructuring

**Status:** ✅ Complete  
**Last Updated:** 2025-01-18  
**TDD Progress:** RED ✅ | GREEN ✅ | REFACTOR ✅ | SOLUTION ✅

## Overview
Transform the current "Diet" tab into a comprehensive "Health" hub and add a dedicated workout tracking system for daily exercise logging and progress monitoring.

## User Stories

### 1. Health Tab Restructuring
**As a user, I want a unified Health tab that encompasses all my wellness tracking so I can manage my complete health journey in one place.**

- Rename "Diet" tab to "Health" 
- Maintain existing Weight and Meals functionality
- Add Workout as a third tab within Health
- Unified health analytics across all three areas

### 2. Daily Workout Logging
**As a user, I want to log my daily workouts so I can track my exercise consistency and progress.**

- Quick workout entry form
- Exercise type selection (Cardio, Strength, Flexibility, Sports, Other)
- Duration tracking (minutes)
- Intensity level (Light, Moderate, Intense)
- Optional notes for workout details
- Date/time tracking

### 3. Exercise Library & Templates
**As a user, I want pre-defined exercises and workout templates so I can quickly log common workouts.**

- Common exercise database (Push-ups, Running, Yoga, etc.)
- Quick-select exercise buttons
- Workout templates for common routines
- Custom exercise creation

### 4. Workout Progress Tracking
**As a user, I want to see my workout progress over time so I can stay motivated and track improvements.**

- Weekly/monthly workout summaries
- Total exercise time tracking
- Workout frequency analytics
- Streak tracking (consecutive workout days)
- Progress charts and visualizations

### 5. Health Integration
**As a user, I want my workout data to integrate with my weight and diet tracking so I can see the complete health picture.**

- Unified health dashboard
- Cross-module analytics (workouts vs weight trends)
- Holistic health insights
- Combined progress tracking

## Technical Design

### Core Types
```typescript
export type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other'
export type IntensityLevel = 'light' | 'moderate' | 'intense'

export interface Exercise {
  id: string
  name: string
  type: ExerciseType
  description?: string
  defaultDuration?: number // minutes
  caloriesPerMinute?: number // estimated calories burned per minute
  isCustom: boolean
  createdAt: string
}

export interface WorkoutEntry {
  id: string
  exerciseId: string
  exerciseName: string // denormalized for quick access
  type: ExerciseType
  duration: number // minutes
  intensity: IntensityLevel
  notes?: string
  caloriesBurned?: number // calculated or user-entered
  date: string // ISO date string
  createdAt: string
  updatedAt: string
}

export interface WorkoutTemplate {
  id: string
  name: string
  description?: string
  exercises: {
    exerciseId: string
    duration: number
    intensity: IntensityLevel
  }[]
  estimatedDuration: number // total minutes
  createdAt: string
}

export interface WorkoutAnalytics {
  totalWorkouts: number
  totalMinutes: number
  totalCalories: number
  currentStreak: number
  longestStreak: number
  averageWorkoutsPerWeek: number
  favoriteExerciseType: ExerciseType
  weeklyProgress: {
    week: string
    workouts: number
    minutes: number
    calories: number
  }[]
}
```

### Health Tab Structure
```
Health Tab
├── Weight (existing)
├── Meals (existing) 
└── Workout (new)
    ├── Quick Log
    ├── Exercise Library
    ├── Workout Templates
    └── Progress Analytics
```

## Implementation Strategy

### Phase 1: Tab Restructuring (Day 1)
- [ ] Rename "Diet" to "Health" in navigation
- [ ] Update DietHubPage to HealthHubPage
- [ ] Add Workout tab to existing Weight/Meals tabs
- [ ] Update routing and navigation

### Phase 2: Workout Foundation (Day 2)
- [ ] Create workout types and interfaces
- [ ] Build workout store with Zustand
- [ ] Create exercise database with common exercises
- [ ] Implement basic workout entry form

### Phase 3: Workout Logging (Day 3)
- [ ] Build workout entry form with exercise selection
- [ ] Add duration and intensity tracking
- [ ] Implement workout history display
- [ ] Add edit/delete functionality

### Phase 4: Analytics & Progress (Day 4)
- [ ] Create workout analytics calculations
- [ ] Build progress visualization components
- [ ] Add streak tracking
- [ ] Implement weekly/monthly summaries

### Phase 5: Templates & Integration (Day 5)
- [ ] Add workout templates system
- [ ] Create quick workout buttons
- [ ] Integrate with health dashboard
- [ ] Add cross-module analytics

## Key Features

### Quick Workout Logging
1. **Exercise Selection** - Choose from library or create custom
2. **Duration Input** - Minutes of exercise
3. **Intensity Level** - Light/Moderate/Intense
4. **Quick Notes** - Optional workout details
5. **One-Click Save** - Fast logging experience

### Exercise Library
- **Cardio**: Running, Cycling, Swimming, Walking, etc.
- **Strength**: Push-ups, Pull-ups, Squats, Weightlifting, etc.
- **Flexibility**: Yoga, Stretching, Pilates, etc.
- **Sports**: Basketball, Tennis, Soccer, etc.
- **Other**: Custom exercises

### Progress Tracking
- Daily workout calendar view
- Weekly exercise minutes
- Monthly workout frequency
- Streak counters and achievements
- Exercise type distribution
- Calorie burn estimates

### Health Integration
- Unified health analytics header
- Weight + workout correlation insights
- Meal + workout timing analysis
- Comprehensive health dashboard

## Success Metrics
- Daily workout logging adoption rate
- Average workout duration
- Workout consistency (streak length)
- User engagement with exercise library
- Cross-module usage (weight + meals + workout)

## Future Enhancements
- Workout sharing and social features
- Advanced exercise form guides
- Integration with fitness devices
- Personalized workout recommendations
- Achievement badges and gamification

## Data Collection for AI Coaching
- Exercise preferences and patterns
- Workout timing and frequency
- Intensity progression over time
- Exercise type variety
- Workout-weight correlation data
 