-- Fix Goals RLS - Apply security policies to the goals table

-- Enable RLS on goals table
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Add user_id column to goals table if it doesn't exist
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
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;

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

-- Add indexes for the new user_id columns
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);

-- Add helpful comments
COMMENT ON TABLE public.goals IS 'User goals with RLS enabled - users can only access their own goals';