-- Create reports table
CREATE TABLE IF NOT EXISTS sentence_puzzle_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    puzzle_id UUID REFERENCES sentence_puzzles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('invalid_question', 'incorrect_answer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, puzzle_id)
);

-- Add tracking columns to sentence_puzzles
ALTER TABLE sentence_puzzles ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE sentence_puzzles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Trigger function to update report_count and hide question
CREATE OR REPLACE FUNCTION handle_puzzle_report()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment the report count for the specific puzzle
    UPDATE sentence_puzzles
    SET report_count = report_count + 1
    WHERE id = NEW.puzzle_id;

    -- If count >= 50, mark as inactive
    UPDATE sentence_puzzles
    SET is_active = FALSE
    WHERE id = NEW.puzzle_id AND report_count >= 50;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS on_puzzle_report ON sentence_puzzle_reports;
CREATE TRIGGER on_puzzle_report
AFTER INSERT ON sentence_puzzle_reports
FOR EACH ROW
EXECUTE FUNCTION handle_puzzle_report();
