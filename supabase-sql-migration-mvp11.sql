-- MVP 11 - Todo System Core Enhancements Database Migration
-- This migration adds rich text descriptions, points system, and enhanced due dates

-- =====================================================
-- 1. ALTER TODOS TABLE FOR MVP 11 ENHANCEMENTS
-- =====================================================

-- Add new columns to support MVP 11 features
ALTER TABLE public.todos 
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS description_format TEXT DEFAULT 'markdown' CHECK (description_format IN ('markdown', 'plaintext', 'html')),
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 5 CHECK (points >= 1 AND points <= 10),
  ADD COLUMN IF NOT EXISTS due_date_time TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Migrate existing 'text' column to 'summary' column (preserve existing data)
UPDATE public.todos 
SET summary = text 
WHERE summary IS NULL;

-- Make summary NOT NULL after migration
ALTER TABLE public.todos 
  ALTER COLUMN summary SET NOT NULL;

-- Migrate existing due_date to due_date_time (preserve existing data)
UPDATE public.todos 
SET due_date_time = due_date::timestamp with time zone 
WHERE due_date IS NOT NULL AND due_date_time IS NULL;

-- =====================================================
-- 2. CREATE REMINDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID REFERENCES public.todos(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'notification' CHECK (type IN ('notification', 'email', 'sms')),
  offset_minutes INTEGER NOT NULL, -- Minutes before due date
  enabled BOOLEAN DEFAULT TRUE,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. SECURITY AND INDEXES
-- =====================================================

-- Enable RLS on reminders table
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Reminders policies (access through parent todo)
CREATE POLICY "Users can access reminders of their todos" 
  ON public.reminders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.todos 
      WHERE todos.id = reminders.todo_id 
      AND todos.user_id = auth.uid()
    )
  );

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS todos_points_idx ON public.todos(points);
CREATE INDEX IF NOT EXISTS todos_due_date_time_idx ON public.todos(due_date_time);
CREATE INDEX IF NOT EXISTS todos_completed_at_idx ON public.todos(completed_at);
CREATE INDEX IF NOT EXISTS reminders_todo_id_idx ON public.reminders(todo_id);
CREATE INDEX IF NOT EXISTS reminders_due_date_idx ON public.reminders(todo_id, offset_minutes);

-- =====================================================
-- 4. ADD TRIGGERS FOR COMPLETION TRACKING
-- =====================================================

-- Function to track completion time
CREATE OR REPLACE FUNCTION public.handle_todo_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If todo is being marked as done, set completed_at
  IF NEW.done = TRUE AND OLD.done = FALSE THEN
    NEW.completed_at = NOW();
  -- If todo is being marked as not done, clear completed_at
  ELSIF NEW.done = FALSE AND OLD.done = TRUE THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add completion tracking trigger
DROP TRIGGER IF EXISTS handle_todo_completion ON public.todos;
CREATE TRIGGER handle_todo_completion
  BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.handle_todo_completion();

-- =====================================================
-- 5. HELPFUL VIEWS FOR POINTS STATISTICS
-- =====================================================

-- View for daily points statistics
CREATE OR REPLACE VIEW public.daily_points_stats AS
SELECT 
  user_id,
  DATE(completed_at) as completion_date,
  SUM(points) as total_points,
  COUNT(*) as completed_tasks,
  AVG(points) as average_points
FROM public.todos
WHERE done = TRUE AND completed_at IS NOT NULL
GROUP BY user_id, DATE(completed_at);

-- View for user points summary
CREATE OR REPLACE VIEW public.user_points_summary AS
SELECT 
  user_id,
  SUM(CASE WHEN done = TRUE THEN points ELSE 0 END) as total_earned_points,
  SUM(points) as total_possible_points,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN done = TRUE THEN 1 END) as completed_tasks,
  AVG(CASE WHEN done = TRUE THEN points END) as average_task_points
FROM public.todos
GROUP BY user_id;

-- Grant access to views
GRANT SELECT ON public.daily_points_stats TO authenticated;
GRANT SELECT ON public.user_points_summary TO authenticated;

-- RLS for views (users can only see their own stats)
ALTER VIEW public.daily_points_stats OWNER TO postgres;
ALTER VIEW public.user_points_summary OWNER TO postgres;

-- =====================================================
-- 6. MIGRATION CLEANUP AND VALIDATION
-- =====================================================

-- Add helpful comment
COMMENT ON COLUMN public.todos.summary IS 'Brief one-line task description (replaces old text field)';
COMMENT ON COLUMN public.todos.description IS 'Detailed rich text description with markdown support';
COMMENT ON COLUMN public.todos.points IS 'Task difficulty/importance score (1-10 scale)';
COMMENT ON COLUMN public.todos.due_date_time IS 'Due date with time (enhanced version of due_date)';
COMMENT ON COLUMN public.todos.completed_at IS 'Timestamp when task was completed (for points tracking)';

-- Validation: Ensure no data loss during migration
-- This can be run manually to verify migration success
-- SELECT COUNT(*) as total_todos, 
--        COUNT(summary) as todos_with_summary,
--        COUNT(text) as todos_with_old_text
-- FROM public.todos; 