-- Spaced Repetition System (SRS) Progress Table
CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  srs_stage INTEGER DEFAULT 0, -- 0: New, 1-8: Mastery levels
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 0, -- Interval in days
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, vocabulary_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_user ON user_vocabulary_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_due ON user_vocabulary_progress(user_id, next_review_at);

-- RLS
ALTER TABLE user_vocabulary_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress" ON user_vocabulary_progress
  FOR ALL USING (auth.uid() = user_id);
