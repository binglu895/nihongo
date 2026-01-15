-- Add Chinese columns to vocabulary
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS meaning_zh TEXT;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS sentence_translation_zh TEXT;

-- Update N5 Vocabulary
UPDATE vocabulary SET meaning_zh = '公司职员', sentence_translation_zh = '我父亲是公司职员。' WHERE word = '会社員';
UPDATE vocabulary SET meaning_zh = '饮料', sentence_translation_zh = '我想要冰凉的饮料。' WHERE word = '飲み物';
UPDATE vocabulary SET meaning_zh = '照片', sentence_translation_zh = '可以在这里拍照吗？' WHERE word = '写真';
UPDATE vocabulary SET meaning_zh = '时钟/手表', sentence_translation_zh = '桌子上有一个时钟。' WHERE word = '時計';
UPDATE vocabulary SET meaning_zh = '周末', sentence_translation_zh = '周末通常做什么？' WHERE word = '週末';
UPDATE vocabulary SET meaning_zh = '散步', sentence_translation_zh = '在公园里散步。' WHERE word = '散歩';
UPDATE vocabulary SET meaning_zh = '天气', sentence_translation_zh = '今天天气真好啊。' WHERE word = '天気';
UPDATE vocabulary SET meaning_zh = '医院', sentence_translation_zh = '因为感冒了，所以去医院。' WHERE word = '病院';
UPDATE vocabulary SET meaning_zh = '便利/方便', sentence_translation_zh = '这个应用非常方便。' WHERE word = '便利';
UPDATE vocabulary SET meaning_zh = '练习', sentence_translation_zh = '每天都练习钢琴。' WHERE word = '練習';

-- Update N4 Vocabulary
UPDATE vocabulary SET meaning_zh = '经验', sentence_translation_zh = '有在海外工作的经验吗？' WHERE word = '経験';
UPDATE vocabulary SET meaning_zh = '反对', sentence_translation_zh = '我反对他的意见。' WHERE word = '反対';
UPDATE vocabulary SET meaning_zh = '准备', sentence_translation_zh = '旅行的准备已经结束了吗？' WHERE word = '準備';
UPDATE vocabulary SET meaning_zh = '习惯', sentence_translation_zh = '早起是对比健康有益的习惯。' WHERE word = '習慣';
UPDATE vocabulary SET meaning_zh = '咨询/商量', sentence_translation_zh = '关于出路向老师咨询。' WHERE word = '相談';
UPDATE vocabulary SET meaning_zh = '技术', sentence_translation_zh = '学习新技术很有趣。' WHERE word = '技術';
UPDATE vocabulary SET meaning_zh = '规则', sentence_translation_zh = '让我们遵守学校的规则吧。' WHERE word = '規則';
UPDATE vocabulary SET meaning_zh = '复杂', sentence_translation_zh = '这个机器的操作非常复杂。' WHERE word = '複雑';
UPDATE vocabulary SET meaning_zh = '遗憾', sentence_translation_zh = '不能去参加派对很遗憾。' WHERE word = '残念';
UPDATE vocabulary SET meaning_zh = '理由', sentence_translation_zh = '你知道他迟到的理由吗？' WHERE word = '理由';

-- Update N3 Vocabulary
UPDATE vocabulary SET meaning_zh = '意识/觉悟', sentence_translation_zh = '提高对环境问题的意识。' WHERE word = '意識';
UPDATE vocabulary SET meaning_zh = '发展', sentence_translation_zh = '这个小镇正在急速发展。' WHERE word = '発展';
UPDATE vocabulary SET meaning_zh = '调整', sentence_translation_zh = '请调整一下日程。' WHERE word = '調整';
UPDATE vocabulary SET meaning_zh = '角色/职责', sentence_translation_zh = '请好好履行自己的职责。' WHERE word = '役割';
UPDATE vocabulary SET meaning_zh = '对象', sentence_translation_zh = '这本书是为孩子们写的。' WHERE word = '対象';
UPDATE vocabulary SET meaning_zh = '状况', sentence_translation_zh = '请确认现场的情况。' WHERE word = '状況';
UPDATE vocabulary SET meaning_zh = '供给', sentence_translation_zh = '需求和供给的平衡很重要。' WHERE word = '供給';
UPDATE vocabulary SET meaning_zh = '波及/影响', sentence_translation_zh = '那个决定会产生巨大的影响。' WHERE word = '及ぼす';
UPDATE vocabulary SET meaning_zh = '探讨/研究', sentence_translation_zh = '正在探讨今后的对策。' WHERE word = '検討';
UPDATE vocabulary SET meaning_zh = '具体的', sentence_translation_zh = '制定一个具体的计划。' WHERE word = '具体的';

-- Update N2 Vocabulary
UPDATE vocabulary SET meaning_zh = '综合的/全面的', sentence_translation_zh = '需要全面的支援对策。' WHERE word = '包括的';
UPDATE vocabulary SET meaning_zh = '妥协', sentence_translation_zh = '关于质量问题，我们绝不妥协。' WHERE word = '妥協';
UPDATE vocabulary SET meaning_zh = '鲜明', sentence_translation_zh = '当时的记忆鲜明地留在脑海里。' WHERE word = '鮮明';
UPDATE vocabulary SET meaning_zh = '担忧/挂念', sentence_translation_zh = '担忧物价会进一步上涨。' WHERE word = '懸念';
UPDATE vocabulary SET meaning_zh = '效率', sentence_translation_zh = '高效率地进行作业。' WHERE word = '効率';
UPDATE vocabulary SET meaning_zh = '贡献', sentence_translation_zh = '开展对地域社会有贡献的活动。' WHERE word = '貢献';
UPDATE vocabulary SET meaning_zh = '把握/掌握', sentence_translation_zh = '有必要准确把握现状。' WHERE word = '把握';
UPDATE vocabulary SET meaning_zh = '频繁', sentence_translation_zh = '他频繁地利用图书馆。' WHERE word = '頻繁';
UPDATE vocabulary SET meaning_zh = '背景', sentence_translation_zh = '调查事件的背景。' WHERE word = '背景';
UPDATE vocabulary SET meaning_zh = '维持', sentence_translation_zh = '维持现状很难。' WHERE word = '維持';

-- Update N1 Vocabulary
UPDATE vocabulary SET meaning_zh = '姑息/敷衍', sentence_translation_zh = '应该停止使用敷衍的手段。' WHERE word = '姑息';
UPDATE vocabulary SET meaning_zh = '脆弱', sentence_translation_zh = '这个系统的安全性很脆弱。' WHERE word = '脆弱';
UPDATE vocabulary SET meaning_zh = '暗示/启发', sentence_translation_zh = '那个结果暗示了一个重要的事实。' WHERE word = '示唆';
UPDATE vocabulary SET meaning_zh = '典型', sentence_translation_zh = '这是典型的过劳死例子。' WHERE word = '典型';
UPDATE vocabulary SET meaning_zh = '逸脱/偏离', sentence_translation_zh = '采取偏离常识的行动。' WHERE word = '逸脱';
UPDATE vocabulary SET meaning_zh = '享受', sentence_translation_zh = '享受和平的恩惠。' WHERE word = '享受';
UPDATE vocabulary SET meaning_zh = '葛藤/纠结', sentence_translation_zh = '内心深处怀着纠结。' WHERE word = '葛藤';
UPDATE vocabulary SET meaning_zh = '包括/囊括', sentence_translation_zh = '签订囊括性的合同。' WHERE word = '包括';
UPDATE vocabulary SET meaning_zh = '俯瞰/鸟瞰', sentence_translation_zh = '从鸟瞰的视角把握事物。' WHERE word = '俯瞰';
UPDATE vocabulary SET meaning_zh = '醍醐味/妙处', sentence_translation_zh = '旅行的妙处在于与人的相遇。' WHERE word = '醍醐味';
