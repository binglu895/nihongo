-- Create listening_questions table
CREATE TABLE IF NOT EXISTS listening_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sentence TEXT NOT NULL,
  reading TEXT,
  translation TEXT,
  translation_zh TEXT,
  audio_url TEXT, -- Path to the audio file in Supabase Storage or local public path
  distractors TEXT[], -- Array of similar sentences
  difficulty INTEGER DEFAULT 1, -- 1: Simple, 2: Medium, 3: Complex
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE listening_questions ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public read for listening_questions" ON listening_questions;
CREATE POLICY "Public read for listening_questions" ON listening_questions FOR SELECT TO authenticated USING (true);
