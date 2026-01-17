-- Add gamification columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp BIGINT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS unlocked_skins TEXT[] DEFAULT ARRAY['default'];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);

-- Function to generate a unique random referral code
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TEXT AS $$
DECLARE
  code TEXT;
  done BOOL DEFAULT FALSE;
BEGIN
  WHILE NOT done LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    BEGIN
      UPDATE profiles SET referral_code = code WHERE referral_code IS NULL AND id = auth.uid();
      done := TRUE;
    EXCEPTION WHEN unique_violation THEN
      -- try again
    END;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Table for tracking referrals
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id),
  referred_id UUID REFERENCES profiles(id) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending' -- pending, joined, active
);

-- Enable RLS
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON user_referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- XP gain trigger or function logic can be added later
