-- Create journal system tables for MVP 16

-- Journal entry types enum
CREATE TYPE journal_entry_type AS ENUM ('morning', 'evening', 'both');

-- Journal entries table - stores daily journal entries
CREATE TABLE journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_date DATE NOT NULL,
    entry_type journal_entry_type NOT NULL,
    morning_entry JSONB,
    evening_entry JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date DESC);
CREATE INDEX idx_journal_entries_type ON journal_entries(entry_type);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);

-- Create updated_at trigger (reusing existing function)
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE journal_entries IS 'Daily journal entries with morning standup and evening reflection data';
COMMENT ON COLUMN journal_entries.entry_date IS 'Date of the journal entry (YYYY-MM-DD)';
COMMENT ON COLUMN journal_entries.morning_entry IS 'JSON object containing morning standup data';
COMMENT ON COLUMN journal_entries.evening_entry IS 'JSON object containing evening reflection data';

-- Insert sample journal entry for testing
INSERT INTO journal_entries (entry_date, entry_type, morning_entry, evening_entry) VALUES
('2025-06-14', 'both', 
 '{"yesterdayAccomplishments": ["Completed workout tracker MVP", "Fixed navigation bugs"], "todayPlans": ["Start journal system", "Review code"], "blockers": [], "mood": 4, "energy": 4, "sleepQuality": 4, "topPriorities": ["Journal MVP", "Database migration", "Component structure"], "timeBlocks": [{"startTime": "09:00", "endTime": "12:00", "activity": "Development", "priority": "high"}], "notes": "Feeling productive and ready to tackle the journal system"}'::jsonb,
 '{"accomplishments": ["Successfully created journal system foundation", "Implemented database migration"], "challenges": ["TypeScript configuration"], "learnings": ["JSONB storage patterns", "Zustand store architecture"], "tomorrowFocus": ["Complete journal components", "Add analytics"], "unfinishedTasks": ["Component testing"], "gratitude": ["Great development progress", "Helpful documentation", "Smooth database setup"], "improvements": ["Better time estimation", "More frequent commits"], "productivity": 4, "stressLevel": 2, "satisfaction": 5, "notes": "Excellent progress on the journal system. Ready for component implementation."}'::jsonb
);
