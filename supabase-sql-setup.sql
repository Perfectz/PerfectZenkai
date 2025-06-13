-- supabase-sql-setup.sql
-- Complete database setup for PerfectZenkai authentication system
-- Execute this SQL in the Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/kslvxxoykdkstnkjgpnd/sql

-- =====================================================
-- 1. CREATE PROFILES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on username (prevents duplicates)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_username_key' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- =====================================================
-- 2. CREATE SECURE USER LOOKUP VIEW
-- =====================================================
-- This view allows public username lookups without exposing sensitive data
DROP VIEW IF EXISTS public.user_lookup;
CREATE VIEW public.user_lookup AS
SELECT 
  au.id,
  p.username,
  au.email
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE p.username IS NOT NULL;

-- =====================================================
-- 3. ROW LEVEL SECURITY SETUP
-- =====================================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (handle all possible variations)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public username availability check" ON public.profiles;

-- Profiles table policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow public username availability checks (for registration)
CREATE POLICY "Public username availability check" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- =====================================================
-- 4. AUTOMATIC PROFILE CREATION TRIGGER
-- =====================================================

-- Function to create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. PERFORMANCE INDEXES
-- =====================================================

-- Index for username lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles(LOWER(username));

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_lookup TO anon, authenticated;

-- Grant usage on sequences if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 7. TEST DATA VERIFICATION
-- =====================================================

-- Check if test users exist and create profiles if missing
DO $$
DECLARE
  test_user_1 UUID;
  test_user_2 UUID;
BEGIN
  -- Find test user 1
  SELECT id INTO test_user_1 
  FROM auth.users 
  WHERE email = 'testuser1@perfectzenkai.test';
  
  -- Create profile for test user 1 if user exists but profile doesn't
  IF test_user_1 IS NOT NULL THEN
    INSERT INTO public.profiles (id, username)
    VALUES (test_user_1, 'testuser1')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Find test user 2
  SELECT id INTO test_user_2 
  FROM auth.users 
  WHERE email = 'testuser2@perfectzenkai.test';
  
  -- Create profile for test user 2 if user exists but profile doesn't
  IF test_user_2 IS NOT NULL THEN
    INSERT INTO public.profiles (id, username)
    VALUES (test_user_2, 'testuser2')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Find the perfectz user and create profile if missing
  SELECT id INTO test_user_1 
  FROM auth.users 
  WHERE email = 'pzgambo@gmail.com';
  
  IF test_user_1 IS NOT NULL THEN
    INSERT INTO public.profiles (id, username)
    VALUES (test_user_1, 'perfectz')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Verify the setup
SELECT 'Profiles table exists' as status, count(*) as profile_count FROM public.profiles;
SELECT 'User lookup view works' as status, count(*) as lookup_count FROM public.user_lookup;

-- Show test users
SELECT 'Test users' as status, username, email FROM public.user_lookup WHERE username IN ('testuser1', 'testuser2', 'perfectz'); 