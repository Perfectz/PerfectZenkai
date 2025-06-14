-- Add martial arts exercises to the exercise library

INSERT INTO exercises (name, type, category, muscle_groups, equipment, is_custom) VALUES
-- Martial Arts exercises
('Boxing Training', 'cardio', 'Martial Arts', ARRAY['arms', 'core', 'legs'], ARRAY['boxing-gloves'], false),
('Kickboxing', 'cardio', 'Martial Arts', ARRAY['full-body'], ARRAY['boxing-gloves'], false),
('Karate Practice', 'sports', 'Martial Arts', ARRAY['full-body'], ARRAY[]::TEXT[], false),
('Taekwondo', 'sports', 'Martial Arts', ARRAY['legs', 'core'], ARRAY[]::TEXT[], false),
('Shadow Boxing', 'cardio', 'Martial Arts', ARRAY['arms', 'core'], ARRAY[]::TEXT[], false);

-- Add a martial arts workout template
INSERT INTO workout_templates (name, description, exercises, estimated_duration, difficulty, tags, is_custom) VALUES
('Martial Arts Combo', 'Complete martial arts training session with strikes and conditioning',
 '[{"exerciseId": "shadow-boxing", "exerciseName": "Shadow Boxing", "duration": 15, "intensity": "moderate"}, {"exerciseId": "boxing-training", "exerciseName": "Boxing Training", "duration": 20, "intensity": "intense"}, {"exerciseId": "stretching", "exerciseName": "Stretching", "duration": 10, "intensity": "light"}]'::jsonb,
 45, 'intense', ARRAY['martial-arts', 'cardio', 'strength'], false);

-- Add comments
COMMENT ON TABLE exercises IS 'Exercise library containing both predefined and custom exercises, including martial arts';
