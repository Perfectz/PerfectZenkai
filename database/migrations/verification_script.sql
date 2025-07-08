-- Verification Script for Database Optimization MVP
-- Run this after executing all three phases to verify success

-- Check if goals table has user_id column (Phase 1)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'goals' AND column_name = 'user_id'
        ) 
        THEN 'Goals table has user_id column' 
        ELSE 'Goals table missing user_id column' 
    END as phase1_check;

-- Check if recurring_todos table exists (Phase 2)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'recurring_todos'
        ) 
        THEN 'Recurring todos table exists' 
        ELSE 'Recurring todos table missing' 
    END as phase2_check;

-- Check if enhanced indexes exist (Phase 3)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'idx_todos_user_priority_done'
        ) 
        THEN 'Performance indexes created' 
        ELSE 'Performance indexes missing' 
    END as phase3_check;

-- Overall RLS status check
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('todos', 'goals', 'weight_entries', 'recurring_todos', 'task_templates')
ORDER BY tablename; 