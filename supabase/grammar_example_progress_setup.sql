-- Create user_grammar_example_progress table for per-example SRS
CREATE TABLE IF NOT EXISTS user_grammar_example_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  grammar_example_id UUID REFERENCES grammar_examples(id) ON DELETE CASCADE,
  srs_stage INTEGER DEFAULT 0,
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, grammar_example_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_grammar_example_progress_user ON user_grammar_example_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_grammar_example_progress_due ON user_grammar_example_progress(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_user_grammar_example_progress_example ON user_grammar_example_progress(grammar_example_id);

-- RLS
ALTER TABLE user_grammar_example_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own grammar example progress" 
ON user_grammar_example_progress FOR ALL USING (auth.uid() = user_id);
