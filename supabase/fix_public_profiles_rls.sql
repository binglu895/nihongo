-- Allow public read access to basic profile info for the public profile page
-- This fixes the 404 issue when sharing links with non-logged in users
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING ( true );

-- Note: In a production app, you might want to restrict columns, 
-- but since we're using .select('stats...') in our code, this is simple.
-- Alternatively, if you want to be stricter:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public profiles are viewable by referral code" 
-- ON profiles FOR SELECT 
-- USING (referral_code IS NOT NULL);
