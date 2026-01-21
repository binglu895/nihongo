
import * as fs from "fs";
import { generateAudio } from "./generateAudio";

const questions = [
    {
        sentence: "私は宿題の後でシャワーを浴びます",
        reading: "わたしはしゅくだいのあとでしゃわーをあびます",
        translation: "I take a shower after doing my homework.",
        translation_zh: "我做完作业后洗澡。",
        difficulty: 1,
        filename: "listening_shower",
        distractors: ["私は宿題の前にシャワーを浴びます", "私は仕事の後でシャワーを浴びます", "私は宿題の後で料理を作ります"],
        level: "n5"
    },
    {
        sentence: "私は歯を磨いた後で寝ます",
        reading: "わたしははをみがいたあとでねます",
        translation: "I go to sleep after brushing my teeth.",
        translation_zh: "我刷完牙后睡觉。",
        difficulty: 1,
        filename: "listening_sleep",
        distractors: ["私は歯を磨く前に寝ます", "私は顔を洗った后で寝ます", "私は歯を磨いた后で起きます"],
        level: "n5"
    },
    {
        sentence: "ここに来て",
        reading: "ここにきて",
        translation: "Come here.",
        translation_zh: "来这里。",
        difficulty: 1,
        filename: "listening_come_here",
        distractors: ["そこに来て", "あそこに来て", "ここに行って"],
        level: "n5"
    },
    {
        sentence: "そこから駅までどのくらいかかりますか？",
        reading: "そこからえきまでどのくらいかかりますか？",
        translation: "How long does it take from there to the station?",
        translation_zh: "从那里到车站要花多久？",
        difficulty: 1,
        filename: "listening_station_time",
        distractors: ["あそこから駅までどのくらいかかりますか？", "ここから駅までどのくらいかかりますか？", "そこから学校までどのくらいかかりますか？"],
        level: "n5"
    },
    {
        sentence: "あそこを見て",
        reading: "あそこをみて",
        translation: "Look over there.",
        translation_zh: "看那里。",
        difficulty: 1,
        filename: "listening_look_over_there",
        distractors: ["ここを見て", "そこを見て", "あそこを聞いて"],
        level: "n5"
    },
    {
        sentence: "どこで会いますか？",
        reading: "どこであいますか？",
        translation: "Where shall we meet?",
        translation_zh: "在哪里见面？",
        difficulty: 1,
        filename: "listening_meet_where",
        distractors: ["どこで行きますか？", "いつ会いますか？", "だれと会いますか？"],
        level: "n5"
    },
    {
        sentence: "これは箱です",
        reading: "これははこです",
        translation: "This is a box.",
        translation_zh: "这是箱子。",
        difficulty: 1,
        filename: "listening_this_is_box",
        distractors: ["それは箱です", "あれは箱です", "これは本です"],
        level: "n5"
    },
    {
        sentence: "それをとってください",
        reading: "それをとってください",
        translation: "Please take that.",
        translation_zh: "请拿那个。",
        difficulty: 1,
        filename: "listening_take_that",
        distractors: ["これをとってください", "あれをとってください", "それを見てください"],
        level: "n5"
    },
    {
        sentence: "あれは誰の車ですか？",
        reading: "あれはだれのくるまですか？",
        translation: "Whose car is that over there?",
        translation_zh: "那是谁的车？",
        difficulty: 1,
        filename: "listening_whose_car",
        distractors: ["これは誰の車ですか？", "あれは誰の自転車ですか？", "あれは私の車ですか？"],
        level: "n5"
    },
    {
        sentence: "私は京都に行ったことがあります",
        reading: "わたしはきょうとにいったことがあります",
        translation: "I have been to Kyoto.",
        translation_zh: "我去过京都。",
        difficulty: 1,
        filename: "listening_been_kyoto",
        distractors: ["私は京都に住んだことがあります", "私は京都に行きたいです", "私は東京に行ったことがあります"],
        level: "n5"
    },
    {
        sentence: "私は明日手紙を書いたり勉強したりします",
        reading: "わたしはあしたてがみをかいたりべんきょうしたりします",
        translation: "Tomorrow, I will do things like writing letters and studying.",
        translation_zh: "我明天写信、学习等等。",
        difficulty: 1,
        filename: "listening_tomorrow_study",
        distractors: ["私は明日手紙を書いて勉強します", "私は明日手紙を読んだり勉強したりします", "私は昨日手紙を書いたり勉強したりしました"],
        level: "n5"
    },
    {
        sentence: "日本人は箸でご飯を食べます",
        reading: "にほんじんははしでごはんをたべます",
        translation: "Japanese people eat rice with chopsticks.",
        translation_zh: "日本人用筷子吃饭。",
        difficulty: 1,
        filename: "listening_eat_chopsticks",
        distractors: ["日本人は箸でお茶を飲みます", "中国人は箸でご飯を食べます", "日本人は手でご飯を食べます"],
        level: "n5"
    },
    {
        sentence: "私は部屋で音楽を聴きます",
        reading: "わたしはへやでおんがくをききます",
        translation: "I listen to music in my room.",
        translation_zh: "我在房间里听音乐。",
        difficulty: 1,
        filename: "listening_listen_music",
        distractors: ["私は部屋で音楽を歌います", "私は公園で音楽を聴きます", "私は部屋でテレビを見ます"],
        level: "n5"
    },
    {
        sentence: "彼は料理ができます",
        reading: "かれはりょうりができます",
        translation: "He can cook.",
        translation_zh: "他会做饭。",
        difficulty: 1,
        filename: "listening_he_can_cook",
        distractors: ["私は料理ができます", "彼は料理が好きです", "彼は掃除ができます"],
        level: "n5"
    },
    {
        sentence: "佐藤さんは英語を話すことができます",
        reading: "さとうさんはえいごをはなすことができます",
        translation: "Mr./Ms. Sato can speak English.",
        translation_zh: "佐藤先生/女士会说英语。",
        difficulty: 1,
        filename: "listening_sato_english",
        distractors: ["佐藤さんは英語を話したいです", "佐藤さんは日本語を話すことができます", "田中さんは英語を話すことができます"],
        level: "n5"
    },
    {
        sentence: "私は今彼女を待っています",
        reading: "わたしはいまかのじょをまっています",
        translation: "I am waiting for her now.",
        translation_zh: "我现在正在等她。",
        difficulty: 1,
        filename: "listening_waiting_her",
        distractors: ["私は今彼女を呼んでいます", "私は昨日彼女を待っていました", "私は今彼を待っています"],
        level: "n5"
    },
    {
        sentence: "私は朝起きて朝ごはんを食べます",
        reading: "わたしはあさおきてあさごはんをたべます",
        translation: "I wake up in the morning and eat breakfast.",
        translation_zh: "我早上起床吃早饭。",
        difficulty: 1,
        filename: "listening_morning_routine",
        distractors: ["私は朝起きて顔を洗います", "私は朝起きてから朝ごはんを食べます", "私は夜起きて朝ごはんを食べます"],
        level: "n5"
    },
    {
        sentence: "中華料理は安くて美味しいです",
        reading: "ちゅうかりょうりはやすくておいしいです",
        translation: "Chinese food is cheap and delicious.",
        translation_zh: "中华料理既便宜又好吃。",
        difficulty: 1,
        filename: "listening_chinese_food",
        distractors: ["中華料理は安くて辛いです", "日本料理は安くて美味しいです", "中華料理は高くて美味しいです"],
        level: "n5"
    },
    {
        sentence: "私は買い物してから家に帰ります",
        reading: "わたしはかいものしてからいえにかえります",
        translation: "I will go home after shopping.",
        translation_zh: "我买完东西后回家。",
        difficulty: 1,
        filename: "listening_shopping_home",
        distractors: ["私は買い物して家に帰ります", "私は掃除してから家に帰ります", "私は買い物してから学校に行きます"],
        level: "n5"
    },
    {
        sentence: "黒板を見てください",
        reading: "こくばんをみてください",
        translation: "Please look at the blackboard.",
        translation_zh: "请看黑板。",
        difficulty: 1,
        filename: "listening_look_blackboard",
        distractors: ["時計を見てください", "黒板を書いてください", "窓を見てください"],
        level: "n5"
    },
    {
        sentence: "ちょっと手伝ってください",
        reading: "ちょっとてつだってください",
        translation: "Please help me for a moment.",
        translation_zh: "请帮一下忙。",
        difficulty: 1,
        filename: "listening_help_me",
        distractors: ["ちょっと待ってください", "ちょっと教えてください", "ちょっと休んでください"],
        level: "n5"
    },
    {
        sentence: "どうぞ食べてください",
        reading: "どうぞたべてください",
        translation: "Please, go ahead and eat.",
        translation_zh: "请吃吧。",
        difficulty: 1,
        filename: "listening_please_eat",
        distractors: ["どうぞ飲んでください", "どうぞ見てください", "座って食べてください"],
        level: "n5"
    },
    {
        sentence: "図書館で寝てはいけません",
        reading: "としょかんでねてはいけません",
        translation: "You must not sleep in the library.",
        translation_zh: "不准在图书馆睡觉。",
        difficulty: 1,
        filename: "listening_no_sleep_library",
        distractors: ["図書館で話してはいけません", "図書館で寝てもいいです", "教室で寝てはいけません"],
        level: "n5"
    },
    {
        sentence: "犬と猫とどちらが好きですか",
        reading: "いぬとねことどちらがすきですか",
        translation: "Which do you like better, dogs or cats?",
        translation_zh: "狗和猫你更喜欢哪个？",
        difficulty: 1,
        filename: "listening_dog_cat_pref",
        distractors: ["犬と猫とどちらが嫌いですか", "犬と猫が好きですか", "リンゴとバナナとどちらが好きですか"],
        level: "n5"
    },
    {
        sentence: "犬の方が好きです",
        reading: "いぬのほうがすきです",
        translation: "I like dogs better.",
        translation_zh: "我更喜欢狗。",
        difficulty: 1,
        filename: "listening_dog_pref_ans",
        distractors: ["猫の方が好きです", "犬も好きです", "犬の方が嫌いです"],
        level: "n5"
    },
    {
        sentence: "明日、雨が降ると思います",
        reading: "あした、あめがふるとおもいます",
        translation: "I think it will rain tomorrow.",
        translation_zh: "我想明天会下雨。",
        difficulty: 1,
        filename: "listening_rain_tomorrow",
        distractors: ["明日、雨が降りました", "明日、雪が降ると思います", "昨日、雨が降ったと思います"],
        level: "n5"
    },
    {
        sentence: "この料理は辛いと思います",
        reading: "このりょうりはからいとおもいます",
        translation: "I think this dish is spicy.",
        translation_zh: "我觉得这道菜很辣。",
        difficulty: 1,
        filename: "listening_dish_spicy",
        distractors: ["この料理は甘いと思います", "あの料理は辛いと思います", "この料理は辛くないと思います"],
        level: "n5"
    },
    {
        sentence: "彼、日本語が上手だと思います",
        reading: "かれ、にほんごがじょうずだとおもいます",
        translation: "I think he is good at Japanese.",
        translation_zh: "我觉得他日语很好。",
        difficulty: 1,
        filename: "listening_he_good_jp",
        distractors: ["彼、日本語が下手だと思います", "彼女、日本語が上手だと思います", "彼、日本語が上手でした"],
        level: "n5"
    },
    {
        sentence: "彼は日本人だと思います",
        reading: "かれはにほんじんだとおもいます",
        translation: "I think he is Japanese.",
        translation_zh: "我觉得他是日本人。",
        difficulty: 1,
        filename: "listening_he_japanese",
        distractors: ["彼は中国人だと思います", "彼女は日本人だと思います", "彼は日本人じゃないと思います"],
        level: "n5"
    },
    {
        sentence: "私は暇なとき映画を見ます",
        reading: "わたしはひまなときえいがをみます",
        translation: "I watch movies when I'm free.",
        translation_zh: "我有空的时候看电影。",
        difficulty: 1,
        filename: "listening_free_movie",
        distractors: ["私は忙しいとき映画を見ます", "私は暇なとき音楽を聴きます", "私は暇なとき本を読みます"],
        level: "n5"
    },
    {
        sentence: "私は寝るとき電気を消します",
        reading: "わたしはねるときでんきをけします",
        translation: "I turn off the lights when I go to sleep.",
        translation_zh: "我睡觉的时候关灯。",
        difficulty: 1,
        filename: "listening_sleep_light_off",
        distractors: ["私は寝るときテレビを消します", "私は寝るとき電気をつけます", "私は起きるとき電気を消します"],
        level: "n5"
    },
    {
        sentence: "先生は眠いときコーヒーを飲みます",
        reading: "せんせいはねむいときこーひーをのみます",
        translation: "The teacher drinks coffee when they are sleepy.",
        translation_zh: "老师困的时候喝咖啡。",
        difficulty: 1,
        filename: "listening_teacher_sleepy",
        distractors: ["先生は暇なときコーヒーを飲みます", "学生は眠いときコーヒーを飲みます", "先生は眠いときお茶を飲みます"],
        level: "n5"
    },
    {
        sentence: "あなたのカバンはどれですか？",
        reading: "あなたのかばんはどれですか？",
        translation: "Which one is your bag?",
        translation_zh: "哪个是你的包？",
        difficulty: 1,
        filename: "listening_which_bag",
        distractors: ["あなたのカバンはどこですか？", "あなたのカバンはだれですか？", "私のカバンはどれですか？"],
        level: "n5"
    },
    {
        sentence: "山田さんはどの人ですか",
        reading: "やまださんはどのひとですか",
        translation: "Which person is Mr./Ms. Yamada?",
        translation_zh: "山田是哪个人？",
        difficulty: 1,
        filename: "listening_which_person_yamada",
        distractors: ["山田さんはだれですか", "田中さんはどの人ですか", "山田さんはどこにいますか"],
        level: "n5"
    },
    {
        sentence: "あなたのお母さんはどんな人ですか",
        reading: "あなたのおかあさんはどんなひとですか",
        translation: "What kind of person is your mother?",
        translation_zh: "你妈妈是个怎样的人？",
        difficulty: 1,
        filename: "listening_what_kind_mother",
        distractors: ["あなたのお父さんはどんな人ですか", "あなたのお母さんはだれですか", "あなたのお母さんはどこですか"],
        level: "n5"
    },
    {
        sentence: "体調はどうですか？",
        reading: "たいちょうはどうですか？",
        translation: "How is your physical condition?",
        translation_zh: "身体状况怎么样？",
        difficulty: 1,
        filename: "listening_how_condition",
        distractors: ["調子はどうですか？", "気分はどうですか？", "体調はどこですか？"],
        level: "n5"
    },
    {
        sentence: "私はゲームをしないで勉強します",
        reading: "わたしはげーむをしないでべんきょうします",
        translation: "I study without playing games.",
        translation_zh: "我不玩游戏而是学习。",
        difficulty: 1,
        filename: "listening_study_no_game",
        distractors: ["私はゲームをして勉強します", "私はテレビを見ないで勉強します", "私は勉強しないでゲームをします"],
        level: "n5"
    },
    {
        sentence: "写真を撮らないでください",
        reading: "しゃしんをとらないでください",
        translation: "Please don't take pictures.",
        translation_zh: "请不要拍照。",
        difficulty: 1,
        filename: "listening_no_photo",
        distractors: ["写真を撮ってください", "タバコを吸わないでください", "ここに入らないでください"],
        level: "n5"
    },
    {
        sentence: "私は音楽を聴きながら走ります",
        reading: "わたしはおんがくをききながらはしります",
        translation: "I run while listening to music.",
        translation_zh: "我边听音乐边跑步。",
        difficulty: 1,
        filename: "listening_run_music",
        distractors: ["私は音楽を聴いて走ります", "私は歌を歌いながら走ります", "私は音楽を聴きながら歩きます"],
        level: "n5"
    },
    {
        sentence: "私は明日朝7時に起きなければなりません",
        reading: "わたしはあしたあさななじにおきなければなりません",
        translation: "I must wake up at 7 o'clock tomorrow morning.",
        translation_zh: "我明天早上7点必须起床。",
        difficulty: 1,
        filename: "listening_must_wake_up",
        distractors: ["私は明日朝7時に起きます", "私は明日朝8時に起きなければなりません", "私は今日朝7時に起きなければなりませんでした"],
        level: "n5"
    },
    {
        sentence: "私はビールを飲むと顔が赤くなる",
        reading: "わたしはびーるをのむとかおがあかくなる",
        translation: "When I drink beer, my face turns red.",
        translation_zh: "我一喝啤酒脸就会红。",
        difficulty: 1,
        filename: "listening_beer_red_face",
        distractors: ["私はお酒を飲むと顔が赤くなる", "私はビールを飲んで顔が赤くなった", "私はビールを飲むと顔が白くなる"],
        level: "n5"
    },
    {
        sentence: "もうすぐ5月になります",
        reading: "もうすぐごがつになります",
        translation: "It's almost May.",
        translation_zh: "马上就要到5月了。",
        difficulty: 1,
        filename: "listening_almost_may",
        distractors: ["もうすぐ4月になります", "もうすぐ5月でした", "もう5月になりました"],
        level: "n5"
    },
    {
        sentence: "服はユニクロで买います",
        reading: "ふくはゆにくるでかいます",
        translation: "I buy clothes at Uniqlo.",
        translation_zh: "衣服是在优衣库买的。",
        difficulty: 1,
        filename: "listening_uniqlo_clothes",
        distractors: ["服はユニクロで买いました", "靴はユニクロで买います", "服はデパートで买います"],
        level: "n5"
    },
    {
        sentence: "彼女は髪が長いですね",
        reading: "かのじょはかみがながいですね",
        translation: "She has long hair, doesn't she?",
        translation_zh: "她的头发很长呢。",
        difficulty: 1,
        filename: "listening_long_hair",
        distractors: ["彼女は背が高いですね", "彼女は髪が短いですね", "彼は髪が長いですね"],
        level: "n5"
    },
    {
        sentence: "中国は日本より大きいです",
        reading: "ちゅうごくはにほんよりおおきいです",
        translation: "China is larger than Japan.",
        translation_zh: "中国比日本大。",
        difficulty: 1,
        filename: "listening_china_japan_size",
        distractors: ["日本は中国より大きいです", "中国は日本より小さいです", "アメリカは日本より大きいです"],
        level: "n5"
    },
    {
        sentence: "私はテストの前に勉強します",
        reading: "わたしはてすとのまえにべんきょうします",
        translation: "I study before the test.",
        translation_zh: "我在考试前学习。",
        difficulty: 1,
        filename: "listening_study_before_test",
        distractors: ["私はテストの後で勉強します", "私はテストの前に休みます", "私は宿題の前に勉強します"],
        level: "n5"
    },
    {
        sentence: "私は寝る前にシャワーを浴びます",
        reading: "わたしはねるまえにしゃわーをあびます",
        translation: "I take a shower before going to sleep.",
        translation_zh: "我睡觉前洗澡。",
        difficulty: 1,
        filename: "listening_shower_before_sleep",
        distractors: ["私は寝た后でシャワーを浴びます", "私は起きた前にシャワーを浴びます", "私は寝る前に顔を洗います"],
        level: "n5"
    },
    {
        sentence: "荷物を持ちましょうか",
        reading: "にもつをもちましょうか",
        translation: "Shall I carry your luggage?",
        translation_zh: "我来帮你拿行李吧？",
        difficulty: 1,
        filename: "listening_carry_luggage",
        distractors: ["荷物を持ちますか", "カバンを持ちましょうか", "荷物を置いてください"],
        level: "n5"
    },
    {
        sentence: "一緒に映画を見ませんか",
        reading: "いっしょにえいがをみませんか",
        translation: "Would you like to watch a movie together?",
        translation_zh: "要不要一起看电影？",
        difficulty: 1,
        filename: "listening_watch_movie_together",
        distractors: ["一緒に映画を見ましょう", "一緒にご飯を食べませんか", "一人で映画を見ませんか"],
        level: "n5"
    },
    {
        sentence: "私は夜9時まで寝ます",
        reading: "わたしはやきゅうじまでねます",
        translation: "I sleep until 9 PM.",
        translation_zh: "我睡到晚上9点。",
        difficulty: 1,
        filename: "listening_sleep_until_9",
        distractors: ["私は夜9時に寝ます", "私は夜10时まで寝ます", "私は夜9時までに寝ます"],
        level: "n5"
    },
    {
        sentence: "私は夜9時までに寝ます",
        reading: "わたしはやきゅうじまでにねます",
        translation: "I will go to bed by 9 PM.",
        translation_zh: "我会在晚上9点前睡觉。",
        difficulty: 1,
        filename: "listening_sleep_by_9",
        distractors: ["私は夜9時まで寝ます", "私は夜10时までに寝ます", "私は夜9時に寝ます"],
        level: "n5"
    },
    {
        sentence: "これは私の花です",
        reading: "これはわたしのはなです",
        translation: "This is my flower.",
        translation_zh: "这是我的花。",
        difficulty: 1,
        filename: "listening_my_flower",
        distractors: ["それは私の花です", "あれは私の花です", "これは私の本です"],
        level: "n5"
    },
    {
        sentence: "これは高い花です",
        reading: "これはたかいはなです",
        translation: "This is an expensive flower.",
        translation_zh: "这是昂贵的花。",
        difficulty: 1,
        filename: "listening_expensive_flower",
        distractors: ["これは安い花です", "これは赤い花です", "あれは高い花です"],
        level: "n5"
    },
    {
        sentence: "これは綺麗な花です",
        reading: "これはきれいなはなです",
        translation: "This is a beautiful flower.",
        translation_zh: "这是漂亮的花。",
        difficulty: 1,
        filename: "listening_beautiful_flower",
        distractors: ["これは有名な花です", "これは大きな花です", "これは綺麗じゃありません"],
        level: "n5"
    },
    {
        sentence: "これは私が買った花です",
        reading: "これはわたしがかったはなです",
        translation: "This is the flower that I bought.",
        translation_zh: "这是我买的花。",
        difficulty: 1,
        filename: "listening_bought_flower",
        distractors: ["これは私がもらった花です", "あれは私が買った花です", "これは君が買った花です"],
        level: "n5"
    },
    {
        sentence: "私は図書館で借りた本を読みます",
        reading: "わたしはとしょかんでかりたほんをよみます",
        translation: "I read the book I borrowed from the library.",
        translation_zh: "我读在图书馆借的书。",
        difficulty: 1,
        filename: "listening_borrowed_book_read",
        distractors: ["私は図書館で買った本を読みます", "私は図書館で借りた本を返します", "私は図書館で借りた雑誌を読みます"],
        level: "n5"
    },
    {
        sentence: "私は図書館で借りた本が読みたいです",
        reading: "わたしはとしょかんでかりたほんがよみたいです",
        translation: "I want to read the book I borrowed from the library.",
        translation_zh: "我想读在图书馆借的书。",
        difficulty: 1,
        filename: "listening_borrowed_book_want",
        distractors: ["私は図書館で借りた本を読みました", "私は図書館で借りた本を読みたくないです", "私は図書館で借りた本が読みたかったです"],
        level: "n5"
    },
    {
        sentence: "2月14日はバレンタインデーです",
        reading: "にがつじゅうよっかはばれんたいんでーです",
        translation: "February 14th is Valentine's Day.",
        translation_zh: "2月14日是情人节。",
        difficulty: 1,
        filename: "listening_valentine",
        distractors: ["2月14日は私の誕生日です", "3月14日はバレンタインデーです", "2月14日は休日です"],
        level: "n5"
    },
    {
        sentence: "私は7時半に起きます",
        reading: "わたしはしちじはんにおきます",
        translation: "I wake up at 7:30.",
        translation_zh: "我7点半起床。",
        difficulty: 1,
        filename: "listening_up_7_30",
        distractors: ["私は8时半に起きます", "私は7時半に寝ます", "私は7時に起きます"],
        level: "n5"
    }
];

async function main() {
    console.log("Starting listening data generation...");
    let sql = "";

    for (const q of questions) {
        try {
            console.log(`Processing: ${q.sentence} (${q.level})`);
            const audioFilename = q.filename;

            // Step 1: Generate Audio in level subdirectory
            await generateAudio(q.sentence, `listening/${q.level}/${audioFilename}`);

            // Step 2: Build SQL with level subdirectory in URL
            const audioUrl = `/audio/listening/${q.level}/${audioFilename}.mp3`;
            const escapedSentence = q.sentence.replace(/'/g, "''");
            const escapedReading = q.reading.replace(/'/g, "''");
            const escapedTranslation = q.translation.replace(/'/g, "''");
            const escapedTranslationZh = q.translation_zh.replace(/'/g, "''");
            const escapedDistractors = q.distractors.map(d => `'${d.replace(/'/g, "''")}'`).join(",");

            sql += `INSERT INTO listening_questions (sentence, reading, translation, translation_zh, audio_url, distractors, difficulty)
VALUES ('${escapedSentence}', '${escapedReading}', '${escapedTranslation}', '${escapedTranslationZh}', '${audioUrl}', ARRAY[${escapedDistractors}], ${q.difficulty});\n`;

        } catch (error) {
            console.error(`Failed to process: ${q.sentence}`, error);
        }
    }

    fs.writeFileSync("supabase/listening_seed.sql", sql);
    console.log("Generation complete! SQL saved to supabase/listening_seed.sql");
}

main();
