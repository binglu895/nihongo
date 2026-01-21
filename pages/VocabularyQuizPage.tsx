
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getExplanation } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { addXP, XP_VALUES } from '../services/gamificationService';

const VocabularyQuizPage: React.FC = () => {
    const navigate = useNavigate();
    const [sessionStartTime] = useState(Date.now());
    const [answered, setAnswered] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentLevel, setCurrentLevel] = useState('N5');
    const [preferredLang, setPreferredLang] = useState('English');
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [overallProgress, setOverallProgress] = useState({ learned: 0, total: 0 });
    const [totalDueToday, setTotalDueToday] = useState(0);
    const [reviewedTodayCount, setReviewedTodayCount] = useState(0);
    const [failedIdsInSession] = useState<Set<string>>(new Set());
    const [lastGainedXP, setLastGainedXP] = useState<number | null>(null);
    const [xpNotificationKey, setXpNotificationKey] = useState(0);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const initQuiz = async () => {
            setLoading(true);
            const mode = searchParams.get('mode');
            setIsReviewMode(mode === 'review');

            const { level, goal } = await fetchUserLevel();
            await fetchQuestions(level, goal, mode === 'review');
            await fetchGlobalProgress(level);
            setLoading(false);
        };
        initQuiz();
    }, [searchParams]);

    const fetchUserLevel = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('current_level, preferred_language, daily_goal')
                .eq('id', user.id)
                .single();
            const level = data?.current_level || 'N5';
            const goal = data?.daily_goal || 20;
            setCurrentLevel(level);
            setPreferredLang(data?.preferred_language || 'English');
            return { level, goal };
        }
        return { level: 'N5', goal: 20 };
    };

    const fetchGlobalProgress = async (level: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch total vocabulary for this level
        const { count: total } = await supabase
            .from('vocabulary')
            .select('id', { count: 'exact', head: true })
            .eq('level', level);

        // Fetch learned vocabulary for this level
        // We join with the vocabulary table to ensure we only count items from the current level
        const { count: learned } = await supabase
            .from('user_vocabulary_progress')
            .select('vocabulary_id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gt('correct_count', 0)
            .in('vocabulary_id',
                (await supabase.from('vocabulary').select('id').eq('level', level)).data?.map(v => v.id) || []
            );

        setOverallProgress({ learned: learned || 0, total: total || 0 });
    };

    const fetchQuestions = async (level: string, goal: number, isReview: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const now = new Date().toISOString();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        if (isReview) {
            // 1. Fetch items due for review
            const { data: dueProgress } = await supabase
                .from('user_vocabulary_progress')
                .select('vocabulary_id, next_review_at, srs_stage')
                .eq('user_id', user.id)
                .lte('next_review_at', now);

            // 2. Fetch items already completed today
            const { count: completedToday } = await supabase
                .from('user_vocabulary_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('last_reviewed_at', todayStart.toISOString())
                .gt('next_review_at', now);

            setReviewedTodayCount(completedToday || 0);
            setTotalDueToday((dueProgress?.length || 0) + (completedToday || 0));

            if (dueProgress && dueProgress.length > 0) {
                const ids = dueProgress.map(p => p.vocabulary_id);
                const { data: vocabulary } = await supabase.from('vocabulary').select('*').in('id', ids);

                if (vocabulary) {
                    const combined = vocabulary.map(v => {
                        const progress = dueProgress.find(p => p.vocabulary_id === v.id);
                        return {
                            ...v,
                            options: [...(v.distractors || []), v.word].sort(() => Math.random() - 0.5),
                            next_review_at: progress?.next_review_at,
                            srs_stage: progress?.srs_stage
                        };
                    });
                    // Sort by next_review_at (most overdue first), then by srs_stage (lower first)
                    combined.sort((a, b) => {
                        const dateA = new Date(a.next_review_at).getTime();
                        const dateB = new Date(b.next_review_at).getTime();
                        if (dateA !== dateB) return dateA - dateB;
                        return (a.srs_stage || 0) - (b.srs_stage || 0);
                    });
                    setQuestions(combined);
                }
            }
        } else {
            // Learning Mode
            // Get learned IDs for THIS level only
            const { data: learnedProgress } = await supabase
                .from('user_vocabulary_progress')
                .select('vocabulary_id')
                .eq('user_id', user.id)
                .gt('correct_count', 0);

            const learnedIds = learnedProgress?.map(p => p.vocabulary_id) || [];

            let query = supabase.from('vocabulary').select('*').eq('level', level);
            if (learnedIds.length > 0) {
                query = query.not('id', 'in', learnedIds);
            }

            const { data } = await query.limit(goal);
            if (data) {
                setQuestions(data.map(v => ({
                    ...v,
                    options: [...(v.distractors || []), v.word].sort(() => Math.random() - 0.5)
                })));
            }
        }
    };

    const updateSRS = async (isCorrect: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const currentQuestion = questions[currentQuestionIdx];
        const { data: existing } = await supabase
            .from('user_vocabulary_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('vocabulary_id', currentQuestion.id)
            .single();

        let srs_stage = existing?.srs_stage || 0;
        let ease_factor = existing?.ease_factor || 2.5;
        let interval = existing?.interval || 0;

        if (isCorrect) {
            if (failedIdsInSession.has(currentQuestion.id)) {
                interval = 1;
                srs_stage = 1;
            } else {
                if (srs_stage === 0) interval = 1;
                else if (srs_stage === 1) interval = 6;
                else interval = Math.round(interval * ease_factor);
                srs_stage++;
                ease_factor = Math.min(2.5, ease_factor + 0.1);
            }
        } else {
            srs_stage = 1;
            interval = 0;
            ease_factor = Math.max(1.3, ease_factor - 0.2);
        }

        const next_review_at = new Date();
        next_review_at.setDate(next_review_at.getDate() + interval);

        const updateData = {
            user_id: user.id,
            vocabulary_id: currentQuestion.id,
            srs_stage,
            ease_factor,
            interval,
            next_review_at: next_review_at.toISOString(),
            last_reviewed_at: new Date().toISOString(),
            [isCorrect ? 'correct_count' : 'incorrect_count']: (existing?.[isCorrect ? 'correct_count' : 'incorrect_count'] || 0) + 1
        };

        if (existing) {
            await supabase.from('user_vocabulary_progress').update(updateData).eq('id', existing.id);
        } else {
            await supabase.from('user_vocabulary_progress').insert(updateData);
        }

        if (isCorrect && !failedIdsInSession.has(currentQuestion.id)) {
            if (isReviewMode) setReviewedTodayCount(prev => prev + 1);
        }
    };

    const handleSelect = async (idx: number) => {
        if (answered) return;
        setAnswered(true);
        setSelectedIdx(idx);

        const isCorrect = questions[currentQuestionIdx].options[idx] === questions[currentQuestionIdx].word;
        await updateSRS(isCorrect);

        if (isCorrect) {
            const res = await addXP('VOCABULARY', 0);
            if (res) {
                setLastGainedXP(res.xpGained);
                setXpNotificationKey(prev => prev + 1);
            }
        } else {
            failedIdsInSession.add(questions[currentQuestionIdx].id);
            // Re-queue
            setQuestions(prev => [...prev, questions[currentQuestionIdx]]);
        }
    };

    const handleNext = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setAnswered(false);
            setSelectedIdx(null);
            setExplanation(null);
        } else {
            navigate('/dashboard');
        }
    };

    const currentQuestion = questions[currentQuestionIdx];

    if (loading) return <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 text-charcoal dark:text-white">Loading...</div>;

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="size-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                        <span className="material-symbols-outlined !text-6xl text-emerald-600 dark:text-emerald-400">celebration</span>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-charcoal dark:text-white tracking-tight">
                            {isReviewMode ? 'All Caught Up!' : 'Level Mastered!'}
                        </h2>
                        <p className="text-ghost-grey dark:text-slate-400 font-medium text-lg leading-relaxed">
                            {isReviewMode
                                ? "You've finished all your vocabulary reviews for today. Check back later!"
                                : `You've mastered all vocabulary in ${currentLevel}. Great job!`}
                        </p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="w-full py-5 bg-primary text-white font-black rounded-[24px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-charcoal dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
            <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: isReviewMode ? `${totalDueToday > 0 ? (reviewedTodayCount / totalDueToday) * 100 : 0}%` : `${questions.length > 0 ? ((currentQuestionIdx + 1) / questions.length) * 100 : 0}%` }}></div>
                </div>
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-ghost-grey hover:text-primary transition-colors font-bold text-sm">
                        <span className="material-symbols-outlined !text-xl">arrow_back</span>
                        <span>Exit</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost-grey">
                            {isReviewMode ? 'Reviewing Daily Vocab' : 'Building Vocabulary'}
                        </div>
                        <div className="text-[10px] font-bold text-primary">
                            {isReviewMode ? `${reviewedTodayCount} / ${totalDueToday}` : `${currentQuestionIdx + 1} / ${questions.length}`} items
                        </div>
                    </div>
                    <div className="size-10 flex items-center justify-end relative">
                        {lastGainedXP && (
                            <div key={xpNotificationKey} className="absolute -top-4 right-0 pointer-events-none">
                                <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/20 animate-float-up-fade whitespace-nowrap border border-amber-200 dark:border-amber-500/30">
                                    +{lastGainedXP} XP
                                </div>
                            </div>
                        )}
                        <span className="material-symbols-outlined text-primary">workspace_premium</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24">
                <div className="w-full max-w-lg space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-6xl md:text-7xl font-black text-charcoal dark:text-white tracking-tighter">
                            {currentQuestion.word}
                        </h1>
                        <p className="text-xl text-ghost-grey dark:text-gray-400 font-medium">
                            {currentQuestion.meaning}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {currentQuestion.options.map((option: string, idx: number) => {
                            const isCorrect = option === currentQuestion.word;
                            const isSelected = selectedIdx === idx;

                            let buttonClass = "w-full p-6 text-left rounded-3xl font-bold transition-all border-2 ";
                            if (!answered) {
                                buttonClass += "bg-white dark:bg-slate-900 border-transparent hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 shadow-sm";
                            } else {
                                if (isCorrect) buttonClass += "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30";
                                else if (isSelected) buttonClass += "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30";
                                else buttonClass += "bg-white dark:bg-slate-900 border-transparent opacity-40";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(idx)}
                                    disabled={answered}
                                    className={buttonClass}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="size-8 rounded-full border-2 border-current flex items-center justify-center text-xs">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span>{option}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {answered && (
                        <button
                            onClick={handleNext}
                            className="w-full py-5 bg-charcoal dark:bg-white text-white dark:text-charcoal rounded-3xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Next Question
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default VocabularyQuizPage;
