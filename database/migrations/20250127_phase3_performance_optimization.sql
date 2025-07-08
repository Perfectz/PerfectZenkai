-- Database Optimization MVP - Phase 3: Performance Optimization
-- Generated: 2025-01-27
-- Priority: P2 - Performance improvements

-- =====================================================
-- 1. ENHANCED INDEXING FOR COMMON QUERY PATTERNS
-- =====================================================

-- Composite indexes for todos table (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_todos_user_priority_done ON public.todos(user_id, priority, done);
CREATE INDEX IF NOT EXISTS idx_todos_user_category_done ON public.todos(user_id, category, done);
CREATE INDEX IF NOT EXISTS idx_todos_user_due_date ON public.todos(user_id, due_date_time) 
    WHERE due_date_time IS NOT NULL;

-- Optimize queries by completion status and recent activity
CREATE INDEX IF NOT EXISTS idx_todos_user_completed_recent ON public.todos(user_id, completed_at DESC) 
    WHERE completed_at IS NOT NULL;

-- Index for points and goal tracking
CREATE INDEX IF NOT EXISTS idx_todos_user_points ON public.todos(user_id, points, done);
CREATE INDEX IF NOT EXISTS idx_todos_goal_id ON public.todos(goal_id) 
    WHERE goal_id IS NOT NULL;

-- =====================================================
-- 2. FULL-TEXT SEARCH OPTIMIZATION
-- =====================================================

-- Full-text search indexes for todos
CREATE INDEX IF NOT EXISTS idx_todos_search ON public.todos 
    USING gin(to_tsvector('english', summary || ' ' || COALESCE(description, '')));

-- Full-text search for notes (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notes_search ON public.notes 
                 USING gin(to_tsvector(''english'', title || '' '' || content))';
        RAISE NOTICE 'Created full-text search index for notes table';
    END IF;
END $$;

-- Full-text search for task templates
CREATE INDEX IF NOT EXISTS idx_task_templates_search ON public.task_templates 
    USING gin(to_tsvector('english', name || ' ' || summary || ' ' || COALESCE(description, '')));

-- =====================================================
-- 3. WEIGHT TRACKING OPTIMIZATION
-- =====================================================

-- Optimize recent weight entries (last 90 days are most frequently accessed)
CREATE INDEX IF NOT EXISTS idx_weight_entries_recent ON public.weight_entries(user_id, date_iso DESC) 
    WHERE date_iso >= CURRENT_DATE - INTERVAL '90 days';

-- Index for weight analysis and trends
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date_kg ON public.weight_entries(user_id, date_iso, kg);

-- =====================================================
-- 4. MEAL TRACKING OPTIMIZATION
-- =====================================================

-- Optimize recent meal entries (last 30 days most frequently accessed)
CREATE INDEX IF NOT EXISTS idx_meal_entries_recent ON public.meal_entries(user_id, meal_date DESC, meal_type) 
    WHERE meal_date >= CURRENT_DATE - INTERVAL '30 days';

-- Index for meal analysis and calorie tracking
CREATE INDEX IF NOT EXISTS idx_meal_entries_calories ON public.meal_entries(user_id, meal_date, total_calories) 
    WHERE total_calories IS NOT NULL;

-- =====================================================
-- 5. WORKOUT TRACKING OPTIMIZATION
-- =====================================================

-- Optimize recent workout entries
CREATE INDEX IF NOT EXISTS idx_workout_entries_recent ON public.workout_entries(user_id, workout_date DESC) 
    WHERE workout_date >= CURRENT_DATE - INTERVAL '60 days';

-- Index for workout analysis
CREATE INDEX IF NOT EXISTS idx_workout_entries_exercise_type ON public.workout_entries(user_id, exercise_type, workout_date);

-- =====================================================
-- 6. JOURNAL AND DAILY TRACKING OPTIMIZATION
-- =====================================================

-- Optimize journal entries for recent access
CREATE INDEX IF NOT EXISTS idx_journal_entries_recent ON public.journal_entries(user_id, entry_date DESC) 
    WHERE entry_date >= CURRENT_DATE - INTERVAL '30 days';

-- Index for mood and energy tracking
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON public.journal_entries(user_id, mood_score, entry_date) 
    WHERE mood_score IS NOT NULL;

-- =====================================================
-- 7. RECURRING TASKS OPTIMIZATION
-- =====================================================

-- Index for active recurring tasks due soon
CREATE INDEX IF NOT EXISTS idx_recurring_todos_due_soon ON public.recurring_todos(user_id, next_due_date, status) 
    WHERE status = 'active' AND next_due_date <= CURRENT_DATE + INTERVAL '7 days';

-- Index for streak analysis
CREATE INDEX IF NOT EXISTS idx_recurring_todos_streaks ON public.recurring_todos(user_id, current_streak DESC, best_streak DESC);

-- =====================================================
-- 8. DATABASE UTILITY FUNCTIONS
-- =====================================================

-- Function to calculate user productivity metrics efficiently
CREATE OR REPLACE FUNCTION get_user_productivity_metrics(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'completed_tasks', COUNT(*) FILTER (WHERE done = TRUE),
        'total_tasks', COUNT(*),
        'completion_rate', ROUND((COUNT(*) FILTER (WHERE done = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2),
        'total_points', COALESCE(SUM(points) FILTER (WHERE done = TRUE), 0),
        'avg_points_per_task', ROUND(AVG(points) FILTER (WHERE done = TRUE), 2),
        'days_analyzed', days_back,
        'last_updated', NOW()
    ) INTO result
    FROM public.todos
    WHERE user_id = user_uuid 
    AND created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get weight trend analysis efficiently
CREATE OR REPLACE FUNCTION get_weight_trend_analysis(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    current_weight DECIMAL(5,2);
    oldest_weight DECIMAL(5,2);
BEGIN
    -- Get current weight
    SELECT kg INTO current_weight 
    FROM public.weight_entries 
    WHERE user_id = user_uuid 
    ORDER BY date_iso DESC 
    LIMIT 1;
    
    -- Get oldest weight in the period
    SELECT kg INTO oldest_weight 
    FROM public.weight_entries 
    WHERE user_id = user_uuid 
    AND date_iso >= CURRENT_DATE - INTERVAL '1 day' * days_back
    ORDER BY date_iso ASC 
    LIMIT 1;
    
    -- Build comprehensive result
    SELECT json_build_object(
        'current_weight', current_weight,
        'weight_change', COALESCE(current_weight - oldest_weight, 0),
        'total_entries', COUNT(*),
        'avg_weight', ROUND(AVG(kg), 2),
        'min_weight', MIN(kg),
        'max_weight', MAX(kg),
        'weight_range', MAX(kg) - MIN(kg),
        'days_analyzed', days_back,
        'last_updated', NOW()
    ) INTO result
    FROM public.weight_entries
    WHERE user_id = user_uuid 
    AND date_iso >= CURRENT_DATE - INTERVAL '1 day' * days_back;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recurring task completion rate
CREATE OR REPLACE FUNCTION get_recurring_task_metrics(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'active_recurring_tasks', COUNT(*) FILTER (WHERE status = 'active'),
        'total_recurring_tasks', COUNT(*),
        'avg_current_streak', ROUND(AVG(current_streak), 2),
        'best_streak_overall', MAX(best_streak),
        'due_today', COUNT(*) FILTER (WHERE next_due_date = CURRENT_DATE AND status = 'active'),
        'overdue', COUNT(*) FILTER (WHERE next_due_date < CURRENT_DATE AND status = 'active'),
        'last_updated', NOW()
    ) INTO result
    FROM public.recurring_todos
    WHERE user_id = user_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. PERFORMANCE MONITORING
-- =====================================================

-- Create a view for monitoring database performance
CREATE OR REPLACE VIEW public.user_activity_summary AS
SELECT 
    u.id as user_id,
    u.email,
    -- Todo metrics
    (SELECT COUNT(*) FROM todos WHERE user_id = u.id) as total_todos,
    (SELECT COUNT(*) FROM todos WHERE user_id = u.id AND done = true) as completed_todos,
    -- Weight tracking
    (SELECT COUNT(*) FROM weight_entries WHERE user_id = u.id) as weight_entries,
    (SELECT MAX(date_iso) FROM weight_entries WHERE user_id = u.id) as last_weight_entry,
    -- Recent activity
    (SELECT COUNT(*) FROM todos WHERE user_id = u.id AND created_at >= CURRENT_DATE - INTERVAL '7 days') as todos_this_week,
    (SELECT COUNT(*) FROM weight_entries WHERE user_id = u.id AND date_iso >= CURRENT_DATE - INTERVAL '7 days') as weight_entries_this_week
FROM auth.users u
WHERE u.email IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON public.user_activity_summary TO authenticated;

-- =====================================================
-- 10. INDEX MAINTENANCE
-- =====================================================

-- Add comments for index documentation
COMMENT ON INDEX idx_todos_user_priority_done IS 'Optimizes task queries by user, priority, and completion status';
COMMENT ON INDEX idx_todos_search IS 'Full-text search across task summaries and descriptions';
COMMENT ON INDEX idx_weight_entries_recent IS 'Optimizes recent weight entry queries (90 days)';
COMMENT ON INDEX idx_meal_entries_recent IS 'Optimizes recent meal entry queries (30 days)';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Phase 3 Performance Optimization completed successfully';
    RAISE NOTICE 'Enhanced indexing strategy implemented for all major tables';
    RAISE NOTICE 'Database utility functions created for efficient metrics calculation';
    RAISE NOTICE 'Performance monitoring views created';
END $$; 