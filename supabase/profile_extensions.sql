-- Add profile extension fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS birthday_month INTEGER,
ADD COLUMN IF NOT EXISTS birthday_day INTEGER,
ADD COLUMN IF NOT EXISTS hobbies TEXT,
ADD COLUMN IF NOT EXISTS avatar_id TEXT,
ADD COLUMN IF NOT EXISTS avatar_frame_id TEXT;

-- Add comment explaining the fields
COMMENT ON COLUMN profiles.display_name IS 'User chosen display name';
COMMENT ON COLUMN profiles.birthday_month IS 'Birth month (1-12)';
COMMENT ON COLUMN profiles.birthday_day IS 'Birth day (1-31)';
COMMENT ON COLUMN profiles.hobbies IS 'User hobbies/personal bio';
COMMENT ON COLUMN profiles.avatar_id IS 'Selected avatar spirit ID';
COMMENT ON COLUMN profiles.avatar_frame_id IS 'Selected avatar frame ID (based on level)';
