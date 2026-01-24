-- Make segments and audio_url nullable as we move to data-driven templates
ALTER TABLE sentence_puzzles ALTER COLUMN segments DROP NOT NULL;
ALTER TABLE sentence_puzzles ALTER COLUMN audio_url DROP NOT NULL;
ALTER TABLE sentence_puzzles ALTER COLUMN meaning DROP NOT NULL;
ALTER TABLE sentence_puzzles ALTER COLUMN meaning_zh DROP NOT NULL;

-- Ensure segments has a default if we want to keep it somewhat compatible
ALTER TABLE sentence_puzzles ALTER COLUMN segments SET DEFAULT '{}';
