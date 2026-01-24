-- 1. Create pronunciation_questions table
CREATE TABLE IF NOT EXISTS pronunciation_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sentence TEXT NOT NULL,
    reading TEXT,
    translation TEXT,
    translation_zh TEXT,
    audio_url TEXT,
    difficulty INTEGER DEFAULT 1,
    report_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for pronunciation_questions
ALTER TABLE pronunciation_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read for pronunciation_questions" ON pronunciation_questions;
CREATE POLICY "Public read for pronunciation_questions" ON pronunciation_questions FOR SELECT TO authenticated USING (is_active = TRUE);

-- 2. Create user_pronunciation_progress table (SRS)
CREATE TABLE IF NOT EXISTS user_pronunciation_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES pronunciation_questions(id) ON DELETE CASCADE,
    srs_stage INTEGER DEFAULT 0,
    ease_factor FLOAT DEFAULT 2.5,
    interval INTEGER DEFAULT 0,
    next_review_at TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Enable RLS for user_pronunciation_progress
ALTER TABLE user_pronunciation_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own pronunciation progress" ON user_pronunciation_progress;
CREATE POLICY "Users can manage their own pronunciation progress" ON user_pronunciation_progress FOR ALL USING (auth.uid() = user_id);

-- 3. Create pronunciation_question_reports table
CREATE TABLE IF NOT EXISTS pronunciation_question_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES pronunciation_questions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('invalid_question', 'incorrect_answer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Enable RLS for reports
ALTER TABLE pronunciation_question_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create their own pronunciation reports" ON pronunciation_question_reports;
CREATE POLICY "Users can create their own pronunciation reports" ON pronunciation_question_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. Trigger to handle auto-hiding questions
CREATE OR REPLACE FUNCTION handle_pronunciation_report()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pronunciation_questions
    SET report_count = report_count + 1
    WHERE id = NEW.question_id;

    UPDATE pronunciation_questions
    SET is_active = FALSE
    WHERE id = NEW.question_id AND report_count >= 50;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_pronunciation_report ON pronunciation_question_reports;
CREATE TRIGGER on_pronunciation_report
AFTER INSERT ON pronunciation_question_reports
FOR EACH ROW
EXECUTE FUNCTION handle_pronunciation_report();

-- 5. Seed data from listening_questions (Initial migration)
INSERT INTO pronunciation_questions (sentence, reading, translation, translation_zh, audio_url, difficulty)
SELECT sentence, reading, translation, translation_zh, audio_url, difficulty
FROM listening_questions
ON CONFLICT DO NOTHING;
