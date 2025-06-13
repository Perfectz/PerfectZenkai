-- supabase-sql-quick-fix.sql
-- Quick fix for authentication issues
-- Execute this if you're getting policy errors with the main script

-- =====================================================
-- 1. CREATE USER LOOKUP VIEW (SAFE)
-- =====================================================
-- Drop and recreate the view safely
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
-- 2. GRANT PERMISSIONS ON VIEW
-- =====================================================
GRANT SELECT ON public.user_lookup TO anon, authenticated;

-- =====================================================
-- 3. ADD PUBLIC SELECT POLICY (SAFE)
-- =====================================================
-- Only add the public username check policy if it doesn't exist
DO $$
BEGIN
  -- Check if the policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Public username availability check'
  ) THEN
    CREATE POLICY "Public username availability check" 
      ON public.profiles 
      FOR SELECT 
      USING (true);
  END IF;
END $$;

-- =====================================================
-- 4. CREATE MISSING PROFILES FOR EXISTING USERS
-- =====================================================
-- Create profiles for users who don't have them
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through auth users who don't have profiles
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Create profile with username from metadata or generate one
    INSERT INTO public.profiles (id, username)
    VALUES (
      user_record.id,
      COALESCE(
        user_record.raw_user_meta_data->>'username',
        'user_' || substr(user_record.id::text, 1, 8)
      )
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- 5. VERIFICATION
-- =====================================================
-- Show results
SELECT 'User lookup view created' as status, count(*) as count FROM public.user_lookup;
SELECT 'Profiles with usernames' as status, count(*) as count FROM public.profiles WHERE username IS NOT NULL; 