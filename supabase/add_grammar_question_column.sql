
-- Add question_sentence column to grammar_examples
ALTER TABLE grammar_examples ADD COLUMN IF NOT EXISTS question_sentence TEXT;

-- Comment: You can now populate this column using the provided script or manually.
