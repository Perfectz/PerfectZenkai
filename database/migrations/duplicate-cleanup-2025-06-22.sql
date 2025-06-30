-- Duplicate Tasks Cleanup Script for Perfect Zenkai
-- Date: 2025-06-22
-- Purpose: Remove duplicate tasks from Supabase database
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/kslvxxoykdkstnkjgpnd/sql

-- =====================================================
-- STEP 1: ANALYZE DUPLICATE TASKS
-- =====================================================

-- First, let's see the current situation
-- Run this to understand the duplicates
SELECT 
    'Duplicate Analysis' as report_type,
    summary as task_summary,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as duplicate_ids,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM public.todos 
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'pzgambo@gmail.com' 
    LIMIT 1
)
GROUP BY summary, category, priority, done
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, summary;

-- =====================================================
-- STEP 2: IDENTIFY SPECIFIC DUPLICATES FOR YOUR USER
-- =====================================================

-- Get your user ID first
DO $$
DECLARE
    target_user_id UUID;
    total_todos INTEGER;
    duplicate_todos INTEGER;
BEGIN
    -- Find your user ID
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'pzgambo@gmail.com' 
    LIMIT 1;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email pzgambo@gmail.com not found';
    END IF;
    
    -- Count total and duplicate todos
    SELECT COUNT(*) INTO total_todos 
    FROM public.todos 
    WHERE user_id = target_user_id;
    
    SELECT COUNT(*) INTO duplicate_todos
    FROM (
        SELECT summary, category, priority, done, COUNT(*) as cnt
        FROM public.todos 
        WHERE user_id = target_user_id
        GROUP BY summary, category, priority, done
        HAVING COUNT(*) > 1
    ) duplicates;
    
    RAISE NOTICE 'User ID: %', target_user_id;
    RAISE NOTICE 'Total todos: %', total_todos;
    RAISE NOTICE 'Duplicate groups: %', duplicate_todos;
END $$;

-- =====================================================
-- STEP 3: SAFE DUPLICATE REMOVAL (DRY RUN FIRST)
-- =====================================================

-- This creates a temporary table with the IDs to delete
-- RUN THIS FIRST to see what would be deleted
CREATE TEMP TABLE todos_to_delete AS
WITH duplicate_groups AS (
    SELECT 
        id,
        summary,
        category,
        priority,
        done,
        created_at,
        updated_at,
        -- Rank by most recent updated_at, then created_at
        ROW_NUMBER() OVER (
            PARTITION BY summary, category, priority, done 
            ORDER BY updated_at DESC, created_at DESC
        ) as rank_newest
    FROM public.todos 
    WHERE user_id = (
        SELECT id FROM auth.users 
        WHERE email = 'pzgambo@gmail.com' 
        LIMIT 1
    )
)
SELECT 
    id,
    summary,
    category,
    priority,
    done,
    created_at,
    updated_at,
    'DUPLICATE - WILL DELETE' as action
FROM duplicate_groups 
WHERE rank_newest > 1; -- Keep only the newest (rank = 1), delete the rest

-- Show what will be deleted (DRY RUN)
SELECT 
    COUNT(*) as total_duplicates_to_delete,
    STRING_AGG(DISTINCT summary, '; ') as affected_tasks
FROM todos_to_delete;

-- Show detailed list of what will be deleted
SELECT * FROM todos_to_delete ORDER BY summary, created_at;

-- =====================================================
-- STEP 4: BACKUP BEFORE DELETION (RECOMMENDED)
-- =====================================================

-- Create a backup table with all your todos
CREATE TABLE IF NOT EXISTS public.todos_backup_20250622 AS
SELECT * FROM public.todos 
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'pzgambo@gmail.com' 
    LIMIT 1
);

-- Verify backup
SELECT 
    COUNT(*) as backup_count,
    MIN(created_at) as oldest_todo,
    MAX(created_at) as newest_todo
FROM public.todos_backup_20250622;

-- =====================================================
-- STEP 5: ACTUAL DUPLICATE DELETION
-- =====================================================

-- ⚠️ CAUTION: This will actually delete the duplicates
-- Only run this after reviewing the DRY RUN results above
-- Uncomment the next block to execute the deletion

/*
DO $$
DECLARE
    deleted_count INTEGER;
    target_user_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'pzgambo@gmail.com' 
    LIMIT 1;
    
    -- Delete duplicates (keep newest of each group)
    WITH duplicate_groups AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY summary, category, priority, done 
                ORDER BY updated_at DESC, created_at DESC
            ) as rank_newest
        FROM public.todos 
        WHERE user_id = target_user_id
    )
    DELETE FROM public.todos 
    WHERE id IN (
        SELECT id FROM duplicate_groups WHERE rank_newest > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate todos', deleted_count;
    
    -- Show final count
    SELECT COUNT(*) INTO deleted_count 
    FROM public.todos 
    WHERE user_id = target_user_id;
    
    RAISE NOTICE 'Remaining todos: %', deleted_count;
END $$;
*/

-- =====================================================
-- STEP 6: CLEANUP AND VERIFICATION
-- =====================================================

-- After deletion, verify no duplicates remain
SELECT 
    'Post-Cleanup Verification' as report_type,
    summary,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as remaining_ids
FROM public.todos 
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'pzgambo@gmail.com' 
    LIMIT 1
)
GROUP BY summary, category, priority, done
HAVING COUNT(*) > 1
ORDER BY summary;

-- Final statistics
SELECT 
    COUNT(*) as total_unique_todos,
    COUNT(DISTINCT summary) as unique_summaries,
    COUNT(CASE WHEN done = true THEN 1 END) as completed_todos,
    COUNT(CASE WHEN done = false THEN 1 END) as pending_todos
FROM public.todos 
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'pzgambo@gmail.com' 
    LIMIT 1
);

-- =====================================================
-- STEP 7: OPTIONAL - DROP BACKUP TABLE AFTER VERIFICATION
-- =====================================================

-- Only run this after confirming everything looks good
-- DROP TABLE IF EXISTS public.todos_backup_20250622;

-- =====================================================
-- NOTES FOR EXECUTION
-- =====================================================

/*
EXECUTION STEPS:

1. ANALYZE (Always safe):
   - Run STEP 1 & 2 to see current duplicates
   
2. DRY RUN (Always safe):
   - Run STEP 3 to see what would be deleted
   - Review the results carefully
   
3. BACKUP (Recommended):
   - Run STEP 4 to create backup
   
4. DELETE (Caution required):
   - Uncomment STEP 5 and run to actually delete duplicates
   
5. VERIFY (Always safe):
   - Run STEP 6 to confirm cleanup worked
   
6. CLEANUP (Optional):
   - Run STEP 7 to remove backup table

SAFETY FEATURES:
- Creates backup before deletion
- Shows exactly what will be deleted
- Preserves newest version of each duplicate
- Includes verification steps
*/ 