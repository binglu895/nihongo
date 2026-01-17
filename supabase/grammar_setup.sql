-- Create grammar_points table
CREATE TABLE IF NOT EXISTS grammar_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL, -- e.g., 'N5'
  title TEXT NOT NULL, -- e.g., '～なければならない'
  reading TEXT, -- e.g., 'nakereba naranai'
  meaning TEXT NOT NULL, -- e.g., 'must...'
  usage TEXT, -- e.g., '动词ない形（去い）+ なければならない'
  category TEXT, -- e.g., 'Obligation'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create grammar_examples table
CREATE TABLE IF NOT EXISTS grammar_examples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grammar_point_id UUID REFERENCES grammar_points(id) ON DELETE CASCADE,
  sentence TEXT NOT NULL,
  reading TEXT,
  translation TEXT,
  translation_zh TEXT,
  difficulty INTEGER DEFAULT 1, -- 1: Simple, 2: Medium, 3: Complex
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create user_grammar_progress table for SRS
CREATE TABLE IF NOT EXISTS user_grammar_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  grammar_point_id UUID REFERENCES grammar_points(id) ON DELETE CASCADE,
  srs_stage INTEGER DEFAULT 0,
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, grammar_point_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_grammar_progress_user ON user_grammar_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_grammar_progress_due ON user_grammar_progress(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_grammar_examples_point ON grammar_examples(grammar_point_id);

-- RLS
ALTER TABLE grammar_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_grammar_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for grammar_points" ON grammar_points FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read for grammar_examples" ON grammar_examples FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own grammar progress" ON user_grammar_progress FOR ALL USING (auth.uid() = user_id);

-- Seeding core 32 grammar points (initial skeleton)
INSERT INTO grammar_points (level, title, reading, meaning, usage, category) VALUES
('N5', 'は/が', 'wa/ga', 'Topic/Subject markers', 'Noun + は/が', 'Basic Particles'),
('N5', 'の', 'no', 'Possessive marker', 'Noun1 + の + Noun2', 'Basic Particles'),
('N5', 'を', 'o', 'Object marker', 'Noun + を + Verb', 'Basic Particles'),
('N5', 'に/へ', 'ni/e', 'Direction/Time/Target', 'Noun + に/へ', 'Basic Particles'),
('N5', 'で', 'de', 'Location/Tool/Reason', 'Noun + で', 'Basic Particles'),
('N5', 'も', 'mo', 'Also/Too', 'Noun + も', 'Basic Particles'),
('N5', 'と/や', 'to/ya', 'And (exhaustive/non-exhaustive)', 'Noun1 + と/や + Noun2', 'Basic Particles'),
('N5', 'あります/います', 'arimasu/imasu', 'Existence (inanimate/animate)', 'Place + に + Object + が + あります/います', 'Existence/Desire'),
('N5', '～がほしい', 'ga hoshii', 'To want something', 'Noun + が + ほしい', 'Existence/Desire'),
('N5', '～たいです', 'tai desu', 'To want to do something', 'Verb (stem) + たいです', 'Existence/Desire'),
('N5', '～てください', 'te kudasai', 'Please do...', 'Verb (te-form) + ください', 'Request/Prohibition'),
('N5', '～ないでください', 'naide kudasai', 'Please don’t...', 'Verb (nai-form) + でください', 'Request/Prohibition'),
('N5', '～てもいいです', 'te mo ii desu', 'May I... / You may...', 'Verb (te-form) + もいいです', 'Request/Prohibition'),
('N5', '～てはいけません', 'te wa ikemasen', 'Must not...', 'Verb (te-form) + はいけません', 'Request/Prohibition'),
('N5', '～なければならない', 'nakereba naranai', 'Must...', 'Verb (nai-form - i) + ければならない', 'Obligation'),
('N5', '～なくてもいい', 'nakute mo ii', 'Don’t have to...', 'Verb (nai-form - i) + くて背景もいい', 'Obligation'),
('N5', '～ている', 'te iru', 'State/Progressive', 'Verb (te-form) + いる', 'Tense/State'),
('N5', '～てから', 'te kara', 'Since/After doing...', 'Verb (te-form) + から', 'Tense/State'),
('N5', '～たことがある', 'ta koto ga aru', 'Have done before (experience)', 'Verb (ta-form) + ことがある', 'Tense/State'),
('N5', '～ましょう(か)', 'mashou (ka)', 'Let’s... / Shall we...?', 'Verb (stem) + ましょう(か)', 'Plan/Suggestion'),
('N5', '～つもりです', 'tsumori desu', 'Plan/Intention', 'Verb (dictionary/nai form) + つもりです', 'Plan/Suggestion'),
('N5', '～から/～ので', 'kara/node', 'Because/Reason', 'Sentence + から/ので', 'Reason/Time'),
('N5', '～とき', 'toki', 'When...', 'Verb/Adjective/Noun + とき', 'Reason/Time'),
('N5', '～前に', 'mae ni', 'Before...', 'Verb (dictionary) + 前に / Noun + の + 前に', 'Reason/Time'),
('N5', '～より～ほうが', 'yori... hou ga', 'Comparing two things', 'A + より + B + のほうが + Adjective', 'Comparison'),
('N5', '一番', 'ichiban', 'Number one / Most', '一番 + Adjective', 'Comparison'),
('N5', '～すぎます', 'sugimasu', 'Too much...', 'Verb (stem) / Adj (stem) + すぎます', 'Comparison'),
('N5', '～になります', 'ni narimasu', 'To become...', 'Noun + に / Adj (i -> ku) + なります / Adj (na) + に + なります', 'Change/Method'),
('N5', '～方(かた)', 'kata', 'Way of doing...', 'Verb (stem) + 方', 'Change/Method'),
('N5', '～でしょう/だろう', 'deshou/darou', 'Probably / Right?', 'Sentence + でしょう/だろう', 'Tone'),
('N5', '～ね/～よ', 'ne/yo', 'Sentence-ending particles', 'Sentence + ね/よ', 'Tone');
