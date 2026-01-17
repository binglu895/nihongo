-- Add daily_grammar_goal to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_grammar_goal INTEGER DEFAULT 10;
