-- Update profiles table for improved activity and streak tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_study_time BIGINT DEFAULT 0, -- in seconds
ADD COLUMN IF NOT EXISTS daily_study_time JSONB DEFAULT '{}'; -- { "2024-01-18": 1200 } for categorical deltas
