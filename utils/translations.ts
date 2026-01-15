
export type Language = 'English' | 'Chinese';

export const translations = {
    English: {
        // Header
        dashboard: 'Dashboard',
        progress: 'Progress',
        settings: 'Settings',
        study_title: 'JLPT Study',

        // Dashboard
        proficiency_level: 'Select Proficiency Level',
        daily_goal: 'Daily goal',
        minutes_completed: 'minutes completed',
        kanji: 'Kanji',
        kanji_desc: 'Master the brush strokes and meanings of essential characters.',
        kanji_btn: 'Start Kanji',
        vocabulary: 'Vocabulary',
        vocabulary_desc: 'Build your lexicon with core words for your level.',
        vocabulary_btn: 'Start Practice',
        grammar: 'Grammar',
        grammar_desc: 'Build complex structures and understand particle usage.',
        grammar_btn: 'Start Learning',
        listening: 'Listening',
        listening_desc: 'Improve comprehension with native audio exercises.',
        listening_btn: 'Start Session',

        // Progress
        your_journey: 'Your Journey',
        preparation: 'preparation',
        streak: 'Day Streak',
        overall_completion: 'Overall Completion',
        mastered: 'Mastered!',
        almost_there: 'Almost there! Keep pushing.',
        ready_for_today: 'Ready for today?',
        practice_key: 'Consistent daily practice is the key to Japanese language retention.',
        review_items: 'Review items',
        approx: 'Approx.',
        minutes: 'minutes',
        total_items: 'Total items',
        mastery_points: 'Mastery points',
        jlpt_milestones: 'JLPT Milestones',

        // Kanji/Quiz Common
        practice_session: 'Practice Session',
        writing_area: 'Writing Area',
        clear: 'Clear',
        check_answer: 'Check Answer',
        next_question: 'Next Question',
        draw: 'Draw',
        meaning: 'Meaning',
        quit_practice: 'Quit Practice',
        sensei_explains: 'Sensei Explains',
        finish: 'Finish',

        // Settings
        account: 'Account',
        font_preference: 'Font Preference',
        accent_color: 'Accent Color',
        preferred_language: 'Preferred Language',
        notifications: 'Notifications',
        save_all: 'Save All Changes',
        cancel: 'Cancel',
        save_success: 'Settings saved successfully!',
        save_error: 'Failed to save settings.',
        email_address: 'Email Address',
        language_hint: 'This language will be used for hints, translations, and AI-powered explanations from Sensei.'
    },
    Chinese: {
        // Header
        dashboard: '仪表板',
        progress: '学习进度',
        settings: '设置',
        study_title: 'JLPT 学习',

        // Dashboard
        proficiency_level: '选择等级',
        daily_goal: '每日目标',
        minutes_completed: '分钟已完成',
        kanji: '汉字',
        kanji_desc: '掌握基本汉字的笔画和含义。',
        kanji_btn: '开始练习',
        vocabulary: '词汇',
        vocabulary_desc: '根据您的水平构建核心词汇库。',
        vocabulary_btn: '开始练习',
        grammar: '语法',
        grammar_desc: '构建复杂句式并理解助词用法。',
        grammar_btn: '开始学习',
        listening: '听力',
        listening_desc: '通过原声听力练习提高理解能力。',
        listening_btn: '开始练习',

        // Progress
        your_journey: '你的学习历程',
        preparation: '备考',
        streak: '天连续学习',
        overall_completion: '总体完成度',
        mastered: '已掌握！',
        almost_there: '快到了！继续努力。',
        ready_for_today: '准备好今天的练习了吗？',
        practice_key: '持之以恒的每日练习是掌握日语的关键。',
        review_items: '复习项目',
        approx: '预计',
        minutes: '分钟',
        total_items: '项目总数',
        mastery_points: '掌握分数',
        jlpt_milestones: 'JLPT 里程碑',

        // Kanji/Quiz Common
        practice_session: '练习环节',
        writing_area: '手写区域',
        clear: '清除',
        check_answer: '检查答案',
        next_question: '下一题',
        draw: '书写',
        meaning: '含义',
        quit_practice: '退出练习',
        sensei_explains: '老师讲解',
        finish: '完成',

        // Settings
        account: '账户',
        font_preference: '字体偏好',
        accent_color: '主题颜色',
        preferred_language: '首选语言',
        notifications: '通知设置',
        save_all: '保存所有更改',
        cancel: '取消',
        save_success: '设置保存成功！',
        save_error: '保存设置失败。',
        email_address: '电子邮件地址',
        language_hint: '此语言将用于 Sensei 的提示、翻译和 AI 讲解。'
    }
};
