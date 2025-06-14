-- Create goals system tables for MVP 14

-- Goal categories enum
CREATE TYPE goal_category AS ENUM ('health', 'career', 'learning', 'personal', 'finance', 'relationships', 'other');

-- Goals table - stores user goals
CREATE TABLE goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category goal_category NOT NULL,
    description TEXT,
    target_date DATE,
    color TEXT NOT NULL DEFAULT '#10b981', -- Default green color
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update todos table to add goal_id column for linking todos to goals
ALTER TABLE todos ADD COLUMN goal_id UUID REFERENCES goals(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_is_active ON goals(is_active);
CREATE INDEX idx_goals_target_date ON goals(target_date);
CREATE INDEX idx_todos_goal_id ON todos(goal_id);

-- Create updated_at trigger for goals
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample goals for testing
INSERT INTO goals (title, category, description, target_date, color, is_active) VALUES
('Get Fit & Healthy', 'health', 'Improve overall fitness and maintain a healthy lifestyle', '2025-12-31', '#ef4444', true),
('Learn New Skills', 'learning', 'Continuously learn and develop new professional skills', '2025-06-30', '#3b82f6', true),
('Financial Freedom', 'finance', 'Build emergency fund and improve financial stability', '2025-12-31', '#10b981', true);

-- Add comments for documentation
COMMENT ON TABLE goals IS 'User goals with categories and progress tracking';
COMMENT ON COLUMN goals.color IS 'Hex color code for goal visualization';
COMMENT ON COLUMN goals.target_date IS 'Optional target completion date';
COMMENT ON COLUMN todos.goal_id IS 'Optional reference to associated goal';
