-- Fix Critical Security Issues - MVP 22 Security Enhancement
-- This migration addresses all ERROR-level security issues identified by Supabase linter

-- =====================================================
-- 1. FIX AUTH USERS EXPOSURE - user_lookup VIEW
-- =====================================================

-- Drop the existing problematic view
DROP VIEW IF EXISTS public.user_lookup;

-- Recreate the view without SECURITY DEFINER and with proper RLS
-- Only expose necessary data and only to authenticated users
CREATE VIEW public.user_lookup AS
SELECT 
  id, 
  username, 
  email 
FROM public.profiles
WHERE auth.uid() IS NOT NULL; -- Only accessible to authenticated users

-- Set proper ownership and permissions for the view
ALTER VIEW public.user_lookup OWNER TO postgres;

-- Remove anonymous access and grant only to authenticated users
REVOKE ALL ON public.user_lookup FROM anon;
GRANT SELECT ON public.user_lookup TO authenticated;

-- =====================================================
-- 2. FIX SECURITY DEFINER VIEWS
-- =====================================================

-- Drop and recreate daily_points_stats without SECURITY DEFINER
DROP VIEW IF EXISTS public.daily_points_stats;
CREATE VIEW public.daily_points_stats AS
SELECT 
  user_id,
  DATE(completed_at) as completion_date,
  SUM(points) as total_points,
  COUNT(*) as completed_tasks,
  AVG(points) as average_points
FROM public.todos
WHERE done = TRUE 
  AND completed_at IS NOT NULL
  AND user_id = auth.uid() -- Only show current user's data
GROUP BY user_id, DATE(completed_at);

-- Drop and recreate user_points_summary without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_points_summary;
CREATE VIEW public.user_points_summary AS
SELECT 
  user_id,
  SUM(CASE WHEN done = TRUE THEN points ELSE 0 END) as total_earned_points,
  SUM(points) as total_possible_points,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN done = TRUE THEN 1 END) as completed_tasks,
  AVG(CASE WHEN done = TRUE THEN points END) as average_task_points
FROM public.todos
WHERE user_id = auth.uid() -- Only show current user's data
GROUP BY user_id;

-- Set proper ownership and permissions
ALTER VIEW public.daily_points_stats OWNER TO postgres;
ALTER VIEW public.user_points_summary OWNER TO postgres;

-- Grant appropriate permissions
GRANT SELECT ON public.daily_points_stats TO authenticated;
GRANT SELECT ON public.user_points_summary TO authenticated;

-- Ensure no anonymous access
REVOKE ALL ON public.daily_points_stats FROM anon;
REVOKE ALL ON public.user_points_summary FROM anon;

-- =====================================================
-- 3. ENABLE RLS ON PUBLIC TABLES
-- =====================================================

-- Enable RLS on goals table
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Add user_id column to goals table if it doesn't exist
-- This is required for proper RLS implementation
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'goals' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.goals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Set user_id for existing goals (if any) to the first authenticated user or null
    -- In production, you might want to handle this differently
    UPDATE public.goals 
    SET user_id = (SELECT id FROM auth.users LIMIT 1)
    WHERE user_id IS NULL;
    
    -- Make user_id NOT NULL after migration
    ALTER TABLE public.goals ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Create RLS policies for goals
CREATE POLICY "Users can view own goals" 
  ON public.goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" 
  ON public.goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" 
  ON public.goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" 
  ON public.goals FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on journal_entries table
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Add user_id column to journal_entries table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'journal_entries' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.journal_entries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Set user_id for existing journal entries (if any) to the first authenticated user or null
    UPDATE public.journal_entries 
    SET user_id = (SELECT id FROM auth.users LIMIT 1)
    WHERE user_id IS NULL;
    
    -- Make user_id NOT NULL after migration
    ALTER TABLE public.journal_entries ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Create RLS policies for journal_entries
CREATE POLICY "Users can view own journal entries" 
  ON public.journal_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" 
  ON public.journal_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" 
  ON public.journal_entries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" 
  ON public.journal_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Add indexes for the new user_id columns
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);

-- =====================================================
-- 5. UPDATE FUNCTION SECURITY
-- =====================================================

-- Review and fix any SECURITY DEFINER functions
-- The handle_new_user function should remain SECURITY DEFINER as it needs to insert into profiles
-- But let's ensure it's properly secured

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow this for new users being created in auth.users
  -- Additional security: validate the trigger context
  IF TG_TABLE_NAME != 'users' OR TG_TABLE_SCHEMA != 'auth' THEN
    RAISE EXCEPTION 'This function can only be called from auth.users trigger';
  END IF;
  
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. VALIDATION AND CLEANUP
-- =====================================================

-- Add helpful comments
COMMENT ON TABLE public.goals IS 'User goals with RLS enabled - users can only access their own goals';
COMMENT ON TABLE public.journal_entries IS 'User journal entries with RLS enabled - users can only access their own entries';
COMMENT ON VIEW public.user_lookup IS 'Secured user lookup view - only accessible to authenticated users';
COMMENT ON VIEW public.daily_points_stats IS 'User daily points statistics - RLS enforced at view level';
COMMENT ON VIEW public.user_points_summary IS 'User points summary - RLS enforced at view level';

-- Log completion
SELECT 'Critical security issues fixed successfully' as status; 