-- Database Optimization MVP - Phase 2: Missing Tables Implementation
-- Generated: 2025-01-27
-- Priority: P1 - Required for MVP features

-- =====================================================
-- 1. RECURRING TASKS SYSTEM (MVP-21)
-- =====================================================

-- Create recurring_todos table
CREATE TABLE IF NOT EXISTS public.recurring_todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    description_format TEXT DEFAULT 'markdown' CHECK (description_format IN ('markdown', 'plaintext', 'html')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT DEFAULT 'other' CHECK (category IN ('work', 'personal', 'health', 'learning', 'other')),
    points INTEGER DEFAULT 5 CHECK (points >= 1 AND points <= 10),
    
    -- Recurrence pattern
    recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'monthly')),
    recurrence_interval INTEGER DEFAULT 1 CHECK (recurrence_interval > 0),
    days_of_week INTEGER[] CHECK (
        array_length(days_of_week, 1) IS NULL OR 
        (array_length(days_of_week, 1) > 0 AND days_of_week <@ ARRAY[0,1,2,3,4,5,6])
    ),
    end_date DATE,
    max_occurrences INTEGER CHECK (max_occurrences > 0),
    
    -- Status tracking
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    next_due_date DATE NOT NULL,
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    best_streak INTEGER DEFAULT 0 CHECK (best_streak >= 0),
    
    -- Metadata
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todo_completions table for tracking recurring task completions
CREATE TABLE IF NOT EXISTS public.todo_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recurring_todo_id UUID REFERENCES public.recurring_todos(id) ON DELETE CASCADE NOT NULL,
    scheduled_for DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    points INTEGER NOT NULL CHECK (points >= 1 AND points <= 10),
    streak_day INTEGER NOT NULL CHECK (streak_day > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.recurring_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own recurring todos" 
    ON public.recurring_todos 
    FOR ALL 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own todo completions" 
    ON public.todo_completions 
    FOR ALL 
    USING (auth.uid() = (SELECT user_id FROM recurring_todos WHERE id = recurring_todo_id));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_recurring_todos_user_id ON public.recurring_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_todos_next_due ON public.recurring_todos(user_id, next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_todos_status ON public.recurring_todos(status);
CREATE INDEX IF NOT EXISTS idx_todo_completions_recurring_todo ON public.todo_completions(recurring_todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_completions_scheduled ON public.todo_completions(scheduled_for);

-- Add triggers for updated_at
CREATE TRIGGER update_recurring_todos_updated_at 
    BEFORE UPDATE ON public.recurring_todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. TASK TEMPLATES SYSTEM
-- =====================================================

-- Create task_templates table
CREATE TABLE IF NOT EXISTS public.task_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    description_format TEXT DEFAULT 'markdown' CHECK (description_format IN ('markdown', 'plaintext', 'html')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT DEFAULT 'other' CHECK (category IN ('work', 'personal', 'health', 'learning', 'other')),
    points INTEGER DEFAULT 5 CHECK (points >= 1 AND points <= 10),
    subtasks JSONB DEFAULT '[]',
    tags TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add template_id to todos table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'todos' AND column_name = 'template_id'
    ) THEN
        ALTER TABLE public.todos 
        ADD COLUMN template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added template_id column to todos table';
    ELSE
        RAISE NOTICE 'template_id column already exists in todos table';
    END IF;
END $$;

-- Enable RLS on task_templates
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for templates
CREATE POLICY "Users can manage their own templates" 
    ON public.task_templates 
    FOR ALL 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" 
    ON public.task_templates 
    FOR SELECT 
    USING (is_public = TRUE);

-- Add indexes for task templates
CREATE INDEX IF NOT EXISTS idx_task_templates_user_id ON public.task_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_category ON public.task_templates(category);
CREATE INDEX IF NOT EXISTS idx_task_templates_public ON public.task_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_task_templates_tags ON public.task_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_todos_template_id ON public.todos(template_id);

-- Add triggers for task templates
CREATE TRIGGER update_task_templates_updated_at 
    BEFORE UPDATE ON public.task_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample recurring todo (for testing)
INSERT INTO public.recurring_todos (
    user_id, summary, description, priority, category, points,
    recurrence_type, status, next_due_date
)
SELECT 
    id as user_id,
    'Daily Exercise' as summary,
    'Complete 30 minutes of physical activity' as description,
    'high' as priority,
    'health' as category,
    7 as points,
    'daily' as recurrence_type,
    'active' as status,
    CURRENT_DATE as next_due_date
FROM auth.users 
WHERE email LIKE '%@%' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample task template (for testing)
INSERT INTO public.task_templates (
    user_id, name, summary, description, priority, category, points, subtasks
)
SELECT 
    id as user_id,
    'Weekly Review' as name,
    'Complete weekly productivity review' as summary,
    'Review accomplishments, plan next week, and reflect on goals' as description,
    'medium' as priority,
    'work' as category,
    5 as points,
    '[{"text": "Review completed tasks", "done": false}, {"text": "Plan next week priorities", "done": false}, {"text": "Update goals progress", "done": false}]'::jsonb as subtasks
FROM auth.users 
WHERE email LIKE '%@%' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. DOCUMENTATION
-- =====================================================

-- Add table comments
COMMENT ON TABLE public.recurring_todos IS 'Recurring tasks with scheduling patterns and streak tracking';
COMMENT ON TABLE public.todo_completions IS 'Completion records for recurring tasks with streak information';
COMMENT ON TABLE public.task_templates IS 'Reusable task templates for quick task creation';

COMMENT ON COLUMN public.recurring_todos.recurrence_type IS 'How often the task repeats: daily, weekly, or monthly';
COMMENT ON COLUMN public.recurring_todos.days_of_week IS 'For weekly recurrence: array of weekday numbers (0=Sunday, 6=Saturday)';
COMMENT ON COLUMN public.recurring_todos.current_streak IS 'Current consecutive completion streak';
COMMENT ON COLUMN public.recurring_todos.best_streak IS 'Best streak ever achieved for this recurring task';

COMMENT ON COLUMN public.task_templates.is_public IS 'Whether template can be used by other users';
COMMENT ON COLUMN public.task_templates.usage_count IS 'Number of times this template has been used';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Phase 2 Missing Tables Implementation completed successfully';
    RAISE NOTICE 'Recurring tasks system is now fully supported in database';
    RAISE NOTICE 'Task templates system is now available for persistent storage';
END $$; 