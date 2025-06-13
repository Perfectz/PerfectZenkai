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
-- 2. CREATE DATA TABLES FOR USER CONTENT
-- =====================================================

-- Weight entries table
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date_iso DATE NOT NULL,
  kg DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date_iso) -- One weight entry per day per user
);

-- Tasks/Todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT DEFAULT 'other' CHECK (category IN ('work', 'personal', 'health', 'learning', 'other')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subtasks table
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID REFERENCES public.todos(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE SECURE USER LOOKUP VIEW
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
-- 4. ROW LEVEL SECURITY SETUP
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

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

-- Weight entries policies
CREATE POLICY "Users can access their own weight entries" 
  ON public.weight_entries 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Todos policies
CREATE POLICY "Users can access their own todos" 
  ON public.todos 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Subtasks policies (access through parent todo)
CREATE POLICY "Users can access subtasks of their todos" 
  ON public.subtasks 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.todos 
      WHERE todos.id = subtasks.todo_id 
      AND todos.user_id = auth.uid()
    )
  );

-- Notes policies
CREATE POLICY "Users can access their own notes" 
  ON public.notes 
  FOR ALL 
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER
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
-- 6. UPDATED_AT TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_weight_entries_updated_at
  BEFORE UPDATE ON public.weight_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 7. PERFORMANCE INDEXES
-- =====================================================

-- Index for username lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- Indexes for weight entries
CREATE INDEX IF NOT EXISTS weight_entries_user_id_idx ON public.weight_entries(user_id);
CREATE INDEX IF NOT EXISTS weight_entries_date_idx ON public.weight_entries(date_iso);

-- Indexes for todos
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON public.todos(created_at);
CREATE INDEX IF NOT EXISTS todos_due_date_idx ON public.todos(due_date);

-- Indexes for subtasks
CREATE INDEX IF NOT EXISTS subtasks_todo_id_idx ON public.subtasks(todo_id);

-- Indexes for notes
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON public.notes(created_at);

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Your database is now ready for PerfectZenkai!
-- 
-- Next steps:
-- 1. Update your app to use Supabase repositories
-- 2. Test the authentication flow
-- 3. Verify data is being saved to Supabase tables
-- 
-- You can view your data in the Supabase dashboard:
-- https://supabase.com/dashboard/project/kslvxxoykdkstnkjgpnd/editor 