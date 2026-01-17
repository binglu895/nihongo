-- Kanji Progress Table
CREATE TABLE IF NOT EXISTS user_kanji_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  srs_stage INTEGER DEFAULT 0,
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, vocabulary_id)
);

-- Listening Progress Table
CREATE TABLE IF NOT EXISTS user_listening_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE, -- Using vocab for now
  srs_stage INTEGER DEFAULT 0,
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, vocabulary_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_kanji_progress_user ON user_kanji_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_kanji_progress_due ON user_kanji_progress(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_user_listening_progress_user ON user_listening_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_listening_progress_due ON user_listening_progress(user_id, next_review_at);

-- RLS
ALTER TABLE user_kanji_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_listening_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own kanji progress" ON user_kanji_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own listening progress" ON user_listening_progress FOR ALL USING (auth.uid() = user_id);
