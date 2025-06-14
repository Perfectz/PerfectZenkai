-- Create workout tracker tables for MVP 15

-- Exercise types enum
CREATE TYPE exercise_type AS ENUM ('cardio', 'strength', 'flexibility', 'sports', 'other');

-- Intensity levels enum  
CREATE TYPE intensity_level AS ENUM ('light', 'moderate', 'intense');

-- Workout goal types enum
CREATE TYPE workout_goal_type AS ENUM ('duration', 'frequency', 'calories', 'streak');

-- Workout goal periods enum
CREATE TYPE workout_goal_period AS ENUM ('daily', 'weekly', 'monthly');

-- Exercises table - stores exercise library and custom exercises
CREATE TABLE exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type exercise_type NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    muscle_groups TEXT[], -- Array of muscle groups
    equipment TEXT[], -- Array of equipment needed
    is_custom BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout entries table - stores individual workout sessions
CREATE TABLE workout_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exercise_id TEXT NOT NULL, -- Can be UUID or 'custom'
    exercise_name TEXT NOT NULL,
    exercise_type exercise_type NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    intensity intensity_level NOT NULL,
    calories INTEGER,
    notes TEXT,
    sets INTEGER, -- for strength training
    reps INTEGER, -- for strength training
    weight DECIMAL(5,2), -- in kg for strength training
    distance DECIMAL(6,2), -- in km for cardio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout templates table - stores reusable workout routines
CREATE TABLE workout_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    exercises JSONB NOT NULL, -- Array of exercise objects with details
    estimated_duration INTEGER NOT NULL, -- in minutes
    difficulty intensity_level NOT NULL,
    tags TEXT[], -- Array of tags
    is_custom BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout goals table - stores fitness goals
CREATE TABLE workout_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type workout_goal_type NOT NULL,
    target INTEGER NOT NULL,
    period workout_goal_period NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_exercises_type ON exercises(type);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_is_custom ON exercises(is_custom);

CREATE INDEX idx_workout_entries_exercise_type ON workout_entries(exercise_type);
CREATE INDEX idx_workout_entries_created_at ON workout_entries(created_at);
CREATE INDEX idx_workout_entries_intensity ON workout_entries(intensity);

CREATE INDEX idx_workout_templates_difficulty ON workout_templates(difficulty);
CREATE INDEX idx_workout_templates_is_custom ON workout_templates(is_custom);

CREATE INDEX idx_workout_goals_type ON workout_goals(type);
CREATE INDEX idx_workout_goals_is_active ON workout_goals(is_active);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_entries_updated_at BEFORE UPDATE ON workout_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON workout_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_goals_updated_at BEFORE UPDATE ON workout_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default exercise library
INSERT INTO exercises (name, type, category, muscle_groups, equipment, is_custom) VALUES
-- Cardio exercises
('Running', 'cardio', 'Running', ARRAY['legs', 'core'], ARRAY[]::TEXT[], false),
('Walking', 'cardio', 'Walking', ARRAY['legs'], ARRAY[]::TEXT[], false),
('Cycling', 'cardio', 'Cycling', ARRAY['legs', 'core'], ARRAY['bike'], false),
('Swimming', 'cardio', 'Swimming', ARRAY['full-body'], ARRAY['pool'], false),
('Jump Rope', 'cardio', 'HIIT', ARRAY['legs', 'arms', 'core'], ARRAY['jump-rope'], false),

-- Strength exercises
('Push-ups', 'strength', 'Bodyweight', ARRAY['chest', 'arms', 'core'], ARRAY[]::TEXT[], false),
('Pull-ups', 'strength', 'Bodyweight', ARRAY['back', 'arms'], ARRAY['pull-up-bar'], false),
('Squats', 'strength', 'Bodyweight', ARRAY['legs', 'glutes'], ARRAY[]::TEXT[], false),
('Deadlifts', 'strength', 'Weightlifting', ARRAY['back', 'legs', 'core'], ARRAY['barbell'], false),
('Bench Press', 'strength', 'Weightlifting', ARRAY['chest', 'arms'], ARRAY['barbell', 'bench'], false),

-- Flexibility exercises
('Yoga', 'flexibility', 'Yoga', ARRAY['full-body'], ARRAY['yoga-mat'], false),
('Stretching', 'flexibility', 'Stretching', ARRAY['full-body'], ARRAY[]::TEXT[], false),
('Pilates', 'flexibility', 'Pilates', ARRAY['core', 'full-body'], ARRAY['yoga-mat'], false),

-- Sports exercises
('Basketball', 'sports', 'Team Sports', ARRAY['legs', 'core'], ARRAY['basketball'], false),
('Tennis', 'sports', 'Racquet Sports', ARRAY['arms', 'legs', 'core'], ARRAY['tennis-racquet'], false),
('Soccer', 'sports', 'Team Sports', ARRAY['legs', 'core'], ARRAY['soccer-ball'], false);

-- Insert default workout goal (WHO recommendation)
INSERT INTO workout_goals (type, target, period, description, is_active) VALUES
('duration', 150, 'weekly', 'WHO recommended 150 minutes of moderate exercise per week', true);

-- Insert sample workout templates
INSERT INTO workout_templates (name, description, exercises, estimated_duration, difficulty, tags, is_custom) VALUES
('Quick Cardio', 'Fast 20-minute cardio session', 
 '[{"exerciseId": "running", "exerciseName": "Running", "duration": 20, "intensity": "moderate"}]'::jsonb,
 20, 'moderate', ARRAY['cardio', 'quick'], false),

('Strength Basics', 'Basic strength training routine',
 '[{"exerciseId": "push-ups", "exerciseName": "Push-ups", "duration": 10, "intensity": "moderate", "sets": 3, "reps": 12}, {"exerciseId": "squats", "exerciseName": "Squats", "duration": 10, "intensity": "moderate", "sets": 3, "reps": 15}]'::jsonb,
 30, 'moderate', ARRAY['strength', 'bodyweight'], false),

('Flexibility Flow', 'Relaxing flexibility and mobility session',
 '[{"exerciseId": "yoga", "exerciseName": "Yoga", "duration": 30, "intensity": "light"}, {"exerciseId": "stretching", "exerciseName": "Stretching", "duration": 15, "intensity": "light"}]'::jsonb,
 45, 'light', ARRAY['flexibility', 'recovery'], false);

-- Add RLS (Row Level Security) policies if needed
-- For now, we'll keep it simple without RLS since this is a personal app

-- Add comments for documentation
COMMENT ON TABLE exercises IS 'Exercise library containing both predefined and custom exercises';
COMMENT ON TABLE workout_entries IS 'Individual workout session records';
COMMENT ON TABLE workout_templates IS 'Reusable workout routine templates';
COMMENT ON TABLE workout_goals IS 'Fitness goals and targets';

COMMENT ON COLUMN exercises.muscle_groups IS 'Array of muscle groups targeted by this exercise';
COMMENT ON COLUMN exercises.equipment IS 'Array of equipment needed for this exercise';
COMMENT ON COLUMN workout_entries.exercise_id IS 'Reference to exercise ID or "custom" for custom exercises';
COMMENT ON COLUMN workout_entries.duration IS 'Workout duration in minutes';
COMMENT ON COLUMN workout_entries.weight IS 'Weight used in kg (for strength training)';
COMMENT ON COLUMN workout_entries.distance IS 'Distance covered in km (for cardio)';
COMMENT ON COLUMN workout_templates.exercises IS 'JSON array of exercise objects with sets, reps, duration, etc.';
COMMENT ON COLUMN workout_templates.estimated_duration IS 'Estimated total duration in minutes';
COMMENT ON COLUMN workout_goals.target IS 'Target value (minutes, count, calories, days depending on type)';
