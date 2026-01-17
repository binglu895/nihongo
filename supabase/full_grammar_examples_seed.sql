-- Full Grammar Examples Seed (186 items for 31 points)

-- 1. は/が
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '私は学生です。', 'Watashi wa gakusei desu.', 'I am a student.', '我是学生。', 1 FROM grammar_points WHERE title = 'は/が' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '犬が公園にいます。', 'Inu ga kouen ni imasu.', 'A dog is in the park.', '有一只狗在公园里。', 1 FROM grammar_points WHERE title = 'は/が' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'これは母のバッグです。', 'Kore wa haha no baggu desu.', 'This is my mother''s bag.', '这是我妈妈的包。', 2 FROM grammar_points WHERE title = 'は/が' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '雨が降っています。', 'Ame ga futte imasu.', 'It is raining.', '下雨了。', 2 FROM grammar_points WHERE title = 'は/が' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '私の弟は背が高いです。', 'Watashi no otouto wa se ga takai desu.', 'My younger brother is tall.', '我弟弟个子很高。', 3 FROM grammar_points WHERE title = 'は/加' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '静かな音楽が好きです。', 'Shizuka na ongaku ga suki desu.', 'I like quiet music.', '我喜欢安静的音乐。', 3 FROM grammar_points WHERE title = 'は/が' LIMIT 1;

-- 2. の
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '私の本。', 'Watashi no hon.', 'My book.', '我的书。', 1 FROM grammar_points WHERE title = 'の' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '日本の地図。', 'Nihon no chizu.', 'Map of Japan.', '日本地图。', 1 FROM grammar_points WHERE title = 'の' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '明日の天気はいいです。', 'Ashita no tenki wa ii desu.', 'Tomorrow''s weather is good.', '明天的天气很好。', 2 FROM grammar_points WHERE title = 'の' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'あの赤いくるまは先生のです。', 'Ano akai kuruma wa sensei no desu.', 'That red car is the teacher''s.', '那辆红色的车是老师的。', 2 FROM grammar_points WHERE title = 'の' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'デパートの三階にあります。', 'Depaato no sangai ni arimasu.', 'It is on the third floor of the department store.', '在百货大楼的三层。', 3 FROM grammar_points WHERE title = 'の' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '誕生日のプレゼントを買いに行きます。', 'Tanjoubi no purezento wo kai ni ikimasu.', 'I will go buy a birthday present.', '去买生日礼物。', 3 FROM grammar_points WHERE title = 'の' LIMIT 1;

-- 3. を
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'りんごを食べます。', 'Ringo o tabemasu.', 'I eat an apple.', '吃苹果。', 1 FROM grammar_points WHERE title = 'を' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'テレビを見ます。', 'Terebi o mimasu.', 'I watch TV.', '看电视。', 1 FROM grammar_points WHERE title = 'を' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '毎晩宿題をします。', 'Maiban shukudai o shimasu.', 'I do homework every night.', '每天晚上都做作业。', 2 FROM grammar_points WHERE title = 'を' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '今朝コーヒーを飲みました。', 'Kesa koohii o nomimashita.', 'I drank coffee this morning.', '今天早上喝了咖啡。', 2 FROM grammar_points WHERE title = 'を' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'デパートで靴を買いたいですか。', 'Depaato de kutsu o kaitai desu ka.', 'Do you want to buy shoes at the department store?', '你想在百货店买鞋吗？', 3 FROM grammar_points WHERE title = 'を' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '大きいカメラを持ちますか。', 'Ookii kamera o mochimasu ka.', 'Do you hold a large camera?', '你拿着大相机吗？', 3 FROM grammar_points WHERE title = 'を' LIMIT 1;

-- 4. に/へ
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '学校へ行きます。', 'Gakkou e ikimasu.', 'Go to school.', '去学校。', 1 FROM grammar_points WHERE title = 'に/へ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '九時に起きます。', 'Kuji ni okimasu.', 'Get up at 9:00.', '九点起床。', 1 FROM grammar_points WHERE title = 'に/へ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '部屋に花があります。', 'Heya ni hana ga arimasu.', 'There are flowers in the room.', '房间里有花。', 2 FROM grammar_points WHERE title = 'に/へ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '友達に会いました。', 'Tomodachi ni aimashita.', 'I met a friend.', '见到了朋友。', 2 FROM grammar_points WHERE title = 'に/へ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '日本に日本語を勉強しに来ました。', 'Nihon ni nihongo o benkyou shi ni kimashita.', 'I came to Japan to study Japanese.', '来到日本学习日语。', 3 FROM grammar_points WHERE title = 'に/へ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '来月、家族と一緒に京都へ行きます。', 'Raigetsu, kazoku to issho ni kyouto e ikimasu.', 'Next month, I will go to Kyoto with my family.', '下个月和家人一起去京都。', 3 FROM grammar_points WHERE title = 'に/へ' LIMIT 1;

-- 5. で
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'バスで帰ります。', 'Basu de kaerimasu.', 'Return by bus.', '乘公交车回去。', 1 FROM grammar_points WHERE title = 'で' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '箸で食べます。', 'Hashi de tabemasu.', 'Eat with chopsticks.', '用筷子吃。', 1 FROM grammar_points WHERE title = 'で' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '図書館で勉強します。', 'Toshokan de benkyou shimasu.', 'Study at the library.', '在图书馆学习。', 2 FROM grammar_points WHERE title = 'で' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '英語で手紙を書きました。', 'Eigo de tegami o kakimashita.', 'I wrote a letter in English.', '用英语写了信。', 2 FROM grammar_points WHERE title = 'で' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'スマホで写真をたくさん撮りました。', 'Sumaho de shashin o takusan torimashita.', 'I took many photos with my smartphone.', '用手机拍了很多照片。', 3 FROM grammar_points WHERE title = 'で' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '三千円でこの辞書を買いました。', 'San-zen en de kono jisho o kaimashita.', 'I bought this dictionary for 3,000 yen.', '花三千日元买了这本词典。', 3 FROM grammar_points WHERE title = 'で' LIMIT 1;

-- 6. も
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '私も行きます。', 'Watashi mo ikimasu.', 'I am going too.', '我也去。', 1 FROM grammar_points WHERE title = 'も' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '明日も休みです。', 'Ashita mo yasumi desu.', 'Tomorrow is also a holiday.', '明天也休息。', 1 FROM grammar_points WHERE title = 'も' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '果物も野菜も食べます。', 'Kudamono mo yasai mo tabemasu.', 'I eat fruit and vegetables.', '水果和蔬菜都吃。', 2 FROM grammar_points WHERE title = 'も' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '漢字も練習しなければなりません。', 'Kanji mo renshuu shinakereba narimasen.', 'I must also practice Kanji.', '也必须练习汉字。', 2 FROM grammar_points WHERE title = 'も' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'この鞄は安いです。あの鞄も安いです。', 'Kono kaban wa yasui desu. Ano kaban mo yasui desu.', 'This bag is cheap. That bag is also cheap.', '这个包很便宜。那个包也很便宜。', 3 FROM grammar_points WHERE title = 'も' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '昨日は忙しかったです、今日も忙しいです。', 'Kinou wa isogashikatta desu, kyou mo isogashii desu.', 'Yesterday was busy, and today is busy too.', '昨天很忙，今天也很忙。', 3 FROM grammar_points WHERE title = 'も' LIMIT 1;

-- 7. と/や
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '本とペン。', 'Hon to pen.', 'Book and pen.', '书和笔。', 1 FROM grammar_points WHERE title = 'と/や' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '猫と犬がいます。', 'Neko to inu ga imasu.', 'There are cats and dogs.', '有猫和狗。', 1 FROM grammar_points WHERE title = 'と/や' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'ペンやノートがあります。', 'Pen ya nooto ga arimasu.', 'There are pens and notebooks (and others).', '有笔、笔记本等等。', 2 FROM grammar_points WHERE title = 'と/や' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '果物や野菜を買いました。', 'Kudamono ya yasai o kaimashita.', 'I bought fruit and vegetables (among others).', '买了水果、蔬菜等。', 2 FROM grammar_points WHERE title = 'と/や' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '土曜日に友達とテニスをします。', 'Doyoubi ni tomodachi to tenisu o shimasu.', 'I will play tennis with a friend on Saturday.', '周六和朋友打网球。', 3 FROM grammar_points WHERE title = 'と/や' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'カバンの中に本や辞書などがあります。', 'Kaban no naka ni hon ya jisho nado ga arimasu.', 'There are books, dictionaries, etc. in the bag.', '包里有书、词典等东西。', 3 FROM grammar_points WHERE title = 'と/や' LIMIT 1;

-- 8. あります/います
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '本があります。', 'Hon ga arimasu.', 'There is a book.', '有书。', 1 FROM grammar_points WHERE title = 'あります/います' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '学生がいます。', 'Gakusei ga imasu.', 'There are students.', '有学生。', 1 FROM grammar_points WHERE title = 'あります/います' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '公園に犬がいます。', 'Kouen ni inu ga imasu.', 'There is a dog in the park.', '公园里有一只狗。', 2 FROM grammar_points WHERE title = 'あります/います' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '机の下に猫がいます。', 'Tsukue no shita ni neko ga imasu.', 'There is a cat under the desk.', '桌子下面有一只猫。', 2 FROM grammar_points WHERE title = 'あります/います' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '冷蔵庫の中に何もありません。', 'Reizouko no naka ni nani mo arimasen.', 'There is nothing in the refrigerator.', '冰箱里什么都没有。', 3 FROM grammar_points WHERE title = 'あります/います' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '私の街にデパートが二つあります。', 'Watashi no machi ni depaato ga futatsu arimasu.', 'There are two department stores in my city.', '我的城市有两家百货商店。', 3 FROM grammar_points WHERE title = 'あります/います' LIMIT 1;

-- 9. ～がほしい
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '水がほしい。', 'Mizu ga hoshii.', 'I want water.', '我想喝水。', 1 FROM grammar_points WHERE title = '～がほしい' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '靴がほしいです。', 'Kutsu ga hoshii desu.', 'I want shoes.', '我想要鞋子。', 1 FROM grammar_points WHERE title = '～がほしい' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '新しい車がほしいです。', 'Atarashii kuruma ga hoshii desu.', 'I want a new car.', '我想要辆新车。', 2 FROM grammar_points WHERE title = '～がほしい' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '大きい家がほしいです。', 'Ookii ie ga hoshii desu.', 'I want a big house.', '我想要一座大房子。', 2 FROM grammar_points WHERE title = '～がほしい' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '誕生日に何が一番ほしいですか。', 'Tanjoubi ni nani ga ichiban hoshii desu ka.', 'What do you want most for your birthday?', '你生日最想要什么？', 3 FROM grammar_points WHERE title = '～がほしい' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '静かなところがほしいです。', 'Shizuka na tokoro ga hoshii desu.', 'I want a quiet place.', '我想要一个安静的地方。', 3 FROM grammar_points WHERE title = '～がほしい' LIMIT 1;

-- 10. ～たいです
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べたいです。', 'Tabetai desu.', 'I want to eat.', '我想吃。', 1 FROM grammar_points WHERE title = '～たいです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '日本に行きたいです。', 'Nihon ni ikitai desu.', 'I want to go to Japan.', '我想去日本。', 1 FROM grammar_points WHERE title = '～たいです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'お茶を飲みたいです。', 'Ocha o nomitai desu.', 'I want to drink tea.', '我想喝茶。', 2 FROM grammar_points WHERE title = '～たいです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '服を洗いたい。', 'Fuku o araitai.', 'I want to wash clothes.', '我想洗衣服。', 2 FROM grammar_points WHERE title = '～たいです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '今日はどこへも行きたくないです。', 'Kyou wa doko e mo ikitakunai desu.', 'I don''t want to go anywhere today.', '今天哪儿也不想去。', 3 FROM grammar_points WHERE title = '～たいです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'もっと日本語を練習したい。', 'Motto nihongo o renshuu shitai.', 'I want to practice Japanese more.', '我想多练习日语。', 3 FROM grammar_points WHERE title = '～たいです' LIMIT 1;

-- 11. ～てください
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '見てください。', 'Mite kudasai.', 'Please look.', '请看。', 1 FROM grammar_points WHERE title = '～てください' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べてください。', 'Tabete kudasai.', 'Please eat.', '请吃。', 1 FROM grammar_points WHERE title = '～てください' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'ここに来てください。', 'Koko ni kite kudasai.', 'Please come here.', '请来这里。', 2 FROM grammar_points WHERE title = '～てください' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '名前を書いてください。', 'Namae o kaite kudasai.', 'Please write your name.', '请写下名字。', 2 FROM grammar_points WHERE title = '～てください' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '九時に駅で待ってください。', 'Kuji ni eki de matte kudasai.', 'Please wait at the station at 9:00.', '请九点在车站等候。', 3 FROM grammar_points WHERE title = '～てください' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '少し休んでください。', 'Sukoshi yasunde kudasai.', 'Please rest for a while.', '请稍微休息一下。', 3 FROM grammar_points WHERE title = '～てください' LIMIT 1;

-- 12. ～ないでください
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '開けないでください。', 'Akenaide kudasai.', 'Please don''t open it.', '请不要打开。', 1 FROM grammar_points WHERE title = '～ないでください' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べないでください。', 'Tabenaide kudasai.', 'Please don''t eat it.', '请不要吃。', 1 FROM grammar_points WHERE title = '～ないでください' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '写真を撮らないでください。', 'Shashin o toranaide kudasai.', 'Please don''t take photos.', '请不要拍照。', 2 FROM grammar_points WHERE title = '～ないでください' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'ここで泳がないでください。', 'Koko de oyoganaide kudasai.', 'Please don''t swim here.', '请不要在这里游泳。', 2 FROM grammar_points WHERE title = '～ないでください' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '危ないですから。中に入らないでください。', 'Abunai desu kara. Naka ni hairanaide kudasai.', 'Because it is dangerous, please don''t go inside.', '因为很危险。请不要进去。', 3 FROM grammar_points WHERE title = '～ないでください' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '約束を忘れないでください。', 'Yakusoku o wasurenaide kudasai.', 'Please don''t forget our promise.', '请不要忘记约定。', 3 FROM grammar_points WHERE title = '～ないでください' LIMIT 1;

-- 13. ～てもいいです
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べてもいいです。', 'Tabetemo ii desu.', 'You may eat.', '可以吃。', 1 FROM grammar_points WHERE title = '～てもいいです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '入ってもいいですか。', 'Haittemo ii desu ka.', 'May I come in?', '我可以进来吗？', 1 FROM grammar_points WHERE title = '～てもいいです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '写真を撮ってもいいですか。', 'Shashin o tottemo ii desu ka.', 'May I take a photo?', '我可以拍照吗？', 2 FROM grammar_points WHERE title = '～てもいいです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'テレビを見てもいいですよ。', 'Terebi o mitemo ii desu yo.', 'You may watch TV, you know.', '你可以看电视哦。', 2 FROM grammar_points WHERE title = '～てもいいです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '窓を開けてもいいですか。', 'Mado o aketemo ii desu ka.', 'May I open the window?', '我可以打开窗户吗？', 3 FROM grammar_points WHERE title = '～てもいいです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'テストのとき、辞書を引いてもいいです。', 'Tesuto no toki, jisho o hiitemo ii desu.', 'You may use a dictionary during the test.', '考试时可以使用词典。', 3 FROM grammar_points WHERE title = '～てもいいです' LIMIT 1;

-- 14. ～てはいけません
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べてはいけません。', 'Tabete wa ikemasen.', 'Must not eat.', '不准吃。', 1 FROM grammar_points WHERE title = '～てはいけません' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '寝てはいけません。', 'Nete wa ikemasen.', 'Must not sleep.', '不准睡觉。', 1 FROM grammar_points WHERE title = '～てはいけません' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'ここで泳いではいけません。', 'Koko de oyoide wa ikemasen.', 'Must not swim here.', '不准在这里游泳。', 2 FROM grammar_points WHERE title = '～てはいけません' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'タバコを吸ってはいけません。', 'Tabako o sutte wa ikemasen.', 'Must not smoke.', '不准吸烟。', 2 FROM grammar_points WHERE title = '～てはいけません' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'お酒を飲んで運転してはいけません。', 'Osake o nonde unten shite wa ikemasen.', 'Must not drive after drinking alcohol.', '饮酒后不得驾车。', 3 FROM grammar_points WHERE title = '～てはいけません' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '夜、遅くまで遊んではいけません。', 'Yoru, osoku made asonde wa ikemasen.', 'Must not play until late at night.', '晚上不能玩到很晚。', 3 FROM grammar_points WHERE title = '～てはいけません' LIMIT 1;

-- 15. ～なければならない
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '行かなければならない。', 'Ikanakereba naranai.', 'Must go.', '必须去。', 1 FROM grammar_points WHERE title = '～なければならない' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '薬を飲まなければならない。', 'Kusuri o nomanakereba naranai.', 'Must take medicine.', '必须吃药。', 1 FROM grammar_points WHERE title = '～なければならない' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '宿題をしなければなりません。', 'Shukudai o shinakereba narimasen.', 'Must do homework.', '必须做作业。', 2 FROM grammar_points WHERE title = '～なければならない' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '早く寝なければなりません。', 'Hayaku nenakereba narimasen.', 'Must go to bed early.', '必须早点睡觉。', 2 FROM grammar_points WHERE title = '～なければならない' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '明日、テストがありますから。勉強しなければなりません。', 'Ashita, tesuto ga arimasu kara. Benkyou shinakereba narimasen.', 'Because there is a test tomorrow, I must study.', '因为明天有考试。必须学习。', 3 FROM grammar_points WHERE title = '～なければならない' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '明日までにこの仕事を終わらせなければなりません。', 'Ashita made ni kono shigoto wo owarasenakereba narimasen.', 'I must finish this work by tomorrow.', '必须在明天之前完成这项工作。', 3 FROM grammar_points WHERE title = '～なければならない' LIMIT 1;

-- 16. ～なくてもいい
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べなくてもいい。', 'Tabenakute mo ii.', 'Don''t have to eat.', '不吃也可以。', 1 FROM grammar_points WHERE title = '～なくてもいい' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '行かなくてもいいです。', 'Ikanaikute mo ii desu.', 'Don''t have to go.', '不去也可以。', 1 FROM grammar_points WHERE title = '～なくてもいい' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '靴を脱がなくてもいいです。', 'Kutsu o nuganakute mo ii desu.', 'Don''t have to take off shoes.', '不用脱鞋也可以。', 2 FROM grammar_points WHERE title = '～なくてもいい' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '急がなくてもいいですよ。', 'Isoganakute mo ii desu yo.', 'Don''t have to hurry, you know.', '不用着急也可以。', 2 FROM grammar_points WHERE title = '～なくてもいい' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '今日は休みですから。働かなくてもいいです。', 'Kyou wa yasumi desu kara. Hatarakanakute mo ii desu.', 'Because today is a holiday, you don''t have to work.', '因为今天是休息日。不工作也可以。', 3 FROM grammar_points WHERE title = '～なくてもいい' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'おなかがいっぱいですから。全部食べなくてもいいです。', 'Onaka ga ippai desu kara. Zenbu tabenakute mo ii desu.', 'Because I am full, I don''t have to eat all.', '因为饱了。不用全部吃掉也可以。', 3 FROM grammar_points WHERE title = '～なくてもいい' LIMIT 1;

-- 17. ～ている
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べている。', 'Tabete iru.', 'Is eating.', '正在吃。', 1 FROM grammar_points WHERE title = '～ている' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'ている本。', 'Te iru hon.', 'Living book.', '正在读。', 1 FROM grammar_points WHERE title = '～ている' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'テレビを見ています。', 'Terebi o mite imasu.', 'Is watching TV.', '正在看电视。', 2 FROM grammar_points WHERE title = '～ている' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '雨が降っています。', 'Ame ga futte imasu.', 'It is raining.', '正在下雨。', 2 FROM grammar_points WHERE title = '～ている' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '友達を待っています。', 'Tomodachi wo matte imasu.', 'Is waiting for a friend.', '正在等朋友。', 3 FROM grammar_points WHERE title = '～ている' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '私は東京に住んでいます。', 'Watashi wa tokyo ni sunde imasu.', 'I am living in Tokyo.', '我住在东京。', 3 FROM grammar_points WHERE title = '～ている' LIMIT 1;

-- 18. ～てから
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べてから行きます。', 'Tabete kara ikimasu.', 'Go after eating.', '吃完后再去。', 1 FROM grammar_points WHERE title = '～てから' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '見てから買います。', 'Mite kara kaimasu.', 'Buy after looking.', '看完后再买。', 1 FROM grammar_points WHERE title = '～てから' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '手を洗ってから食べます。', 'Te wo aratte kara tabemasu.', 'Eat after washing hands.', '洗完手后再吃。', 2 FROM grammar_points WHERE title = '～てから' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '宿題をしてから遊びます。', 'Shukudai wo shite kara asobimasu.', 'Play after doing homework.', '做完作业后再玩。', 2 FROM grammar_points WHERE title = '～てから' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'お風呂に入ってから寝ます。', 'Ofuro ni haitte kara nemasu.', 'Sleep after taking a bath.', '洗过澡后再睡觉。', 3 FROM grammar_points WHERE title = '～てから' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '仕事を終わらせてから、映画を見に行きます。', 'Shigoto wo owarasete kara, eiga wo mi ni ikimasu.', 'I will go see a movie after finishing work.', '完成工作后，去看电影。', 3 FROM grammar_points WHERE title = '～てから' LIMIT 1;

-- 19. ～たことがある
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '行ったことがあります。', 'Itta koto ga arimasu.', 'Have been there.', '去过。', 1 FROM grammar_points WHERE title = '～たことがある' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べたことがあります。', 'Tabeta koto ga arimasu.', 'Have eaten it.', '吃过。', 1 FROM grammar_points WHERE title = '～たことがある' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '日本に行ったことがありますか。', 'Nihon ni itta koto ga arimasu ka.', 'Have you ever been to Japan?', '你去过日本吗？', 2 FROM grammar_points WHERE title = '～たことがある' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '寿司を食べたことがあります。', 'Sushi o tabeta koto ga arimasu.', 'I have eaten sushi before.', '吃过寿司。', 2 FROM grammar_points WHERE title = '～たことがある' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '馬に乗ったことがあります。', 'Uma ni notta koto ga arimasu.', 'I have ridden a horse before.', '骑过马。', 3 FROM grammar_points WHERE title = '～たことがある' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '富士山に登ったことがありません。', 'Fujisan ni nobotta koto ga arimasen.', 'I have never climbed Mount Fuji.', '没爬过富士山。', 3 FROM grammar_points WHERE title = '～たことがある' LIMIT 1;

-- 20. ～ましょう(か)
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べましょう。', 'Tabemashou.', 'Let''s eat.', '吃吧。', 1 FROM grammar_points WHERE title = '～ましょう(か)' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '行きましょう。', 'Ikimashou.', 'Let''s go.', '走吧。', 1 FROM grammar_points WHERE title = '～ましょう(か)' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'あした映画を見ましょう。', 'Ashita eiga o mimashou.', 'Let''s watch a movie tomorrow.', '明天看电影吧。', 2 FROM grammar_points WHERE title = '～ましょう(か)' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'コーヒーを飲みましょうか。', 'Koohii wo nomimashou ka.', 'Shall we drink coffee?', '喝杯咖啡吧？', 2 FROM grammar_points WHERE title = '～ましょう(か)' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '荷物を持ちましょうか。', 'Nimotsu wo mochimashou ka.', 'Shall I hold your luggage?', '我帮你拿行李吧？', 3 FROM grammar_points WHERE title = '～ましょう(か)' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '少し休みましょう。', 'Sukoshi yasumimashou.', 'Let''s rest for a while.', '稍作休息吧。', 3 FROM grammar_points WHERE title = '～ましょう(か)' LIMIT 1;

-- 21. ～つもりです
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '行くつもりです。', 'Iku tsumori desu.', 'Plan to go.', '打算去。', 1 FROM grammar_points WHERE title = '～つもりです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べるつもりです。', 'Taberu tsumori desu.', 'Plan to eat.', '打算吃。', 1 FROM grammar_points WHERE title = '～つもりです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '日本で働くつもりです。', 'Nihon de hataraku tsumori desu.', 'I plan to work in Japan.', '打算在日本工作。', 2 FROM grammar_points WHERE title = '～つもりです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '新しい車を買うつもりです。', 'Atarashii kuruma o kau tsumori desu.', 'I plan to buy a new car.', '打算买新车。', 2 FROM grammar_points WHERE title = '～つもりです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '夏休みは北海道へ行くつもりです。', 'Natsu-yasumi wa hokkaido e iku tsumori desu.', 'I plan to go to Hokkaido during summer vacation.', '暑假打算去北海道。', 3 FROM grammar_points WHERE title = '～つもりです' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '将来、自分の会社を作るつもりです。', 'Shourai, jibun no kaisha wo tsukuru tsumori desu.', 'In the future, I plan to build my own company.', '未来打算成立自己的公司。', 3 FROM grammar_points WHERE title = '～つもりです' LIMIT 1;

-- 22. ～から/～ので
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '安いから。', 'Yasui kara.', 'Because it''s cheap.', '因为便宜。', 1 FROM grammar_points WHERE title = '～から/～ので' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '忙しいので。', 'Isogashii node.', 'Since I am busy.', '因为忙。', 1 FROM grammar_points WHERE title = '～から/～ので' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '寒いから、窓を閉めてください。', 'Samui kara, mado wo shimete kudasai.', 'Because it is cold, please close the window.', '因为冷，请关上窗户。', 2 FROM grammar_points WHERE title = '～から/～ので' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '雨が降っているので、タクシーで行きます。', 'Ame ga futte iru node, takushii de ikimasu.', 'Because it is raining, I will go by taxi.', '因为在下雨，所以打车去。', 2 FROM grammar_points WHERE title = '～から/～ので' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'おいしいですから、もっと食べてください。', 'Oishii desu kara, motto tabete kudasai.', 'Because it is delicious, please eat more.', '因为很好吃，请多吃点。', 3 FROM grammar_points WHERE title = '～から/～ので' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '危ないですから。気をつけてください。', 'Abunai desu kara. Ki wo tsukete kudasai.', 'Because it is dangerous. Please be careful.', '因为很危险。请小心。', 3 FROM grammar_points WHERE title = '～から/～ので' LIMIT 1;

-- 23. ～とき
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '暇なとき。', 'Hima na toki.', 'When I am free.', '闲暇时。', 1 FROM grammar_points WHERE title = '～とき' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '子供のとき。', 'Kodomo no toki.', 'When I was a child.', '小时候。', 1 FROM grammar_points WHERE title = '～とき' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '寝るとき、電気を消します。', 'Neru toki, denki wo keshimasu.', 'When I go to bed, I turn off the lights.', '睡觉时要关灯。', 2 FROM grammar_points WHERE title = '～とき' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食事のとき、お茶を飲みます。', 'Shokuji no toki, ocha o nomimasu.', 'During meals, I drink tea.', '用餐时喝茶。', 2 FROM grammar_points WHERE title = '～とき' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '日本へ行くとき、辞書を買いました。', 'Nihon e iku toki, jisho o kaimashita.', 'When I went to Japan, I bought a dictionary.', '去日本时买了词典。', 3 FROM grammar_points WHERE title = '～とき' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '病気のとき、病院へ行かなければなりません。', 'Byouki no toki, byouin e ikanakereba narimasen.', 'When you are sick, you must go to the hospital.', '生病时必须去医院。', 3 FROM grammar_points WHERE title = '～とき' LIMIT 1;

-- 24. ～前に
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '行く前に。', 'Iku mae ni.', 'Before going.', '去之前。', 1 FROM grammar_points WHERE title = '～前に' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べる前に。', 'Taberu mae ni.', 'Before eating.', '吃之前。', 1 FROM grammar_points WHERE title = '～前に' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '寝る前に、本を読みます。', 'Neru mae ni, hon wo yomimasu.', 'I read a book before going to sleep.', '睡觉前读书。', 2 FROM grammar_points WHERE title = '～前に' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '十時の前に。', 'Juuji no mae ni.', 'Before 10:00.', '十点之前。', 2 FROM grammar_points WHERE title = '～前に' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '日本に来る前に、日本語を勉強しました。', 'Nihon ni kuru mae ni, nihongo o benkyou shimashita.', 'Before coming to Japan, I studied Japanese.', '来日本之前学习了日语。', 3 FROM grammar_points WHERE title = '～前に' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食事の前に、手を洗います。', 'Shokuji no mae ni, te wo araimasu.', 'Before meals, wash hands.', '用餐前洗手。', 3 FROM grammar_points WHERE title = '～前に' LIMIT 1;

-- 25. ～より～ほうが
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'これのほうがいい。', 'Kore no hou ga ii.', 'This is better.', '这个更好。', 1 FROM grammar_points WHERE title = '～より～ほうが' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '肉より魚のほうが好きです。', 'Niku yori sakana no hou ga suki desu.', 'I like fish more than meat.', '比起肉更喜欢鱼。', 1 FROM grammar_points WHERE title = '～より～ほうが' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '電車よりバスのほうが安いです。', 'Densha yori basu no hou ga yasui desu.', 'Bus is cheaper than train.', '相比电车，公交车更便宜。', 2 FROM grammar_points WHERE title = '～より～ほうが' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '昨日より今日のほうが寒いです。', 'Kinou yori kyou no hou ga samui desu.', 'Today is colder than yesterday.', '今天比昨天冷。', 2 FROM grammar_points WHERE title = '～より～ほうが' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '漢字を書くより読むほうが簡単です。', 'Kanji wo kaku yori yomu hou ga kantan desu.', 'Reading Kanji is easier than writing it.', '比起写汉字，读汉字更简单。', 3 FROM grammar_points WHERE title = '～より～ほうが' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'サッカーより野球のほうが面白いと思います。', 'Sakkaa yori yakyuu no hou ga omoshiroi to omoimasu.', 'I think baseball is more interesting than soccer.', '比起足球，我觉得棒球更有趣。', 3 FROM grammar_points WHERE title = '～より～ほうが' LIMIT 1;

-- 26. 一番
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '一番おいしい。', 'Ichiban oishii.', 'Most delicious.', '最好吃。', 1 FROM grammar_points WHERE title = '一番' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '一番高い。', 'Ichiban takai.', 'Highest / Most expensive.', '最贵。', 1 FROM grammar_points WHERE title = '一番' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '一年で一番寒い月は何月ですか。', 'Ichinen de ichiban samui tsuki wa nani gatsu desu ka.', 'Which is the coldest month of the year?', '一年中最冷的月份是几月？', 2 FROM grammar_points WHERE title = '一番' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '果物の中で、りんごが一番好きです。', 'Kudamono no naka de, ringo ga ichiban suki desu.', 'Among fruits, I like apples most.', '在水果中，最喜欢苹果。', 2 FROM grammar_points WHERE title = '一番' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'クラスの中で誰が一番背が高いですか。', 'Kurasu no naka de dare ga ichiban se ga takai desu ka.', 'Who is the tallest in the class?', '班里谁最高？', 3 FROM grammar_points WHERE title = '一番' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '世界で一番高い山はどこですか。', 'Sekai de ichiban takai yama wa doko desu ka.', 'Where is the highest mountain in the world?', '世界上最高的山在哪里？', 3 FROM grammar_points WHERE title = '一番' LIMIT 1;

-- 27. ～すぎます
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べすぎます。', 'Tabesugimasu.', 'Eat too much.', '吃太多。', 1 FROM grammar_points WHERE title = '～すぎます' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '寒すぎます。', 'Samusugimasu.', 'Too cold.', '太冷了。', 1 FROM grammar_points WHERE title = '～すぎます' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '昨日は飲みすぎました。', 'Kinou wa nomisugimashita.', 'I drank too much yesterday.', '昨天喝多了。', 2 FROM grammar_points WHERE title = '～すぎます' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'このテストは難しすぎます。', 'Kono tesuto wa muzukashi sugimasu.', 'This test is too difficult.', '这次考试太难了。', 2 FROM grammar_points WHERE title = '～すぎます' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'テレビの見すぎは目によくないです。', 'Terebi no misugi wa me ni yokunai desu.', 'Watching too much TV is bad for your eyes.', '看太多电视对眼睛不好。', 3 FROM grammar_points WHERE title = '～すぎます' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'このカバンは重すぎますから、持てません。', 'Kono kaban wa omosugimasu kara, motemasen.', 'This bag is too heavy, so I cannot hold it.', '这个书包太重了，拿不动。', 3 FROM grammar_points WHERE title = '～すぎます' LIMIT 1;

-- 28. ～になります
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '医者になります。', 'Isha ni narimasu.', 'Become a doctor.', '成为医生。', 1 FROM grammar_points WHERE title = '～になります' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '春になります。', 'Haru ni narimasu.', 'Become spring.', '要到春天了。', 1 FROM grammar_points WHERE title = '～になります' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'だんだん暑くなります。', 'Dandan atsuku narimasu.', 'Gradually becomes hot.', '渐渐变热。', 2 FROM grammar_points WHERE title = '～になります' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '背が高くなりましたね。', 'Se ga takaku narimashita ne.', 'You have become tall, haven''t you?', '长高了呢。', 2 FROM grammar_points WHERE title = '～になります' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '将来、何になりたいですか。', 'Shourai, nani ni naritai desu ka.', 'What do you want to become in the future?', '将来想做什么？', 3 FROM grammar_points WHERE title = '～になります' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '掃除をしましたから、部屋が奇麗になりました。', 'Souji o shimashita kara, heya ga kirei ni narimashita.', 'Because I cleaned, the room became clean.', '打扫过了，房间变得干净了。', 3 FROM grammar_points WHERE title = '～になります' LIMIT 1;

-- 29. ～方(かた)
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '書き方。', 'Kakikata.', 'Way of writing.', '写法。', 1 FROM grammar_points WHERE title = '～方(かた)' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '食べ方。', 'Tabekata.', 'Way of eating.', '吃法。', 1 FROM grammar_points WHERE title = '～方(かた)' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'この漢字の読み方を教えてください。', 'Kono kanji no yomikata o oshiete kudasai.', 'Please tell me how to read this Kanji.', '请告诉这个汉字的读法。', 2 FROM grammar_points WHERE title = '～方(かた)' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '使い方がわかりません。', 'Tsukaikata ga wakarimasen.', 'I don''t know how to use it.', '不知道用法。', 2 FROM grammar_points WHERE title = '～方(かた)' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'お箸の持ち方を練習しています。', 'Ohashi no mochikata wo renshuu shite imasu.', 'I am practicing how to hold chopsticks.', '正在练习筷子的拿法。', 3 FROM grammar_points WHERE title = '～方(かた)' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'おいしいお茶の入れ方を習いました。', 'Oishii ocha no irekata wo naraimashita.', 'I learned how to make delicious tea.', '学习了美味茶的泡法。', 3 FROM grammar_points WHERE title = '～方(かた)' LIMIT 1;

-- 30. ～でしょう/だろう
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '雨でしょう。', 'Ame deshou.', 'Probably rain.', '会下雨吧。', 1 FROM grammar_points WHERE title = '～でしょう/だろう' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '暑いでしょう。', 'Atsui deshou.', 'Probably hot.', '会热吧。', 1 FROM grammar_points WHERE title = '～でしょう/だろう' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'あしたはいい天気でしょう。', 'Ashita wa ii tenki deshou.', 'Tomorrow will probably be good weather.', '明天天气会很好吧。', 2 FROM grammar_points WHERE title = '～でしょう/だろう' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'このテストは簡単だろう。', 'Kono tesuto wa kantan darou.', 'This test will probably be easy.', '这次考试会简单吧。', 2 FROM grammar_points WHERE title = '～でしょう/だろう' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, '彼はもう来たでしょう。', 'Kare wa mou kita deshou.', 'He has probably already come.', '他已经来了吧。', 3 FROM grammar_points WHERE title = '～でしょう/だろう' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'あなたは日本人でしょう。', 'Anata wa nihonjin deshou.', 'You are Japanese, aren''t you?', '你是日本人吧。', 3 FROM grammar_points WHERE title = '～でしょう/だろう' LIMIT 1;

-- 31. ～ね/～よ
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'おいしいですね。', 'Oishii desu ne.', 'It''s delicious, isn''t it?', '很好吃呢。', 1 FROM grammar_points WHERE title = '～ね/～よ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'いい天気ですね。', 'Ii tenki desu ne.', 'The weather is nice, isn''t it?', '天气真好呢。', 1 FROM grammar_points WHERE title = '～ね/～よ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'これは私の本ですよ。', 'Kore wa watashi no hon desu yo.', 'This is my book, you know.', '这是我的书哦。', 2 FROM grammar_points WHERE title = '～ね/～よ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'あしたは休みですよ。', 'Ashita wa yasumi desu yo.', 'Tomorrow is a holiday, you know.', '明天休息哦。', 2 FROM grammar_points WHERE title = '～ね/～よ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'そのネクタイ、似合っていますね。', 'Sono nekutai, niatte imasu ne.', 'That tie looks good on you, doesn''t it?', '那条领带很适合你呢。', 3 FROM grammar_points WHERE title = '～ね/～よ' LIMIT 1;
INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty) SELECT id, 'あそこに猫がいますよ。見てください。', 'Asoko ni neko ga imasu yo. Mite kudasai.', 'There is a cat over there, you know. Please look.', '那里有只猫哦。快看。', 3 FROM grammar_points WHERE title = '～ね/～よ' LIMIT 1;
