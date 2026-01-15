-- Create vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL, -- N1, N2, N3, N4, N5
  word TEXT NOT NULL,
  reading TEXT NOT NULL,
  meaning TEXT NOT NULL,
  sentence TEXT NOT NULL,
  sentence_translation TEXT NOT NULL,
  distractors TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

-- Allow public read access (or authenticated only if preferred)
CREATE POLICY "Public can view vocabulary" ON vocabulary
  FOR SELECT USING (true);

-- Seed Data
INSERT INTO vocabulary (level, word, reading, meaning, sentence, sentence_translation, distractors) VALUES
-- N5
('N5', '学生', 'がくせい', 'student', '私は（　　）です。', 'I am a student.', ARRAY['先生', '学校', '子供']),
('N5', '食べる', 'たべる', 'to eat', 'りんごを（　　）。', 'I eat an apple.', ARRAY['飲む', '見る', '聞く']),
('N5', '今日', 'きょう', 'today', '（　　）はいい天気です。', 'Today is nice weather.', ARRAY['昨日', '明日', '毎日']),
-- N4
('N4', '試験', 'しけん', 'exam', '来週、大きな（　　）があります。', 'There is a big exam next week.', ARRAY['練習', '授業', '宿題']),
('N4', '便利', 'べんり', 'convenient', 'この道具はとても（　　）です。', 'This tool is very convenient.', ARRAY['不快', '重い', '高い']),
('N4', '理由', 'りゆう', 'reason', '学校を休んだ（　　）を教えてください。', 'Please tell me the reason you were absent from school.', ARRAY['意味', '意見', '結果']),
-- N3
('N3', '要約', 'ようやく', 'summarize', '昨日の会議の内容を（　　）してください。', 'Please summarize the content of yesterday''s meeting.', ARRAY['ようす', 'ようりょう', 'ようやく(finally)']),
('N3', '看板', 'かんばん', 'signboard', '道に（　　）が立っています。', 'A sign is standing by the road.', ARRAY['窓', 'ドア', '柱']),
('N3', '技術', 'ぎじゅつ', 'technology / skill', '日本の科学（　　）は素晴らしいです。', 'Japan''s scientific technology is wonderful.', ARRAY['芸術', '方法', '目標']),
-- N2
('N2', '貴重', 'きちょう', 'precious / valuable', 'それはとても（　　）な体験でした。', 'That was a very precious experience.', ARRAY['気楽', '清潔', '高級']),
('N2', '納得', 'なっとく', 'satisfaction / agreement', '彼の説明に（　　）しました。', 'I was convinced by his explanation.', ARRAY['理解', '安心', '満足']),
('N2', '環境', 'かんきょう', 'environment', '（　　）を守ることが大切です。', 'It is important to protect the environment.', ARRAY['社会', '世界', '自然']),
-- N1
('N1', '把握', 'はあく', 'grasp / understand', '現状を正確に（　　）する必要があります。', 'We need to accurately grasp the current situation.', ARRAY['意識', '確認', '認識']),
('N1', '謙虚', 'けんきょ', 'humble', '彼は非常に（　　）な人です。', 'He is a very humble person.', ARRAY['素直', '真面目', '静か']),
('N1', '矛盾', 'むじゅん', 'contradiction', '彼の話には（　　）がある。', 'There is a contradiction in his story.', ARRAY['間違い', '問題', '変化']);
