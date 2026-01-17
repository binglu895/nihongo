-- Examples for は/が
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '私は学生です。', 'Watashi wa gakusei desu.', 'I am a student.', '我是学生。', 1 FROM grammar_points WHERE title = 'は/が' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, 'これはペンです。', 'Kore wa pen desu.', 'This is a pen.', '这是钢笔。', 1 FROM grammar_points WHERE title = 'は/get' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '雨が降っています。', 'Ame ga futte imasu.', 'It is raining.', '下雨了。', 2 FROM grammar_points WHERE title = 'は/が' LIMIT 1;

-- Examples for の
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '私の本。', 'Watashi no hon.', 'My book.', '我的书。', 1 FROM grammar_points WHERE title = 'の' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '日本語の先生。', 'Nihongo no sensei.', 'Japanese teacher.', '日语老师。', 1 FROM grammar_points WHERE title = 'の' LIMIT 1;

-- Examples for を
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, 'りんごを食べます。', 'Ringo o tabemasu.', 'I eat an apple.', '吃苹果。', 1 FROM grammar_points WHERE title = 'を' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, 'お茶を飲みます。', 'Ocha o nomimasu.', 'I drink tea.', '喝茶。', 1 FROM grammar_points WHERE title = 'を' LIMIT 1;

-- Examples for に/へ
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '学校へ行きます。', 'Gakkou e ikimasu.', 'Go to school.', '去学校。', 1 FROM grammar_points WHERE title = 'に/へ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '日本に行きたいです。', 'Nihon ni ikitai desu.', 'I want to go to Japan.', '想去日本。', 2 FROM grammar_points WHERE title = 'に/へ' LIMIT 1;

-- Examples for で
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '図書館で勉強します。', 'Toshokan de benkyou shimasu.', 'Study at the library.', '在图书馆学习。', 1 FROM grammar_points WHERE title = 'で' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '箸で食べます。', 'Hashi de tabemasu.', 'Eat with chopsticks.', '用筷子吃。', 1 FROM grammar_points WHERE title = 'で' LIMIT 1;

-- Examples for も
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '私も行きます。', 'Watashi mo ikimasu.', 'I will go too.', '我也去。', 1 FROM grammar_points WHERE title = 'も' LIMIT 1;

-- Examples for と/や
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '猫と犬がいます。', 'Neko to inu ga imasu.', 'There are cats and dogs.', '有猫和狗。', 1 FROM grammar_points WHERE title = 'と/や' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, 'ペンや本があります。', 'Pen ya hon ga arimasu.', 'There are pens, books, etc.', '有笔和书等等。', 2 FROM grammar_points WHERE title = 'と/や' LIMIT 1;
