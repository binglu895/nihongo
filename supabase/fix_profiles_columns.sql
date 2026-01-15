-- Consolidated SQL to ensure all user preference columns exist
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_font TEXT DEFAULT 'Outfit',
ADD COLUMN IF NOT EXISTS preferred_color TEXT DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'English';

-- Also ensure updated_at exists just in case
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
