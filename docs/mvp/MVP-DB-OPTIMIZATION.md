# MVP-DB: Database Optimization & Security Enhancement

## Overview
Critical database fixes and optimizations to resolve security issues, add missing features, and improve performance.

## Success Criteria
- [ ] Fix critical security vulnerability in goals table
- [ ] Implement missing tables for recurring tasks system
- [ ] Add template support for tasks
- [ ] Optimize database indexes and queries
- [ ] Verify all RLS policies are working correctly

## Current Issues Identified

### 🚨 CRITICAL (Fix Immediately)
1. **Goals Table Security Gap**: Missing `user_id` column allows cross-user data access
2. **Missing RLS Policies**: Some tables may not have proper Row Level Security

### ⚠️ HIGH PRIORITY (MVP Features Missing)
3. **Recurring Tasks System**: No database tables for MVP-21
4. **Task Templates**: No persistence for template functionality

### 🔧 OPTIMIZATION (Performance & Quality)
5. **Missing Indexes**: Some query patterns could be optimized
6. **Constraint Validation**: Add business logic constraints

## Implementation Plan

### Phase 1: Security Fixes (CRITICAL - 30 min)

#### 1.1 Fix Goals Table Security
```sql
-- Add user_id column
ALTER TABLE public.goals 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing goals
UPDATE public.goals 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id required
ALTER TABLE public.goals 
ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own goals" 
    ON public.goals FOR ALL USING (auth.uid() = user_id);

-- Add index
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
```

### Phase 2: Missing Tables (HIGH - 45 min)

#### 2.1 Recurring Tasks System
```sql
-- Create recurring_todos table
CREATE TABLE public.recurring_todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT DEFAULT 'other' CHECK (category IN ('work', 'personal', 'health', 'learning', 'other')),
    points INTEGER DEFAULT 5 CHECK (points >= 1 AND points <= 10),
    recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'monthly')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    next_due_date DATE NOT NULL,
    current_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todo_completions table  
CREATE TABLE public.todo_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recurring_todo_id UUID REFERENCES public.recurring_todos(id) ON DELETE CASCADE NOT NULL,
    scheduled_for DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    points INTEGER NOT NULL,
    streak_day INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.recurring_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own recurring todos" 
    ON public.recurring_todos FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own todo completions" 
    ON public.todo_completions FOR ALL 
    USING (auth.uid() = (SELECT user_id FROM recurring_todos WHERE id = recurring_todo_id));
```

#### 2.2 Task Templates
```sql
-- Create task_templates table
CREATE TABLE public.task_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'other',
    points INTEGER DEFAULT 5,
    subtasks JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add template_id to todos
ALTER TABLE public.todos 
ADD COLUMN template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own templates" 
    ON public.task_templates FOR ALL USING (auth.uid() = user_id);
```

### Phase 3: Performance Optimization (30 min)

#### 3.1 Enhanced Indexing
```sql
-- Composite indexes for common queries
CREATE INDEX idx_todos_user_priority_done ON public.todos(user_id, priority, done);
CREATE INDEX idx_todos_user_due_date ON public.todos(user_id, due_date_time) WHERE due_date_time IS NOT NULL;

-- Full-text search
CREATE INDEX idx_todos_search ON public.todos USING gin(to_tsvector('english', summary || ' ' || COALESCE(description, '')));
```

## Timeline
1. **Phase 1** (Security): Execute immediately - 30 minutes
2. **Phase 2** (Missing Tables): After security fixes - 45 minutes  
3. **Phase 3** (Performance): After core features - 30 minutes

**Total Time**: ~2 hours

## Next Steps
Execute Phase 1 immediately to fix critical security vulnerability. 