-- Fix Weight Goals RLS - Apply more specific security policies to the weight_goals table

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can access their own weight goals" ON public.weight_goals;

-- Create more specific RLS policies for weight_goals
CREATE POLICY "Users can view their own weight goals" 
  ON public.weight_goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight goals" 
  ON public.weight_goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight goals" 
  ON public.weight_goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight goals" 
  ON public.weight_goals FOR DELETE 
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE public.weight_goals IS 'User weight goals with more specific RLS policies enabled';