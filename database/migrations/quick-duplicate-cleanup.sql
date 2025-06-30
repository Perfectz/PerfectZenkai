-- QUICK DUPLICATE CLEANUP for Perfect Zenkai
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/kslvxxoykdkstnkjgpnd/sql

-- Step 1: Create backup (always safe)
CREATE TABLE IF NOT EXISTS public.todos_backup_emergency AS
SELECT * FROM public.todos 
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'pzgambo@gmail.com' 
    LIMIT 1
);

-- Step 2: Quick analysis
SELECT 
    'BEFORE CLEANUP' as status,
    COUNT(*) as total_todos,
    COUNT(DISTINCT summary) as unique_tasks,
    COUNT(*) - COUNT(DISTINCT summary) as duplicate_count
FROM public.todos 
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'pzgambo@gmail.com' 
    LIMIT 1
);

-- Step 3: Delete duplicates (keeps newest updated_at for each task)
WITH duplicate_removal AS (
    SELECT 
        id,
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
DELETE FROM public.todos 
WHERE id IN (
    SELECT id FROM duplicate_removal WHERE rank_newest > 1
);

-- Step 4: Verify cleanup
SELECT 
    'AFTER CLEANUP' as status,
    COUNT(*) as total_todos,
    COUNT(DISTINCT summary) as unique_tasks,
    COUNT(*) - COUNT(DISTINCT summary) as remaining_duplicates
FROM public.todos 
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'pzgambo@gmail.com' 
    LIMIT 1
);

-- Step 5: Show your remaining tasks
SELECT 
    summary,
    category,
    priority,
    done,
    created_at,
    updated_at
FROM public.todos 
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'pzgambo@gmail.com' 
    LIMIT 1
)
ORDER BY updated_at DESC
LIMIT 20;

-- Note: Backup table created as 'todos_backup_emergency' - can be dropped later if satisfied with results 