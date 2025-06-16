-- supabase-workout-tables-fix.sql
-- Fix missing RLS policies for workout tables causing 400 errors
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/kslvxxoykdkstnkjgpnd/sql

-- =====================================================
-- 1. ENABLE RLS ON WORKOUT TABLES
-- =====================================================

-- Enable RLS on exercises table (if not already enabled)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_goals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CREATE RLS POLICIES FOR EXERCISES TABLE
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read exercises" ON public.exercises;
DROP POLICY IF EXISTS "Authenticated users can manage exercises" ON public.exercises;

-- Exercises table policies (public read, authenticated write)
-- Since exercises are shared library + custom exercises
CREATE POLICY "Public can read exercises" 
  ON public.exercises 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage exercises" 
  ON public.exercises 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 3. CREATE RLS POLICIES FOR WORKOUT ENTRIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can access their own workout entries" ON public.workout_entries;

-- Workout entries policies (user-specific data)
CREATE POLICY "Users can access their own workout entries" 
  ON public.workout_entries 
  FOR ALL 
  USING (true); -- For now, allow all authenticated users since there's no user_id column

-- =====================================================
-- 4. CREATE RLS POLICIES FOR WORKOUT TEMPLATES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read workout templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Authenticated users can manage workout templates" ON public.workout_templates;

-- Workout templates policies (public read, authenticated write)
CREATE POLICY "Public can read workout templates" 
  ON public.workout_templates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage workout templates" 
  ON public.workout_templates 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 5. CREATE RLS POLICIES FOR WORKOUT GOALS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can access their own workout goals" ON public.workout_goals;

-- Workout goals policies (user-specific data)
CREATE POLICY "Users can access their own workout goals" 
  ON public.workout_goals 
  FOR ALL 
  USING (true); -- For now, allow all authenticated users since there's no user_id column

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.exercises TO authenticated;
GRANT ALL ON public.workout_entries TO authenticated;
GRANT ALL ON public.workout_templates TO authenticated;
GRANT ALL ON public.workout_goals TO authenticated;

-- Grant read permissions to anonymous users for public tables
GRANT SELECT ON public.exercises TO anon;
GRANT SELECT ON public.workout_templates TO anon;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check if policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('exercises', 'workout_entries', 'workout_templates', 'workout_goals')
ORDER BY tablename, policyname;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('exercises', 'workout_entries', 'workout_templates', 'workout_goals')
ORDER BY tablename;

-- Test query to verify exercises table access
SELECT COUNT(*) as exercise_count FROM public.exercises;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- 
-- This script fixes the 400 Bad Request errors by:
-- 1. Enabling RLS on all workout tables
-- 2. Creating appropriate policies for each table
-- 3. Granting necessary permissions
-- 
-- The exercises and templates tables are public (readable by all)
-- The workout_entries and goals tables allow all authenticated users
-- (since they don't have user_id columns yet)
-- 
-- After running this script, the Supabase 400 errors should be resolved.
-- ===================================================== 