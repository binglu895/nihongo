-- Add puzzle category to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS puzzle_category TEXT DEFAULT '综合';

-- Update sentence_puzzles table to support template-based rendering
ALTER TABLE sentence_puzzles ADD COLUMN IF NOT EXISTS template TEXT;
ALTER TABLE sentence_puzzles ADD COLUMN IF NOT EXISTS correct_sequence TEXT[];
ALTER TABLE sentence_puzzles ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_sentence_puzzles_category ON sentence_puzzles(category);
