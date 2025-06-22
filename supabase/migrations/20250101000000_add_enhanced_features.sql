-- Enhanced Features Migration - Meal Analysis, AI Insights, and Journal Enhancements
-- This migration adds support for new features developed in the app

-- =====================================================
-- 1. MEAL ANALYSIS TABLES
-- =====================================================

-- Create meal entries table for food tracking
CREATE TABLE IF NOT EXISTS public.meal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    meal_date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    photo_url TEXT,
    analysis_data JSONB, -- Stores AI analysis results
    foods JSONB, -- Array of detected foods with nutritional info
    total_calories INTEGER,
    confidence_score REAL,
    analysis_time_ms INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on meal_entries
ALTER TABLE public.meal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for meal entries
CREATE POLICY "Users can manage their own meal entries" 
    ON public.meal_entries 
    FOR ALL 
    USING (auth.uid() = user_id);

-- Add indexes for meal entries
CREATE INDEX idx_meal_entries_user_date ON public.meal_entries(user_id, meal_date DESC);
CREATE INDEX idx_meal_entries_meal_type ON public.meal_entries(meal_type);
CREATE INDEX idx_meal_entries_created_at ON public.meal_entries(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_meal_entries_updated_at 
    BEFORE UPDATE ON public.meal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. AI INSIGHTS TABLES
-- =====================================================

-- Create AI insights table for storing generated insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('productivity', 'health', 'fitness', 'nutrition', 'general')),
    insight_date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB, -- Additional structured data
    confidence_score REAL,
    data_sources JSONB, -- Which data was used to generate insight
    tags TEXT[],
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ai_insights
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create policy for AI insights
CREATE POLICY "Users can manage their own AI insights" 
    ON public.ai_insights 
    FOR ALL 
    USING (auth.uid() = user_id);

-- Add indexes for AI insights
CREATE INDEX idx_ai_insights_user_date ON public.ai_insights(user_id, insight_date DESC);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(insight_type);
CREATE INDEX idx_ai_insights_read_status ON public.ai_insights(user_id, is_read);
CREATE INDEX idx_ai_insights_tags ON public.ai_insights USING GIN(tags);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_insights_updated_at 
    BEFORE UPDATE ON public.ai_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ENHANCE JOURNAL ENTRIES FOR STANDUP DATA
-- =====================================================

-- Add user_id to journal_entries if not exists (for RLS)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'journal_entries' AND column_name = 'user_id') THEN
        ALTER TABLE public.journal_entries 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing journal entries to have user_id (if any exist without it)
-- In production, you'd want to handle this more carefully
UPDATE public.journal_entries 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL if it isn't already
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'journal_entries' AND column_name = 'user_id' AND is_nullable = 'YES') THEN
        ALTER TABLE public.journal_entries ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Enable RLS on journal_entries if not already enabled
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for journal entries (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'journal_entries' AND policyname = 'Users can manage their own journal entries') THEN
        CREATE POLICY "Users can manage their own journal entries" 
            ON public.journal_entries 
            FOR ALL 
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add index for user_id if not exists
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);

-- =====================================================
-- 4. ANALYTICS AND REPORTING VIEWS
-- =====================================================

-- View for daily productivity metrics
CREATE OR REPLACE VIEW public.daily_productivity_metrics AS
SELECT 
    t.user_id,
    DATE(t.completed_at) as metric_date,
    COUNT(*) as tasks_completed,
    SUM(t.points) as points_earned,
    AVG(t.points) as avg_task_difficulty,
    -- Journal data
    j.morning_entry->>'energyLevel' as morning_energy,
    j.morning_entry->>'mood' as morning_mood,
    j.evening_entry->>'satisfaction' as evening_satisfaction,
    -- Meal data
    COUNT(m.id) as meals_logged,
    SUM(m.total_calories) as total_calories
FROM public.todos t
LEFT JOIN public.journal_entries j ON j.user_id = t.user_id AND j.entry_date = DATE(t.completed_at)
LEFT JOIN public.meal_entries m ON m.user_id = t.user_id AND m.meal_date = DATE(t.completed_at)
WHERE t.done = TRUE AND t.completed_at IS NOT NULL
GROUP BY t.user_id, DATE(t.completed_at), j.morning_entry, j.evening_entry;

-- View for meal analysis summary
CREATE OR REPLACE VIEW public.meal_analysis_summary AS
SELECT 
    user_id,
    meal_date,
    COUNT(*) as total_meals,
    SUM(total_calories) as daily_calories,
    AVG(confidence_score) as avg_confidence,
    ARRAY_AGG(meal_type ORDER BY created_at) as meal_types,
    COUNT(CASE WHEN meal_type = 'breakfast' THEN 1 END) as breakfast_count,
    COUNT(CASE WHEN meal_type = 'lunch' THEN 1 END) as lunch_count,
    COUNT(CASE WHEN meal_type = 'dinner' THEN 1 END) as dinner_count,
    COUNT(CASE WHEN meal_type = 'snack' THEN 1 END) as snack_count
FROM public.meal_entries
GROUP BY user_id, meal_date;

-- Grant access to views
GRANT SELECT ON public.daily_productivity_metrics TO authenticated;
GRANT SELECT ON public.meal_analysis_summary TO authenticated;

-- =====================================================
-- 5. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample meal entry (for testing)
INSERT INTO public.meal_entries (user_id, meal_date, meal_type, foods, total_calories, confidence_score, analysis_time_ms, notes)
SELECT 
    id as user_id,
    CURRENT_DATE as meal_date,
    'lunch' as meal_type,
    '[{"name": "Grilled Chicken Breast", "portion": "6 oz", "calories": 350, "confidence": 0.95}, {"name": "Mixed Vegetables", "portion": "1 cup", "calories": 80, "confidence": 0.88}]'::jsonb as foods,
    430 as total_calories,
    0.92 as confidence_score,
    2500 as analysis_time_ms,
    'Sample meal entry for testing' as notes
FROM auth.users 
WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;

-- Insert sample AI insight (for testing)
INSERT INTO public.ai_insights (user_id, insight_type, insight_date, title, content, confidence_score, data_sources, tags)
SELECT 
    id as user_id,
    'productivity' as insight_type,
    CURRENT_DATE as insight_date,
    'Peak Productivity Hours' as title,
    'Based on your task completion patterns, you are most productive between 10 AM and 12 PM. Consider scheduling your most important tasks during this time window.' as content,
    0.87 as confidence_score,
    '{"todos": 45, "journal_entries": 7, "days_analyzed": 14}'::jsonb as data_sources,
    ARRAY['productivity', 'scheduling', 'optimization'] as tags
FROM auth.users 
WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.meal_entries IS 'Food tracking with AI-powered meal analysis';
COMMENT ON COLUMN public.meal_entries.analysis_data IS 'Raw AI analysis results from GPT-4 Vision';
COMMENT ON COLUMN public.meal_entries.foods IS 'Array of detected foods with nutritional information';
COMMENT ON COLUMN public.meal_entries.confidence_score IS 'Overall confidence of the AI analysis (0-1)';

COMMENT ON TABLE public.ai_insights IS 'AI-generated insights and recommendations for users';
COMMENT ON COLUMN public.ai_insights.data_sources IS 'Metadata about which data was used to generate the insight';
COMMENT ON COLUMN public.ai_insights.metadata IS 'Additional structured data specific to the insight type';

COMMENT ON VIEW public.daily_productivity_metrics IS 'Combined daily metrics from tasks, journal, and meals';
COMMENT ON VIEW public.meal_analysis_summary IS 'Daily summary of meal tracking and analysis'; 