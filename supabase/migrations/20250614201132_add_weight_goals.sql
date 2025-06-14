-- Weight Goals Migration
-- Add weight goals functionality to PerfectZenkai

-- =====================================================
-- 1. CREATE WEIGHT GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.weight_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_weight DECIMAL(5,2) NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('lose', 'gain', 'maintain')),
  target_date DATE,
  starting_weight DECIMAL(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, is_active) -- Only one active goal per user
);

-- =====================================================
-- 2. ROW LEVEL SECURITY FOR WEIGHT GOALS
-- =====================================================
ALTER TABLE public.weight_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can access their own weight goals" ON public.weight_goals;

-- Weight goals policies
CREATE POLICY "Users can access their own weight goals" 
  ON public.weight_goals 
  FOR ALL 
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. UPDATED_AT TRIGGER FOR WEIGHT GOALS
-- =====================================================
DROP TRIGGER IF EXISTS handle_weight_goals_updated_at ON public.weight_goals;

CREATE TRIGGER handle_weight_goals_updated_at
  BEFORE UPDATE ON public.weight_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 4. PERFORMANCE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS weight_goals_user_id_idx ON public.weight_goals(user_id);
CREATE INDEX IF NOT EXISTS weight_goals_active_idx ON public.weight_goals(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS weight_goals_target_date_idx ON public.weight_goals(target_date);

-- =====================================================
-- 5. HELPFUL FUNCTIONS
-- =====================================================

-- Function to get user's active weight goal
CREATE OR REPLACE FUNCTION public.get_active_weight_goal(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  target_weight DECIMAL(5,2),
  goal_type TEXT,
  target_date DATE,
  starting_weight DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wg.id,
    wg.target_weight,
    wg.goal_type,
    wg.target_date,
    wg.starting_weight,
    wg.created_at
  FROM public.weight_goals wg
  WHERE wg.user_id = user_uuid 
    AND wg.is_active = TRUE
  ORDER BY wg.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deactivate old goals when setting a new one
CREATE OR REPLACE FUNCTION public.set_active_weight_goal()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new active goal, deactivate all other goals for this user
  IF NEW.is_active = TRUE THEN
    UPDATE public.weight_goals 
    SET is_active = FALSE, updated_at = NOW()
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND is_active = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to ensure only one active goal per user
DROP TRIGGER IF EXISTS ensure_single_active_goal ON public.weight_goals;

CREATE TRIGGER ensure_single_active_goal
  BEFORE INSERT OR UPDATE ON public.weight_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_active_weight_goal();
