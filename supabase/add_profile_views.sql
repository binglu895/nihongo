-- Add referral_views column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_views BIGINT DEFAULT 0;

-- Optional: Policy to allow authenticated/public increment via RPC
-- For simplicity, we'll handle increments through the service layer or a simple update policy
CREATE POLICY "Public can increment referral_views" ON profiles 
FOR UPDATE USING (referral_code IS NOT NULL)
WITH CHECK (referral_code IS NOT NULL);
