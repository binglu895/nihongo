-- Create user_listening_progress table for SRS
CREATE TABLE IF NOT EXISTS user_listening_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listening_question_id UUID REFERENCES listening_questions(id) ON DELETE CASCADE,
  srs_stage INTEGER DEFAULT 0,
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, listening_question_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_listening_progress_user ON user_listening_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_listening_progress_due ON user_listening_progress(user_id, next_review_at);

-- RLS
ALTER TABLE user_listening_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own listening progress" ON user_listening_progress;
CREATE POLICY "Users can manage their own listening progress" ON user_listening_progress FOR ALL USING (auth.uid() = user_id);
