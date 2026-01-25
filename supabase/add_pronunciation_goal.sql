-- Add daily_pronunciation_goal to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_pronunciation_goal INTEGER DEFAULT 10;
