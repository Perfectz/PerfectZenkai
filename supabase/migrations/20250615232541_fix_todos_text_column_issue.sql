-- Fix todos table text column constraint issue
-- This migration properly handles the text -> summary migration and removes the NOT NULL constraint

-- =====================================================
-- 1. ENSURE SUMMARY COLUMN EXISTS AND HAS DATA
-- =====================================================

-- Add summary column if it doesn't exist
ALTER TABLE public.todos 
  ADD COLUMN IF NOT EXISTS summary TEXT;

-- Migrate any remaining data from text to summary
UPDATE public.todos 
SET summary = text 
WHERE summary IS NULL AND text IS NOT NULL;

-- =====================================================
-- 2. HANDLE TEXT COLUMN CONSTRAINT
-- =====================================================

-- Remove NOT NULL constraint from text column to allow backwards compatibility
-- This allows both text and summary to coexist temporarily
ALTER TABLE public.todos 
  ALTER COLUMN text DROP NOT NULL;

-- Update text column to match summary for consistency
UPDATE public.todos 
SET text = summary 
WHERE text IS NULL AND summary IS NOT NULL;

-- =====================================================
-- 3. ENSURE SUMMARY IS THE PRIMARY FIELD
-- =====================================================

-- Make summary NOT NULL since it's the primary field going forward
-- Only after ensuring all records have summary data
UPDATE public.todos 
SET summary = COALESCE(summary, text, 'Untitled Todo')
WHERE summary IS NULL;

ALTER TABLE public.todos 
  ALTER COLUMN summary SET NOT NULL;

-- =====================================================
-- 4. ADD VALIDATION COMMENTS
-- =====================================================

COMMENT ON COLUMN public.todos.text IS 'Legacy text field (deprecated, use summary instead)';
COMMENT ON COLUMN public.todos.summary IS 'Primary task description field (NOT NULL)';

-- =====================================================
-- 5. VERIFICATION QUERY
-- =====================================================

-- Verify the migration worked
-- This should return 0 rows if successful
DO $$
DECLARE
  null_summary_count INTEGER;
  null_text_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_summary_count FROM public.todos WHERE summary IS NULL;
  SELECT COUNT(*) INTO null_text_count FROM public.todos WHERE text IS NULL;
  
  RAISE NOTICE 'Migration verification:';
  RAISE NOTICE 'Todos with NULL summary: %', null_summary_count;
  RAISE NOTICE 'Todos with NULL text: %', null_text_count;
  
  IF null_summary_count > 0 THEN
    RAISE WARNING 'Found % todos with NULL summary - migration may need attention', null_summary_count;
  END IF;
END $$; 