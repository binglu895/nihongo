-- Update remaining vocabulary with Chinese content
-- These are the words from the initial vocabulary_seed.sql

-- N5
UPDATE vocabulary SET meaning_zh = '学生', sentence_translation_zh = '我是学生。' WHERE word = '学生';
UPDATE vocabulary SET meaning_zh = '吃', sentence_translation_zh = '吃苹果。' WHERE word = '食べる';
UPDATE vocabulary SET meaning_zh = '今天', sentence_translation_zh = '今天天气很好。' WHERE word = '今日';

-- N4
UPDATE vocabulary SET meaning_zh = '考试', sentence_translation_zh = '下周有一个大考试。' WHERE word = '試験';
UPDATE vocabulary SET meaning_zh = '便利/方便', sentence_translation_zh = '这个工具非常便利。' WHERE word = '便利' AND meaning = 'convenient';
UPDATE vocabulary SET meaning_zh = '理由', sentence_translation_zh = '请告诉我缺勤的理由。' WHERE word = '理由' AND meaning = 'reason';

-- N3
UPDATE vocabulary SET meaning_zh = '摘要/总结', sentence_translation_zh = '请总结昨天会议的内容。' WHERE word = '要約';
UPDATE vocabulary SET meaning_zh = '招牌/看版', sentence_translation_zh = '路边立着招牌。' WHERE word = '看板';
UPDATE vocabulary SET meaning_zh = '技术', sentence_translation_zh = '日本的科学技术非常出色。' WHERE word = '技術' AND meaning = 'technology / skill';

-- N2
UPDATE vocabulary SET meaning_zh = '珍贵/宝贵', sentence_translation_zh = '那是次非常宝贵的体验。' WHERE word = '貴重';
UPDATE vocabulary SET meaning_zh = '理解/领会', sentence_translation_zh = '我领会了他的解释。' WHERE word = '納得';
UPDATE vocabulary SET meaning_zh = '环境', sentence_translation_zh = '保护环境很重要。' WHERE word = '環境';

-- N1
UPDATE vocabulary SET meaning_zh = '把握/掌握', sentence_translation_zh = '有必要准确掌握现状。' WHERE word = '把握' AND meaning = 'grasp / understand';
UPDATE vocabulary SET meaning_zh = '谦虚', sentence_translation_zh = '他是一个非常谦虚的人。' WHERE word = '謙虚';
UPDATE vocabulary SET meaning_zh = '矛盾', sentence_translation_zh = '他的话里有矛盾。' WHERE word = '矛盾';
