-- Add daily_goal column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 20;

-- Ensure existing profiles have the default value
UPDATE profiles SET daily_goal = 20 WHERE daily_goal IS NULL;
