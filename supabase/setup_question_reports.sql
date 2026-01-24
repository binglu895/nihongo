-- Add report_count column to content tables
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE listening_questions ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE grammar_examples ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
ALTER TABLE sentence_puzzles ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- Create system_config table for thresholds
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set default threshold
INSERT INTO system_config (key, value)
VALUES ('report_hide_threshold', '50'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create question_reports table for per-user tracking
CREATE TABLE IF NOT EXISTS question_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'vocabulary', 'listening', 'grammar', 'puzzle'
    item_id UUID NOT NULL,
    reason_type TEXT, -- 'wrong_question', 'wrong_answer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read for system_config" ON system_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own reports" ON question_reports FOR ALL USING (auth.uid() = user_id);

-- RPC Function for atomic reporting
CREATE OR REPLACE FUNCTION report_item(p_item_type TEXT, p_item_id UUID, p_reason_type TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_exists BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Check if already reported
    SELECT EXISTS (
        SELECT 1 FROM question_reports 
        WHERE user_id = v_user_id AND item_type = p_item_type AND item_id = p_item_id
    ) INTO v_exists;

    IF v_exists THEN
        RETURN jsonb_build_object('success', false, 'error', 'Already reported');
    END IF;

    -- Record the report
    INSERT INTO question_reports (user_id, item_type, item_id, reason_type)
    VALUES (v_user_id, p_item_type, p_item_id, p_reason_type);

    -- Increment report_count in respective table
    IF p_item_type = 'vocabulary' THEN
        UPDATE vocabulary SET report_count = report_count + 1 WHERE id = p_item_id;
    ELSIF p_item_type = 'listening' THEN
        UPDATE listening_questions SET report_count = report_count + 1 WHERE id = p_item_id;
    ELSIF p_item_type = 'grammar' THEN
        UPDATE grammar_examples SET report_count = report_count + 1 WHERE id = p_item_id;
    ELSIF p_item_type = 'puzzle' THEN
        UPDATE sentence_puzzles SET report_count = report_count + 1 WHERE id = p_item_id;
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
