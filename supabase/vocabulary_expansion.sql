-- Extensive Vocabulary Seed Data for N5-N1
-- This script adds more diverse words to each level

INSERT INTO vocabulary (level, word, reading, meaning, sentence, sentence_translation, distractors) VALUES
-- N5 (Beginner)
('N5', '会社員', 'かいしゃいん', 'office worker', '父は（　　）です。', 'My father is an office worker.', ARRAY['医者', '先生', '学生']),
('N5', '飲み物', 'のみもの', 'drink', '冷たい（　　）が欲しいです。', 'I want a cold drink.', ARRAY['食べ物', '乗り物', '買い物']),
('N5', '写真', 'しゃしん', 'photo', 'ここで（　　）を撮ってもいいですか。', 'May I take a photo here?', ARRAY['映画', '手紙', '地図']),
('N5', '時計', 'とけい', 'clock/watch', '机の上に（　　）があります。', 'There is a clock on the desk.', ARRAY['辞書', '財布', '眼鏡']),
('N5', '週末', 'しゅうまつ', 'weekend', '（　　）はいつも何をしますか。', 'What do you usually do on weekends?', ARRAY['昨日', '平日', '今月']),
('N5', '散歩', 'さんぽ', 'walk', '公園で（　　）をします。', 'I take a walk in the park.', ARRAY['運動', '勉強', '料理']),
('N5', '天気', 'てんき', 'weather', '今日はいい（　　）ですね。', 'Beautiful weather today, isn''t it?', ARRAY['季節', '気温', '空']),
('N5', '病院', 'びょういん', 'hospital', '風邪をひいたので（　　）へ行きます。', 'I have a cold, so I''m going to the hospital.', ARRAY['銀行', '郵便局', '大使館']),
('N5', '便利', 'べんり', 'convenient', 'このアプリはとても（　　）です。', 'This app is very convenient.', ARRAY['難しい', '重い', '有名']),
('N5', '練習', 'れんしゅう', 'practice', 'ピアノの（　　）を毎日します。', 'I practice the piano every day.', ARRAY['宿題', '授業', '試験']),

-- N4 (Upper Beginner)
('N4', '経験', 'けいけん', 'experience', '海外で働いた（　　）がありますか。', 'Do you have experience working abroad?', ARRAY['景色', '計画', '研究']),
('N4', '反対', 'はんたい', 'opposite/opposition', '彼の意見には（　　）です。', 'I am opposed to his opinion.', ARRAY['賛成', '注意', '相談']),
('N4', '準備', 'じゅんび', 'preparation', '旅行の（　　）はもう終わりましたか。', 'Are the preparations for the trip finished?', ARRAY['意味', '期待', '約束']),
('N4', '習慣', 'しゅうかん', 'habit/custom', '早起きは健康にいい（　　）です。', 'Getting up early is a healthy habit.', ARRAY['様子', '性格', '目的']),
('N4', '相談', 'そうだん', 'consultation/advice', '進路について先生に（　　）する。', 'Consult the teacher about my future path.', ARRAY['報告', '連絡', '注文']),
('N4', '技術', 'ぎじゅつ', 'technology/skill', '新しい（　　）を学ぶのは楽しい。', 'Learning new technology is fun.', ARRAY['芸術', '方法', '目標']),
('N4', '規則', 'きそく', 'rule', '学校の（　　）を守りましょう。', 'Let''s follow the school rules.', ARRAY['自由', '法律', '命令']),
('N4', '複雑', 'ふくざつ', 'complicated', 'この機械の操作はとても（　　）だ。', 'The operation of this machine is very complicated.', ARRAY['簡単', '丁寧', '安全']),
('N4', '残念', 'ざんねん', 'regrettable/pity', 'パーティーに行けなくて（　　）です。', 'It''s a pity I can''t go to the party.', ARRAY['心配', '迷惑', '不思議']),
('N4', '理由', 'りゆう', 'reason', '彼が遅れた（　　）を知っていますか。', 'Do you know the reason why he was late?', ARRAY['原因', '目的', '秘密']),

-- N3 (Intermediate)
('N3', '意識', 'いしき', 'consciousness/awareness', '環境問題に対する（　　）を高める。', 'Raise awareness about environmental issues.', ARRAY['知識', '意志', '感想']),
('N3', '発展', 'はってん', 'development', 'この町は急速に（　　）している。', 'This town is developing rapidly.', ARRAY['進行', '拡大', '成長']),
('N3', '調整', 'ちょうせい', 'adjustment', 'スケジュールの（　　）をお願いします。', 'Please adjust the schedule.', ARRAY['整理', '解決', '判断']),
('N3', '役割', 'やくわり', 'role', '自分の（　　）をしっかり果たしてください。', 'Please fulfill your role properly.', ARRAY['職業', '身分', '期待']),
('N3', '対象', 'たいしょう', 'target/subject', 'この本は子供を（　　）に書かれている。', 'This book is written for children.', ARRAY['内容', '目的', '分野']),
('N3', '状況', 'じょうきょう', 'situation', '現場の（　　）を確認してください。', 'Please confirm the situation at the scene.', ARRAY['状態', '背景', '事実']),
('N3', '供給', 'きゅうきゅう', 'supply', '需要と（　　）のバランスが大切だ。', 'The balance of demand and supply is important.', ARRAY['提供', '販売', '消費']),
('N3', '及ぼす', 'およぼす', 'to exert/influence', 'その決定は大きな影響を（　　）。', 'That decision will have a major influence.', ARRAY['当たる', '伝える', '与える']),
('N3', '検討', 'けんとう', 'consideration/examination', '今後の対策を（　　）しています。', 'We are considering future measures.', ARRAY['検索', '検査', '実験']),
('N3', '具体的', 'ぐたいてき', 'concrete/specific', '（　　）な計画を立てる。', 'Make a concrete plan.', ARRAY['抽象的', '積極的', '基本的']),

-- N2 (Upper Intermediate)
('N2', '包括的', 'ほうかつてき', 'comprehensive', '（　　）な支援策が必要です。', 'Comprehensive support measures are needed.', ARRAY['具体的な', '断続的な', '形式的な']),
('N2', '妥協', 'だきょう', 'compromise', '品質に関しては一切（　　）しません。', 'We do not compromise on quality at all.', ARRAY['納得', '譲歩', '抵抗']),
('N2', '鮮明', 'せんめい', 'vivid/clear', '当時の記憶が（　　）に残っている。', 'The memories of that time remain vivid.', ARRAY['透明', '明瞭', '詳細']),
('N2', '懸念', 'けねん', 'concern/worry', 'さらなる物価上昇が（　　）される。', 'Further price increases are concerned.', ARRAY['期待', '疑問', '批判']),
('N2', '効率', 'こうりつ', 'efficiency', '（　　）よく作業を進める。', 'Proceed with the work efficiently.', ARRAY['効果', '能力', '機能']),
('N2', '貢献', 'こうけん', 'contribution', '地域社会に（　　）活動を行う。', 'Conduct activities that contribute to the local community.', ARRAY['寄付', '協力', '参加']),
('N2', '把握', 'はあく', 'grasp/understand', '現状を正確に（　　）する必要がある。', 'It is necessary to accurately grasp the current situation.', ARRAY['掌握', '理解', '確認']),
('N2', '頻繁', 'ひんぱん', 'frequent', '彼は（　　）に図書館を利用している。', 'He frequently uses the library.', ARRAY['時々', '常に', '早急']),
('N2', '背景', 'はいけい', 'background', '事件の（　　）を調査する。', 'Investigate the background of the incident.', ARRAY['風景', '裏面', '舞台']),
('N2', '維持', 'いじ', 'maintenance/preservation', '現状を（　　）するのは難しい。', 'It is difficult to maintain the status quo.', ARRAY['保存', '継続', '管理']),

-- N1 (Advanced)
('N1', '姑息', 'こそく', 'makeshift/mean', '（　　）な手段を使うのはやめるべきだ。', 'You should stop using makeshift/temporary measures.', ARRAY['卑怯', '安易', '巧妙']),
('N1', '脆弱', 'ぜいじゃく', 'fragile/vulnerable', 'このシステムのセキュリティは（　　）だ。', 'The security of this system is vulnerable.', ARRAY['粗末', '貧弱', '危うい']),
('N1', '示唆', 'しさ', 'suggestion/hint', 'その結果は重要な事実を（　　）している。', 'The result suggests an important fact.', ARRAY['提示', '明示', '暗示']),
('N1', '典型', 'てんけい', 'typical', 'これは（　　）な過労死の例だ。', 'This is a typical example of death from overwork.', ARRAY['標準', '代表', '象徴']),
('N1', '逸脱', 'いつだつ', 'deviation', '常識を（　　）した行動をとる。', 'Take action that deviates from common sense.', ARRAY['脱退', '逸した', '解雇']),
('N1', '享受', 'きょうじゅ', 'enjoyment/receipt', '平和の恩恵を（　　）する。', 'Enjoy the benefits of peace.', ARRAY['教授', '受注', '取得']),
('N1', '葛藤', 'かっとう', 'conflict/complication', '心の中に（　　）を抱えている。', 'Having a conflict within one''s heart.', ARRAY['摩擦', '困惑', '苦悩']),
('N1', '包括', 'ほうかつ', 'comprehensive/inclusive', '（　　）的な契約を結ぶ。', 'Sign a comprehensive contract.', ARRAY['包囲', '包括的', '全体']),
('N1', '俯瞰', 'ふかん', 'bird''s-eye view', '物事を（　　）的な視点で捉える。', 'Look at things from a bird''s-eye view.', ARRAY['客観', '全体', '遠方']),
('N1', '醍醐味', 'だいごみ', 'real pleasure/zest', '旅の（　　）は人との出会いにある。', 'The real pleasure of travel lies in meeting people.', ARRAY['楽しみ', '面白さ', '意義']);
